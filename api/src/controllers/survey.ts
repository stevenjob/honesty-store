import { acceptUserSurvey } from '../../../survey/src/client';
import { authenticateAccessToken } from '../middleware/authenticate';

export default (router) => {
  router.post(
    '/survey',
    authenticateAccessToken,
    async (key, _params, { surveyId, answers }, { user }) =>
      await acceptUserSurvey(key, user.id, surveyId, answers)
    );
};
