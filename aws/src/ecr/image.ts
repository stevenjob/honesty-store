import { ECR } from 'aws-sdk';
import * as winston from 'winston';

export const pruneImages = async ({ repositoryName, filter = (image: ECR.ImageDetail) => false }) => {
    const ecr = new ECR({ apiVersion: '2015-09-21' });

    const describeResponse = await ecr.describeImages({
        repositoryName
    })
        .promise();

    winston.debug(`pruneImages: imageDetails`, describeResponse.imageDetails);

    const imagesToPrune = describeResponse.imageDetails
        .filter(filter)
        .map(({ imageDigest }) => ({ imageDigest }));

    winston.debug(`pruneImages: imagesToPrune`, imagesToPrune);

    if (imagesToPrune.length === 0) {
        return;
    }

    await ecr.batchDeleteImage({
        repositoryName,
        imageIds: imagesToPrune
    })
        .promise();
};