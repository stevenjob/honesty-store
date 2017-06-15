import { config, DynamoDB } from 'aws-sdk';

import { createAssertValidUuid } from '@honesty-store/service/lib/assert';
import { lambdaRouter, LambdaRouter } from '@honesty-store/service/lib/lambdaRouter';
import { SurveyResponse } from './client';
import { getSurvey, getSurveys } from './surveys';

config.region = process.env.AWS_REGION;

const assertValidUserId = createAssertValidUuid('userId');
const assertValidItemId = createAssertValidUuid('itemId');
const assertValidSurveyId = createAssertValidUuid('surveyId');

const splitSurveyResponseId = (id) => {
  try {
    const [ userId, surveyId, third ] = id.split('--');

    assertValidUserId(userId);
    assertValidSurveyId(surveyId);

    if (third) {
      throw new Error('too many "--"');
    }

    return { userId, surveyId };
  } catch (e) {
    throw new Error(`Invalid SurveyResponseId '${id}'`);
  }
};

const assertValidSurveyResponseId = (id) => void splitSurveyResponseId(id);

const createSurveyResponseId = ({ userId, surveyId }) => `${userId}--${surveyId}`;

const assertValidSurveyResponse = (response: SurveyResponse) => {
  const { id, answers, ...rest } = response;

  if (Object.keys(rest).length > 0) {
    throw new Error('Extra keys in survey response');
  }

  assertValidSurveyResponseId(id);

  const survey = getSurvey(splitSurveyResponseId(id).surveyId);
  if (survey.questions.length !== answers.length) {
    throw new Error(`Mismatch of survey questions with answers (${survey.questions.length} vs ${answers.length})`);
  }

  for (const answer of answers) {
    assertValidItemId(answer);
  }
};

const scanForSurveyResponsess = async (ids) => {
  const response = await new DynamoDB.DocumentClient()
    .batchGet({
      RequestItems: {
        [process.env.TABLE_NAME]: {
          Keys: [
            ...ids.map(id => ({ id }))
          ],
          ProjectionExpression: 'id, answers'
        }
      }
    })
    .promise();

  return <SurveyResponse[]>response.Responses[process.env.TABLE_NAME];
};

const permitSurveyForUser = (userId) => {
  const allowed = [
    //'f9c8b541-0a30-4adc-8e0d-887e6db9f301', // price.c@gmail.com
    //'77fcd8c1-63df-48fa-900a-0c0bb57687b3', // price.c+100@gmail.com
    //'c71733c4-dc05-42f9-848e-fb53bf08a2d7', // sam.burnstone@gmail.com
    //'a8960624-7558-468c-9791-984ca0c620ba', // robpilling@gmail.com
    //'42dfedaa-ca40-4c86-8fa6-fabe71ac209e', // gascott@gmail.com
    //'defabb87-e084-4334-91da-18778e3f2e78'  // colin.eberhardt@gmail.com
  ];

  return allowed.indexOf(userId) !== -1;
};

const surveysForUser = async (userId) => {
  assertValidUserId(userId);

  if (!permitSurveyForUser(userId)) {
    return [];
  }

  const allSurveys = getSurveys();

  const surveyResponses = await scanForSurveyResponsess(
    allSurveys.map(survey => createSurveyResponseId({ userId, surveyId: survey.id })));

  const responseIdsMap = new Map();
  surveyResponses
    .map(response => splitSurveyResponseId(response.id).surveyId)
    .forEach(id => responseIdsMap.set(id, true));

  return allSurveys
    .filter(survey => !responseIdsMap.has(survey.id))
    .sort((a, b) => b.priority - a.priority);
};

const put = async (response: SurveyResponse) => {
  await new DynamoDB.DocumentClient()
    .put({
      TableName: process.env.TABLE_NAME,
      Item: response
    })
    .promise();
};

const acceptUserSurvey = async ({ userId, answers, surveyId }) => {
  assertValidUserId(userId);

  const response = {
    id: createSurveyResponseId({ userId, surveyId }),
    answers
  };
  assertValidSurveyResponse(response);

  const [surveys] = await Promise.all([
    surveysForUser(userId),
    put(response)
  ]);

  return surveys.filter(({ id }) => surveyId !== id);
};

export const router: LambdaRouter = lambdaRouter('survey', 1);

router.get(
  '/:userId',
  async (_key, { userId }) => surveysForUser(userId)
);

router.post(
  '/:userId',
  async (_key, { userId }, { answers, surveyId }) =>
    acceptUserSurvey({ userId, answers, surveyId })
);
