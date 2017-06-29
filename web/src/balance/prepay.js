export const determinePrepay = creditLimit =>
  creditLimit.hard === 0 && creditLimit.soft === 0;
