import { taskList } from './list';
import { tasksDescribe } from './describe';
import { containerInstanceDescribe } from '../instance';
import { ec2InstanceList } from '../../ec2/instance';

export const dumpTaskUrls = async (clusterName) => {
  const taskArnList = await taskList({ cluster: clusterName });

  if (taskArnList.length === 0) {
    console.log(`<no tasks>`);
    return;
  }

  const tasks = await tasksDescribe({ tasks: taskArnList, cluster: clusterName });

  for (const task of tasks) {
    // get the container instance, resolve to an ec2 instance, get its IP, then dump network bindings
    const containerInstances = await containerInstanceDescribe({
      containerInstances: [task.containerInstanceArn],
      cluster: clusterName
    });
    const containerInstance = containerInstances[0];

    const ec2Instances = await ec2InstanceList({ instanceIds: [ containerInstance.ec2InstanceId ] });
    const ec2Instance = ec2Instances[0];

    const networkBindings = task.containers
      .map((container) => container.networkBindings)
      .reduce((result, bindings) => result.concat(bindings), []);

    // note: http assumed
    networkBindings.forEach((networkBinding) =>
      console.log(`http://${ec2Instance.PublicDnsName}:${networkBinding.hostPort}/`));
  }
};
