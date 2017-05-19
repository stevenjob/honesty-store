import fetch from '../../../service/src/fetch';
import isUUID = require('validator/lib/isUUID');

export interface Store {
  id: string;
  code: string;
  agentId: string;
  version: number;
}

import { lambdaBaseUrl } from '../../../service/src/baseUrl';

const { get } = fetch('store', lambdaBaseUrl);

export const getStoreFromCode = (key, code: string) =>
  get<Store>(1, key, `/code/${code}`);

export const getStoreFromId = (key, id: string) =>
  get<Store>(1, key, `/${id}`);

export const migrateStoreCodeToId = storeCodeOrId => {
  if (isUUID(storeCodeOrId)) {
    return storeCodeOrId;
  }

  const migration = {
    'sl-edn': 'f79ff70c-2103-43f9-922d-d54a16315361',
    'sl-ncl': 'b8d7305b-bb7d-4bbe-8b2f-5e94c6267bb6',
    'sl-ldn': '1cfb21d8-52d8-4eee-98ce-740c466bfc0e',
    'sl-brs': '9a61dad3-f05c-46aa-a7e4-14311e9cccc5',
    'dev-test': '1e7c9c0d-a9be-4ab7-8499-e57bf859978d'
  };
  const id = migration[storeCodeOrId];
  if (!id) {
    throw new Error(`Couldn't migrate store code '${storeCodeOrId}'`);
  }
  return id;
};
