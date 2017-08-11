import { ensureTableData } from '../dynamodb/table';
import { generateName } from '../name';
import { dummyData } from '../table/tables';

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
