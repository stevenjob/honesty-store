// tslint:disable:no-console
import * as program from 'commander';

import { createServiceKey } from '@honesty-store/service/lib/key';
import { issueSupportRequestedRefund } from '@honesty-store/transaction';

const issueRefund = async (transactionId, reason, dateLimit) => {
  const key = createServiceKey({ service: 'refund-script' });
  try {
    const response = await issueSupportRequestedRefund(key, transactionId, reason, dateLimit);
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

program.command('issue [transactionId] [reason] [dateLimit]')
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
