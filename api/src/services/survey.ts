import { getItem } from '../services/item';

export const expandTopPrioritySurvey = (surveys) => {
  if (surveys.length === 0) {
    return null;
  }

  const [ survey ] = surveys;

  return {
    ...survey,
    questions: survey.questions.map(itemIds => itemIds.map(getItem))
  };
};
