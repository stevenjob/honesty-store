import { clusterDescribe } from './cluster';
import { serviceList, serviceDescribe } from '../service';
import { containerInstanceList, containerInstanceDescribe } from '../instance';

export const dumpClusterInformation = async (clusterName) => {
  const cluster = await clusterDescribe({ cluster: clusterName })

  const serviceArnList = await serviceList({ cluster: clusterName });
  const instanceArnList = await containerInstanceList({ cluster: clusterName });

  console.log(`"${clusterName}": ${cluster.runningTasksCount} running task(s), `
              + `${serviceArnList.length} service(s), `
              + `${instanceArnList.length} instance(s)`);

  if (serviceArnList.length) {
    const services = await serviceDescribe({ services: serviceArnList, cluster: clusterName });

    for (const service of services) {
      console.log(`  service "${service.serviceName}":\n`
                  + `    status: ${service.status}\n`
                  + `    runningCount: ${service.runningCount}\n`
                  + `    taskDefinition: ${service.taskDefinition}\n`
                  + `    createdAt: ${service.createdAt}`);
    }
  }

  if (instanceArnList.length) {
    const instances = await containerInstanceDescribe({
      containerInstances: instanceArnList, cluster: clusterName
    });

    for (const instance of instances) {
      console.log(`  instance ${instance.containerInstanceArn}\n`
                  + `    ec2-instance: ${instance.ec2InstanceId}\n`
                  + `    status: ${instance.status}\n`
                  + `    runningTasksCount: ${instance.runningTasksCount}\n`
                  + `    pendingTasksCount: ${instance.pendingTasksCount}`);
    }
  }
};
