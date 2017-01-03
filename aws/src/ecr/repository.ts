import { ECR } from 'aws-sdk';
import { pruneImages } from './image';
import * as winston from 'winston';
import ms = require('ms');

export const ensureRepository = async ({ name }) => {
    const ecr = new ECR({ apiVersion: '2015-09-21' });
    try {
        const response = await ecr.createRepository({ repositoryName: name })
            .promise();

        const repository = response.repository;

        winston.debug(`repository: createRepository`, repository);

        return repository;
    }
    catch (e) {
        if (e.code !== 'RepositoryAlreadyExistsException') {
            throw e;
        }
        const response = await ecr.describeRepositories({ repositoryNames: [name] })
            .promise();

        const repository = response.repositories[0];

        winston.debug(`repository: describeRepositories`, repository);

        return repository;
    }

};

const untagged = (image) => image.imageTags == null || image.imageTags.length === 0;

const old = (image) => Date.now() - image.imagePushedAt.getTime() > ms('3d');

const pruneRepository = async ({ repositoryName, force }) => {
    winston.debug(`pruneRepositories: pruneRepository`, { repositoryName, force });

    await pruneImages({
        repositoryName,
        filter: (image) => force || (untagged(image) && old(image))
    });
    
    if (force) {
        await new ECR({ apiVersion: '2015-09-21' })
            .deleteRepository({ repositoryName })
            .promise();
    }
};

export const pruneRepositories = async ({ filter = (repository: ECR.Repository) => false }) => {
    const describeResponse = await new ECR({ apiVersion: '2015-09-21' })
        .describeRepositories()
        .promise();

    winston.debug(`pruneRepositories: repositories`, describeResponse.repositories);

    const promises = describeResponse.repositories
        .map((repository) =>
            pruneRepository({
                repositoryName: repository.repositoryName,
                force: filter(repository)
            })
        );

    await Promise.all(promises);
};