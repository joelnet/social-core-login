'use strict';

import config  from '../config.json';
import AWS     from 'aws-sdk';
import Promise from 'bluebird';
import _       from 'lodash';

const dynamoConfig = { region: process.env.SERVERLESS_REGION, apiVersion: '2012-08-10' };
const docClient = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const tables = {
    users: `${config.app}-${process.env.SERVERLESS_STAGE}-users`
};

export const createUser = (user) =>
    new Promise((resolve, reject) =>
        docClient.put({
                TableName: tables.users,
                Item: user,
                ConditionExpression: 'attribute_not_exists (userId)'
            },
            (err, data) =>
                err ? reject(_.startsWith(err, 'ConditionalCheckFailedException') ? 'User already exists.' : ''+err) : resolve(user)));

export const getUser = (userId) =>
    new Promise((resolve, reject) =>
        docClient.query({
                TableName: tables.users,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            },
            (err, data) =>
                err ? reject(err) : resolve(_.get(data, 'Items[0]'))));
