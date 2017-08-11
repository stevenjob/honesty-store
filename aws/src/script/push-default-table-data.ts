import { ensureTableData } from '../dynamodb/table';
import { dummyData } from '../table/tables';
import { generateName } from '../name';

export default async ({ branch }) => {
  for (const dir in dummyData) {
    if (!dummyData.hasOwnProperty(dir)) {
      continue;
    }

    await ensureTableData({
      data: dummyData[dir],
      tableName: generateName({ branch, dir })
    });
  }
};
