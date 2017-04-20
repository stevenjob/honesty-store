import { config, SES } from 'aws-sdk';
import cruftDDB from 'cruft-ddb';
import bodyParser = require('body-parser');
import express = require('express');
import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');
import { stores } from '../../api/src/services/store'; // until we have the store service
import { CodedError } from '../../service/src/error';
import { createServiceKey } from '../../service/src/key';
import { error, info } from '../../service/src/log';
import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { createAccount } from '../../transaction/src/client';
import { TEST_DATA_USER_ID, User, UserProfile, UserWithAccessAndRefreshTokens, UserWithAccessToken } from './client';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyMagicLinkToken, verifyRefreshToken } from './token';

config.region = process.env.AWS_REGION;

const cruft = cruftDDB<InternalUser>({
  tableName: process.env.TABLE_NAME
});

interface InternalUser extends User {
  version: number;
  refreshToken: string;
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
  const storeCodes = stores.map(({ code }) => code);
  if (storeCodes.indexOf(defaultStoreId) === -1) {
    throw new CodedError('StoreNotFound', `Invalid defaultStoreId ${defaultStoreId}`);
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
    refreshToken,
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

const getInternal = async ({ userId }) => {
  assertValidUserId(userId);

  return await cruft.read({ id: userId });
};

const get = async ({ userId }): Promise<User> => externaliseUser(await getInternal({ userId }));

const getByAccessToken = async ({ key, accessToken }): Promise<User> => {
  const { userId } = verifyAccessToken(key, accessToken);
  assertValidUserId(userId);

  // We trust the JWT signing to validate access tokens
  return await get({ userId });
};

const getByRefreshToken = async ({ key, refreshToken }): Promise<UserWithAccessToken> => {
  const { userId, refreshToken: token } = verifyRefreshToken(key, refreshToken);
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

const getByMagicLinkToken = async ({ key, magicLinkToken }): Promise<UserWithAccessAndRefreshTokens> => {
  const { userId } = verifyMagicLinkToken(key, magicLinkToken);
  assertValidUserId(userId);

  const user = await getInternal({ userId });

  return externaliseUserWithAccessTokenAndRefreshToken(user);
};

const scanByEmailAddress = async ({ emailAddress }) => {
  assertValidEmailAddress(emailAddress);

  try {
    return await cruft.find({ emailAddress });
  } catch (e) {
    if (e.message !== 'No value found') {
      throw e;
    }
    throw new CodedError('EmailNotFound', `User not found ${emailAddress}`);
  }
};

const createUser = async ({ userId, userProfile }): Promise<UserWithAccessAndRefreshTokens> => {
  assertValidUserProfile(userProfile);

  const user: InternalUser = await cruft.create({
    id: userId,
    version: 0,
    refreshToken: uuid(),
    accountId: userProfile.accountId,
    defaultStoreId: userProfile.defaultStoreId,
    emailAddress: userProfile.emailAddress
  });

  return externaliseUserWithAccessTokenAndRefreshToken(user);
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
    ...userProfile
  };

  if (originalUser.emailAddress == null && updatedUser.emailAddress != null) {
    const account = await createAccount(key, uuid());
    updatedUser.accountId = account.id;
  }

  return externaliseUser(await cruft.update(updatedUser));
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

  await cruft.update(loggedoutUser);

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
  async (key, { accessToken }) => await getByAccessToken({ key, accessToken })
);

router.get(
  '/refreshToken/:refreshToken',
  serviceAuthentication,
  async (key, { refreshToken }) => await getByRefreshToken({ key, refreshToken })
);

router.get(
  '/magicLink/:magicLinkToken',
  serviceAuthentication,
  async (key, { magicLinkToken }) => await getByMagicLinkToken({ key, magicLinkToken })
);

router.get(
  '/emailAddress/:emailAddress',
  serviceAuthentication,
  async (_key, { emailAddress }) => externaliseUser(await scanByEmailAddress({ emailAddress }))
);

router.post(
  '/',
  serviceAuthentication,
  async (_key, { }, { userId, ...userProfile }) => await createUser({ userId, userProfile })
);

router.put(
  '/:userId',
  serviceAuthentication,
  async (key, { userId }, userProfile) => await updateUser({ key, userId, userProfile })
);

router.post(
  '/magicLink/:emailAddress',
  serviceAuthentication,
  async (key, { emailAddress }, { }) => {
    await sendMagicLinkEmail({ key, emailAddress });
    return {};
  }
);

router.post(
  '/logout/:userId',
  serviceAuthentication,
  async (_key, { userId }, { }) => await logoutUser(userId)
);

app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  get({ userId: TEST_DATA_USER_ID })
    .then(() => {
      res.sendStatus(200);
    })
    .catch((e) => {
      res.sendStatus(500);
      error(createServiceKey({ service: 'user' }), 'LB probe error', e);
    });
});

app.listen(3000);
