import { ECS } from 'aws-sdk';

const createTaskDefinition = async ({ image, family }) => {
  const containerDefinitions = [
    {
      name: 'container',
      image,
      memory: 128,
      essential: true,
      portMappings: [
        {
          hostPort: 8080,
          containerPort: 8080,
          protocol: 'tcp'
        }
      ]
    }
  ];

  const definitionResponse = await new ECS({ apiVersion: '2014-11-13' })
    .registerTaskDefinition({ family, containerDefinitions })
    .promise();

  return `${family}:${definitionResponse.taskDefinition.revision}`;
}

/*
requires:
"Action": "ecs:RegisterTaskDefinition", "ecs:DescribeTaskDefinition"
*/
const registerTaskDefinition = async ({ image, family }) => {
  const ecs = new ECS({ apiVersion: '2014-11-13' });

  const definitionArns = (await ecs
    .listTaskDefinitions({ familyPrefix: `${family}` })
    .promise())
    .taskDefinitionArns;

  const deregisterDefinition = (definitionArn) => {
    return ecs.deregisterTaskDefinition({ taskDefinition: definitionArn }).promise()
  };

  const deregisterPromises = definitionArns.map(deregisterDefinition);

  await Promise.all(deregisterPromises);

  return createTaskDefinition({ family, image })
};

export default registerTaskDefinition
