import ms = require('ms');
import { assertValidEmailAddress, createAssertValidUuid } from '@honesty-store/service/lib/assert';
import { sendEmail } from '@honesty-store/service/lib/email';
import { CodedError } from '@honesty-store/service/lib/error';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { info } from '@honesty-store/service/lib/log';
import { migrateStoreCodeToId } from '@honesty-store/service/lib/store';
import { getStoreFromId } from '@honesty-store/store';
import { createAccount } from '@honesty-store/transaction';
import cruftDDB from 'cruft-ddb';
import { v4 as uuid } from 'uuid';
import { User, UserProfile, UserWithAccessAndRefreshTokens, UserWithAccessToken } from './client';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyMagicLinkToken, verifyRefreshToken } from './token';

const cruft = cruftDDB<InternalUser>({
  tableName: process.env.TABLE_NAME
});

// ttl is in epoch seconds
const ttl = (period: string): number => Math.round((Date.now() + ms(period)) / 1000);

interface InternalUser extends User {
  version: number;
  refreshToken: string;
  ttl: number;
}

const assertValidUserId = createAssertValidUuid('userId');
const assertValidRefreshToken = createAssertValidUuid('refreshToken');
const assertValidDefaultStoreId = createAssertValidUuid('storeId');

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

  const user = await cruft.read({ id: userId });

  return {
    ...user,
    defaultStoreId: migrateStoreCodeToId(user.defaultStoreId),
    flags: user.flags || {}
  };
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
    throw new CodedError('UserLoggedOut', `Supplied refresh token does not match the one associated with user ${userId}`);
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
    emailAddress: userProfile.emailAddress,
    flags: {},
    ttl: ttl('7 days')
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
    ...userProfile,
    ttl: ttl('10 years')
  };

  if (originalUser.emailAddress == null && updatedUser.emailAddress != null) {
    const account = await createAccount(key, uuid());
    updatedUser.accountId = account.id;
  }

  return externaliseUser(await cruft.update(updatedUser));
};

const sendMagicLinkEmail = async ({ key, emailAddress, storeCode }) => {
  const user = await scanByEmailAddress({ emailAddress });

  const requestedStoreCode = storeCode || (await getStoreFromId(key, storeCode)).code;

  const message = `( https://honesty.store )

*********************************************************************
Tap the button below on your phone to log in to honesty.store
*********************************************************************

Log in to honesty.store ( https://honesty.store/${requestedStoreCode}?code=${signAccessToken({ userId: user.id })} )
`;
  const messageId = await sendEmail({
    to: [user.emailAddress],
    subject: 'Log in to honesty.store',
    message
  });

  info(key, `Magic link email sent to ${emailAddress}: ${messageId}`);

  return messageId;
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

export const router: LambdaRouter = lambdaRouter('user', 1);

router.get(
  '/:userId',
  async (_key, { userId }) => get({ userId })
);

router.get(
  '/accessToken/:accessToken',
  async (key, { accessToken }) => await getByAccessToken({ key, accessToken })
);

router.get(
  '/refreshToken/:refreshToken',
  async (key, { refreshToken }) => await getByRefreshToken({ key, refreshToken })
);

router.get(
  '/magicLink/:magicLinkToken',
  async (key, { magicLinkToken }) => await getByMagicLinkToken({ key, magicLinkToken })
);

router.get(
  '/emailAddress/:emailAddress',
  async (_key, { emailAddress }) => externaliseUser(await scanByEmailAddress({ emailAddress }))
);

router.post(
  '/',
  async (_key, { }, { userId, ...userProfile }) => await createUser({ userId, userProfile })
);

router.put(
  '/:userId',
  async (key, { userId }, userProfile) => await updateUser({ key, userId, userProfile })
);

router.post(
  '/magicLink/:emailAddress/:storeCode',
  async (key, { emailAddress, storeCode }, { }) => {
    await sendMagicLinkEmail({ key, emailAddress, storeCode });
    return {};
  }
);

router.post(
  '/logout/:userId',
  async (_key, { userId }, { }) => await logoutUser(userId)
);
