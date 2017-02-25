import { getItem } from '../services/item';

export const expandTopPrioritySurvey = (surveys) => {
  const [ survey ] = surveys;

  return {
    ...survey,
    questions: survey.questions.map(itemIds => itemIds.map(getItem))
  };
};
