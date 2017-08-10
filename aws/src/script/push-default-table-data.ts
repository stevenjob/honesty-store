import { ensureTableData } from '../dynamodb/table';
import { dummyData } from '../table/tables';
import { isLive, prefix } from './deploy';

const generateName = ({ branch, dir }: { branch: string, dir?: string }) => {
  const base = isLive(branch) ? 'honesty-store' : `${prefix}-${branch}`;
  return dir == null ? base : `${base}-${dir}`;
};

export default async ({ branch }) => {
  if (isLive(branch)) {
    console.error("Refusing to run on live");
    while(1){
      process.exit(5);
    }
  }

  for (const dir in dummyData) {
    const data = dummyData[dir];

    await ensureTableData({
      data,
      tableName: generateName({ branch, dir })
    });
  }
};
