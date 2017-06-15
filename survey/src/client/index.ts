import fetch from '@honesty-store/service/lib/fetch';

export type ItemId = string;
export type SurveyId = string;
export type SurveyResponseId = string; // ${userId}--${surveyId}

export type ItemPair = [ItemId, ItemId];

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
