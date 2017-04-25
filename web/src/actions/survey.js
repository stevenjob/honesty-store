import apifetch from './apirequest';
import history from '../history';

export const SURVEY_REQUEST = 'SURVEY_REQUEST';
export const SURVEY_SUCCESS = 'SURVEY_SUCESSS';
export const SURVEY_FAILURE = 'SURVEY_FAILURE';

const surveyRequest = () => ({
  type: SURVEY_REQUEST
});

const surveySuccess = (response) => ({
  type: SURVEY_SUCCESS,
  response
});

const surveyFailure = (error) => ({
  type: SURVEY_FAILURE,
  error
});

export const submitSurvey = ({ survey, answers }) => async (dispatch, getState) => {
  dispatch(surveyRequest());
  try {
    const response = await apifetch({
      url: '/api/v1/survey',
      body: {
        surveyId: survey.id,
        answers: answers
      },
      getToken: () => getState().accessToken
    }, dispatch, getState);

    dispatch(surveySuccess(response));
    history.replace(`/survey/complete`);
  } catch (e) {
    dispatch(surveyFailure(e));
  }
};
