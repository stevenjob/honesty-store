import { acceptUserSurvey } from '@honesty-store/survey/src/client';
import { authenticateAccessToken } from '../middleware/authenticate';
import { expandTopPrioritySurvey } from '../services/survey';

export default (router) => {
  router.post(
    '/survey',
    authenticateAccessToken,
    async (key, _params, { surveyId, answers }, { user }) => {
      const surveys = await acceptUserSurvey(key, user.id, surveyId, answers);
      return await expandTopPrioritySurvey(surveys);
    });
};
