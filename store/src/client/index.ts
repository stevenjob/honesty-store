import fetch from '../../../service/src/fetch';

export interface Store {
  id: string;
  code: string;
  agentId: string;
}

import { lambdaBaseUrl } from '../../../service/src/baseUrl';

const { get } = fetch('store', lambdaBaseUrl);

export const getStoreFromCode = (key, code: string) =>
  get<Store>(1, key, `/code/${code}`);

export const getStoreFromId = (key, id: string) =>
  get<Store>(1, key, `/id/${id}`);
