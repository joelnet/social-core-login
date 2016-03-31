'use strict';

const config  = require('../config.json');
const crypto  = require('../lib/crypto');
const Promise = require('bluebird');
const storage = require('./storage');
const _       = require('lodash');

const messages = {
    argumentNull:     arg             => `${arg}: argument cannot be null.`,
    create:           username        => ({ success: true, message: `User ${username} created successfully.` }),
    createFailed:     (username, err) => ({ success: false, message: 'Failed to create user' + (username ? ` '${username}'` : '') + '.' + (err ? ' ' + err : '') }),
    validationFailed: (username, err) => ({ success: false, message: 'Failed to create user' + (username ? ` '${username}'` : '') + '. ' + err })
};

/**
 * Creates a new user account.
 * @param user {Object} new user account to create.
 */
const create = (user) =>
    new Promise((resolve, reject) =>
        validateUser(user)
            .then(setUserId)
            .then(hashUsersPassword)
            .then(setValidationToken)
            .then(storage.createUser)
            .then(user => resolve(messages.create(user.emailAddress)))
            .catch(err => reject(_.isString(err) ? messages.createFailed(user.emailAddress, err) : err)));

//const validateUser = (user) =>
//    new Promise((resolve, reject) => {
//        if (!user) return reject(messages.validationFailed(null, messages.argumentNull('user')));
//        if (!user.appId) return reject(messages.validationFailed(null, messages.argumentNull('appId')));
//        if (!user.password) return reject(messages.validationFailed(user.username, messages.argumentNull('password')));
//        if (!user.emailAddress) return reject(messages.validationFailed(user.username, messages.argumentNull('emailAddress')));
//        resolve(user);
//    });

const validateUser = (user) =>
    !user              ? Promise.reject(messages.validationFailed(null, messages.argumentNull('user'))) :
    !user.emailAddress ? Promise.reject(messages.validationFailed(null, messages.argumentNull('emailAddress'))) :
    !user.appId        ? Promise.reject(messages.validationFailed(user.emailAddress, messages.argumentNull('appId'))) :
    !user.password     ? Promise.reject(messages.validationFailed(user.emailAddress, messages.argumentNull('password'))) :
                         Promise.resolve(user);

const setUserId = (user) =>
    _.assign(_.cloneDeep(user), { userId: user.emailAddress + '|' + user.appId });

const setValidationToken = (user) =>
    _.assign(_.cloneDeep(user), { validationToken: crypto.generateUuid('base58') });

const hashUsersPassword = (user) =>
    _.assign(_.cloneDeep(user), { password: crypto.hashSync(user.password) });

module.exports = {
    create,
    messages
};