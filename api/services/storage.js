'use strict';

const config       = require('../config.json');
const AWS          = require('aws-sdk');
const Promise      = require('bluebird');
const dynamoConfig = { region: process.env.SERVERLESS_REGION, apiVersion: '2012-08-10' };
const docClient    = new AWS.DynamoDB.DocumentClient(dynamoConfig);
const _            = require('lodash');

const tables = {
    users: `${config.app}-${process.env.SERVERLESS_STAGE}-users`
};

const createUser = (user) =>
    new Promise((resolve, reject) =>
        docClient.put({
                TableName: tables.users,
                Item: user,
                ConditionExpression: 'attribute_not_exists (userId)'
            },
            (err, data) =>
                err ? reject(_.startsWith(err, 'ConditionalCheckFailedException') ? 'User already exists.' : ''+err) : resolve(user)));

//const createUser = (user) =>
//    new Promise((resolve, reject) =>
//        put({
//                TableName: tables.users,
//                Item: user,
//                ConditionExpression: 'attribute_not_exists (userId)'
//            })
//            .then(() => resolve(user))
//            .catch(err => reject(_.startsWith(err, 'ConditionalCheckFailedException') ? 'User already exists.' : err)));

const getUser = (userId) =>
    new Promise((resolve, reject) =>
        docClient.query({
                TableName: tables.users,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
            },
            (err, data) =>
                err ? reject(err) : resolve(_.get(data, 'Items[0]'))));

module.exports = {
    createUser,
    getUser
};