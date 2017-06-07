// tslint:disable:no-console
import * as program from 'commander';

import { createServiceKey } from '@honesty-store/service/src/key';
import { refundTransaction } from '@honesty-store/transaction/src/client/index';

const issueRefund = async (transactionId) => {
  const key = createServiceKey({ service: 'refund-script' });
  try {
    const response = await refundTransaction(key, transactionId);
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

program.command('issue [transactionId]')
  .description('issues a refund of the given transactionId')
  .action(issueRefund);

program.command('*')
  .action(() => {
    program.help();
  });

program.parse(process.argv);

if (program.args.length === 0) {
  program.help();
}
