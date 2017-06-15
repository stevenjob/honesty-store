import { getItem } from '@honesty-store/item';

export const expandTopPrioritySurvey = async (surveys) => {
  if (surveys.length === 0) {
    return null;
  }

  const [ survey ] = surveys;

  return {
    ...survey,
    questions: await Promise.all(survey.questions.map(itemIds => itemIds.map(getItem)))
  };
};
