import { config, DynamoDB, SES } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');
import { createServiceKey } from '../../service/src/key';
import { error, info } from '../../service/src/log';
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { storeList } from '../../service/src/storeList';
import { createAccount } from '../../transaction/src/client';
import { TEST_DATA_USER_ID, User, UserProfile, UserWithAccessAndRefreshTokens, UserWithAccessToken } from './client';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from './token';

config.region = process.env.AWS_REGION;

interface InternalUser extends User {
  created: number;
  refreshToken: string;
  version: number;
}

const createAssertValidUuid = (name) =>
  (uuid) => {
    if (uuid == null || !isUUID(uuid, 4)) {
      throw new Error(`Invalid ${name} ${uuid}`);
    }
  };

const assertValidUserId = createAssertValidUuid('userId');
const assertValidRefreshToken = createAssertValidUuid('refreshToken');

const assertValidDefaultStoreId = (defaultStoreId) => {
  if (storeList.indexOf(defaultStoreId) === -1) {
    throw new Error(`Invalid defaultStoreId ${defaultStoreId}`);
  }
};

const assertValidEmailAddress = (emailAddress) => {
  if (emailAddress == null || !isEmail(emailAddress)) {
    throw new Error(`Invalid emailAddress ${emailAddress}`);
  }
};

const assertValidUserProfile = (userProfile: UserProfile) => {
  if (Object.keys(userProfile).some(key => ['defaultStoreId', 'emailAddress'].indexOf(key) === -1)) {
    throw new Error('Invalid user profile');
  }
  if ('defaultStoreId' in userProfile) {
    assertValidDefaultStoreId(userProfile.defaultStoreId);
  }
  if ('emailAddress' in userProfile) {
    assertValidEmailAddress(userProfile.emailAddress);
  }
  return true;
};

const externaliseUser = (user: InternalUser): User => {
  const {
    created,
    refreshToken,
    version,
    ...remainingProps
  } = user;
  return remainingProps;
};

const externaliseUserWithAccessToken = (user: InternalUser): UserWithAccessToken => ({
  ...externaliseUser(user),
  accessToken: signAccessToken({ userId: user.id })
});

const externaliseUserWithAccessTokenAndRefreshToken = (user: InternalUser): UserWithAccessAndRefreshTokens => ({
  ...externaliseUserWithAccessToken(user),
  refreshToken: signRefreshToken({ userId: user.id, refreshToken: user.refreshToken })
});

const getInternal = async ({ userId }): Promise<InternalUser> => {
  assertValidUserId(userId);

  const response = await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: userId
      }
    })
    .promise();

  const user = <InternalUser>response.Item;

  if (user == null) {
    throw new Error(`User not found ${userId}`);
  }

  return user;
};

const get = async ({ userId }): Promise<User> => externaliseUser(await getInternal({ userId }));

const getByAccessToken = async ({ accessToken }): Promise<User> => {
  const { userId } = verifyAccessToken(accessToken);
  assertValidUserId(userId);

  // We trust the JWT signing to validate access tokens
  return await get({ userId });
};

const getByRefreshToken = async ({ refreshToken }): Promise<UserWithAccessToken> => {
  const { userId, refreshToken: token } = verifyRefreshToken(refreshToken);
  assertValidUserId(userId);
  assertValidRefreshToken(token);

  const user = await getInternal({ userId });

  /* tslint:disable possible-timing-attack - not a concern for now, due to our tokens being pretty lengthy and we should be
  able to identify an attack by checking the logs */
  // As well as the JWT signing, we validate a stored uuid for refresh tokens
  if (token !== user.refreshToken) {
    throw new Error('Invalid refreshToken');
  }
  /* tslint:enable possible-timing-attack */

  return externaliseUserWithAccessToken(user);
};

const getByMagicLinkToken = async ({ magicLinkToken }): Promise<UserWithAccessAndRefreshTokens> => {
  const { userId } = verifyAccessToken(magicLinkToken);
  assertValidUserId(userId);

  const user = await getInternal({ userId });

  return externaliseUserWithAccessTokenAndRefreshToken(user);
};

const scanByEmailAddress = async ({ emailAddress }) => {
  assertValidEmailAddress(emailAddress);

  const response = await new DynamoDB.DocumentClient()
    .scan({
      TableName: process.env.TABLE_NAME,
      FilterExpression: 'emailAddress = :emailAddress',
      ExpressionAttributeValues: {
        ':emailAddress': emailAddress
      }
    })
    .promise();

  if (response.Items.length > 1) {
    throw new Error('Multiple users found with the same emailAddress');
  }

  const user = <InternalUser>response.Items[0];

  if (user == null) {
    throw new Error(`User not found ${emailAddress}`);
  }

  return user;
};

const createUser = async ({ userId, userProfile }): Promise<UserWithAccessAndRefreshTokens> => {
  assertValidUserProfile(userProfile);

  const user: InternalUser = {
    id: userId,
    created: Date.now(),
    refreshToken: uuid(),
    version: 0,
    accountId: userProfile.accountId,
    defaultStoreId: userProfile.defaultStoreId,
    emailAddress: userProfile.emailAddress
  };

  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: user
    })
    .promise();

  return externaliseUserWithAccessTokenAndRefreshToken(user);
};

const update = async ({ user, originalVersion }: { user: InternalUser, originalVersion: number }) => {
  await new DynamoDB.DocumentClient()
    .update({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: user.id
      },
      ConditionExpression: 'version=:originalVersion',
      UpdateExpression: 'set accountId=:accountId, defaultStoreId=:defaultStoreId, emailAddress=:emailAddress,\
            refreshToken=:refreshToken, version=:updatedVersion',
      ExpressionAttributeValues: {
        ':originalVersion': originalVersion,
        ':accountId': user.accountId,
        ':defaultStoreId': user.defaultStoreId,
        ':emailAddress': user.emailAddress,
        ':refreshToken': user.refreshToken,
        ':updatedVersion': user.version
      }
    })
    .promise();

  return user;
};

const updateUser = async ({ key, userId, userProfile }): Promise<User> => {
  assertValidUserId(userId);

  const originalUser = await getInternal({ userId });

  if (originalUser == null) {
    throw new Error(`User not found ${userId}`);
  }

  assertValidUserProfile(userProfile);

  const updatedUser: InternalUser = {
    ...originalUser,
    ...userProfile,
    id: userId,
    refreshToken: originalUser.refreshToken,
    version: originalUser.version + 1
  };

  if (originalUser.emailAddress == null && updatedUser.emailAddress != null) {
    const account = await createAccount(key, uuid());
    updatedUser.accountId = account.id;
  }

  return externaliseUser(await update({ user: updatedUser, originalVersion: originalUser.version }));
};

const sendMagicLinkEmail = async ({ key, emailAddress }) => {
  const user = await scanByEmailAddress({ emailAddress });

  const message = `( https://honesty.store )

*********************************************************************
Tap the button below on your phone to log in to honesty.store
*********************************************************************

Log in to honesty.store ( https://honesty.store/${user.defaultStoreId}?code=${signAccessToken({ userId: user.id })} )
`;
  const response = await new SES({ apiVersion: '2010-12-01' })
    .sendEmail({
      Destination: {
        ToAddresses: [user.emailAddress]
      },
      Source: 'no-reply@honesty.store',
      Message: {
        Subject: { Charset: 'UTF-8', Data: 'Log in to honesty.store' },
        Body: { Text: { Charset: 'UTF-8', Data: message } }
      }
    })
    .promise();

  info(key, `Magic link email sent to ${emailAddress}: ${response.MessageId}`);

  return response.MessageId;
};

const logoutUser = async (userId) => {
  const originalUser = await getInternal({ userId });

  if (originalUser == null) {
    throw new Error(`User not found ${userId}`);
  }

  // can't clear access token, but it'll expire soon enough
  const loggedoutUser: InternalUser = {
    ...originalUser,
    refreshToken: uuid()
  };

  await update({ user: loggedoutUser, originalVersion: originalUser.version });

  return {};
};

const app = express();

app.use(bodyParser.json());

const router = serviceRouter('user', 1);

router.get(
  '/:userId',
  serviceAuthentication,
  async (_key, { userId }) => get({ userId })
);

router.get(
  '/accessToken/:accessToken',
  serviceAuthentication,
  async (_key, { accessToken }) => await getByAccessToken({ accessToken })
);

router.get(
  '/refreshToken/:refreshToken',
  serviceAuthentication,
  async (_key, { refreshToken }) => await getByRefreshToken({ refreshToken })
);

router.get(
  '/magicLink/:magicLinkToken',
  serviceAuthentication,
  async (_key, { magicLinkToken }) => await getByMagicLinkToken({ magicLinkToken })
);

router.get(
  '/emailAddress/:emailAddress',
  serviceAuthentication,
  async (_key, { emailAddress }) => externaliseUser(await scanByEmailAddress({ emailAddress }))
);

router.post(
  '/',
  serviceAuthentication,
  async (_key, {}, { userId, ...userProfile}) => await createUser({ userId, userProfile })
);

router.put(
  '/:userId',
  serviceAuthentication,
  async (key, { userId }, userProfile) => await updateUser({ key, userId, userProfile })
);

router.post(
  '/magicLink/:emailAddress',
  serviceAuthentication,
  async (key, { emailAddress }, {}) => {
    await sendMagicLinkEmail({ key, emailAddress });
    return {};
  }
);

router.post(
  '/logout/:userId',
  serviceAuthentication,
  async (_key, { userId }, {}) => await logoutUser(userId)
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  get({ userId: TEST_DATA_USER_ID })
    .then(() => {
      res.send(200);
    })
    .catch((e) => {
      res.send(500);
      error(createServiceKey({ service: 'user' }), 'LB probe error', e);
    });
});

app.listen(3000);
