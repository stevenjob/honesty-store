import fetch from '../../../service/src/fetch';

type ItemId = string;
type SurveyId = string;
type SurveyResponseId = string; // ${userId}--${surveyId}

type ItemPair = [ItemId, ItemId];

export interface Survey {
  id: SurveyId;
  priority: number; // bigger number means more important
  questions: ItemPair[];
}

export interface SurveyResponse {
  id: SurveyResponseId;
  answers: ItemId[];
}

const { get, post } = fetch('survey');

export const getUserSurveys = (key, userId) =>
  get<Survey[]>(1, key, `/${userId}`);

export const acceptUserSurvey = (key, userId: string, surveyId: string, answers: ItemPair[]) =>
  post<Survey[]>(1, key, `/${userId}`, { surveyId, answers });
