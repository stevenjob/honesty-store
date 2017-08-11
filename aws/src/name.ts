export const prefix = 'hs';

export const isLive = (branch) => branch === 'live';

export const generateName = ({ branch, dir }: { branch: string, dir?: string }) => {
  const base = isLive(branch) ? 'honesty-store' : `${prefix}-${branch}`;
  return dir == null ? base : `${base}-${dir}`;
};
