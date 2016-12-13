"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const path_1 = require("path");
const fs_1 = require("fs");
const aws_sdk_1 = require("aws-sdk");
const iam = new aws_sdk_1.IAM({ apiVersion: '2010-05-08' });
const updatePolicy = ({ arn, versionId, document }) => __awaiter(this, void 0, void 0, function* () {
    const existingPolicyVersionResponse = yield iam.getPolicyVersion({
        PolicyArn: arn,
        VersionId: versionId
    })
        .promise();
    // URI decoding is required - https://github.com/aws/aws-sdk-java/issues/730
    const existingDocument = decodeURIComponent(existingPolicyVersionResponse.PolicyVersion.Document);
    if (existingDocument !== document) {
        yield iam.createPolicyVersion({
            PolicyArn: arn,
            PolicyDocument: document,
            SetAsDefault: true
        })
            .promise();
        yield iam.deletePolicyVersion({
            PolicyArn: arn,
            VersionId: versionId
        })
            .promise();
    }
});
const deletePolicy = ({ arn }) => __awaiter(this, void 0, void 0, function* () {
    const policyVersionsResponse = yield iam.listPolicyVersions({ PolicyArn: arn })
        .promise();
    const nonDefaultVersions = policyVersionsResponse.Versions
        .filter(version => !version.IsDefaultVersion);
    for (const version of nonDefaultVersions) {
        yield iam.deletePolicyVersion({
            PolicyArn: arn,
            VersionId: version.VersionId
        })
            .promise();
    }
    yield iam.deletePolicy({ PolicyArn: arn })
        .promise();
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ paths }) => __awaiter(this, void 0, void 0, function* () {
    const policiesResponse = yield iam.listPolicies({ Scope: 'Local' })
        .promise();
    if (policiesResponse.IsTruncated) {
        throw new Error(`Code doesn't yet support paging`);
    }
    const policies = [
        ...policiesResponse.Policies.map(policy => ({
            name: policy.PolicyName,
            type: 'remote',
            data: policy
        })),
        ...paths.map(path => {
            if (path_1.extname(path) !== '.json') {
                throw new Error(`Invalid path ${path}`);
            }
            return {
                name: path_1.basename(path, '.json'),
                type: 'local',
                data: fs_1.readFileSync(path, 'utf8')
            };
        })
    ]
        .reduce((policies, { name, type, data }) => {
        const policy = policies[name] || {};
        policy[type] = data;
        policies[name] = policy;
        return policies;
    }, {});
    for (const name of Object.keys(policies)) {
        const policy = policies[name];
        if (policy.local != null && policy.remote == null) {
            yield iam.createPolicy({
                PolicyName: name,
                PolicyDocument: policy.local
            })
                .promise();
        }
        else if (policy.local != null && policy.remote != null) {
            yield updatePolicy({
                arn: policy.remote.Arn,
                versionId: policy.remote.DefaultVersionId,
                document: policy.local
            });
        }
        else if (policy.local == null && policy.remote != null) {
            yield deletePolicy({
                arn: policy.remote.Arn
            });
        }
        else {
            throw new Error('Invalid state');
        }
    }
});
