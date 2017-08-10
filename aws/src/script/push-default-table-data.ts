import { ensureTableData } from '../dynamodb/table';
import { dummyData } from '../table/tables';
import { isLive, prefix } from './deploy';

const generateName = ({ branch, dir }: { branch: string, dir?: string }) => {
  const base = isLive(branch) ? 'honesty-store' : `${prefix}-${branch}`;
  return dir == null ? base : `${base}-${dir}`;
};

export default async ({ branch }) => {
  for (const dir in dummyData) {
    if (!dummyData.hasOwnProperty(dir)) {
      continue;
    }

    const data = dummyData[dir];

    await ensureTableData({
      data,
      tableName: generateName({ branch, dir })
    });
  }
};
