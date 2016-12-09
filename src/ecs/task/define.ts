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

const registerTaskDefinition = async ({ image, family }) => {
  const ecs = new ECS({ apiVersion: '2014-11-13' });

  try {
    const existingDefinition = await ecs
      .describeTaskDefinition({ taskDefinition: `${family}` })
      .promise();

    if (existingDefinition.taskDefinition.family === family
    && existingDefinition.taskDefinition.containerDefinitions[0].image === image)
    {
      return `${family}:${existingDefinition.taskDefinition.revision}`;
    }
    // else: mismatching definition, fall through below to (re)create it

  } catch (e) {
    if (e.code !== 'ClientException') {
      throw e;
    }

    // no definition found, fall through and create one
  }

  return createTaskDefinition({ family, image })
};

export default registerTaskDefinition
