import { config, DynamoDB } from 'aws-sdk';
import bodyParser = require('body-parser');
import express = require('express');
import isUUID = require('validator/lib/isUUID');

import { serviceAuthentication, serviceRouter } from '../../service/src/router';
import { SurveyResponse } from './client';
import { getSurvey, getSurveys } from './surveys';

config.region = process.env.AWS_REGION;

const createAssertValidUuid = (name) =>
  (uuid) => {
    if (uuid == null || !isUUID(uuid, 4)) {
      throw new Error(`Invalid ${name} ${uuid}`);
    }
  };

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

const surveysForUser = async (userId) => {
  assertValidUserId(userId);

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

const assertConnectivity = async () => {
  await new DynamoDB.DocumentClient()
    .get({
      TableName: process.env.TABLE_NAME,
      Key: {
        id: 'non-existent-id'
      }
    })
    .promise();
};

const router = serviceRouter('survey', 1);

router.get(
  '/:userId',
  serviceAuthentication,
  async (_key, { userId }) => surveysForUser(userId)
);

router.post(
  '/:userId',
  serviceAuthentication,
  async (_key, { userId }, { answers, surveyId }) =>
    acceptUserSurvey({ userId, answers, surveyId })
);

const app = express();
app.use(bodyParser.json());
app.use(router);

// send healthy response to load balancer probes
app.get('/', (_req, res) => {
  assertConnectivity()
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

app.listen(3000);
