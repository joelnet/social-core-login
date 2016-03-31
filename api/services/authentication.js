'use strict';

var config  = require('../config.json');
var crypto  = require( '../lib/crypto');
var Promise = require( 'bluebird');
var jwt     = require( 'jsonwebtoken');
var storage = require( './storage');
var _       = require( 'lodash');

const messages = {
    argumentNull:         arg   => `${arg}: argument cannot be null.`,
    authentication:       token => ({ success: true, token: token }),
    authenticationFailed: err   => ({ success: false, message: 'Authentication failed.' + (err ? ' ' + err : '') }),
    verify:               ()    => ({ success: true, message: 'Successfully authenticated.' }),
    verifyFailed:         err   => ({ success: false, message: err || 'Failed to authenticate token.' }),
};

const tokenSettings = {
    expiresIn: config.tokenExpiration
};

const login = (auth) =>
    validateLogin(auth)
        .then(getUser)
        .then(user => validatePassword(auth.password, _.get(user, 'password')))
        .then(() => getToken(auth.userId))
        .then(messages.authentication);

const getUser = (auth) =>
        storage.getUser(auth.emailAddress + '|' + auth.appId)
            .catch(err => Promise.reject(messages.authenticationFailed()));

//const _validateLogin = (login) =>
//    new Promise((resolve, reject) => {
//        if (!login) return reject(messages.authenticationFailed(messages.argumentNull('login')));
//        if (!login.appId) return reject(messages.authenticationFailed(messages.argumentNull('appId')));
//        if (!login.password) return reject(messages.authenticationFailed(messages.argumentNull('password')));
//        if (!login.emailAddress) return reject(messages.authenticationFailed(messages.argumentNull('emailAddress')));
//        resolve(login)
//    });

const validateLogin = (login) =>
    !login              ? Promise.reject(messages.authenticationFailed(messages.argumentNull('login'))) :
    !login.appId        ? Promise.reject(messages.authenticationFailed(messages.argumentNull('appId'))) :
    !login.password     ? Promise.reject(messages.authenticationFailed(messages.argumentNull('password'))) :
    !login.emailAddress ? Promise.reject(messages.authenticationFailed(messages.argumentNull('emailAddress'))) :
                          Promise.resolve(login);

const getUserId = (appId, userId) =>
    appId && userId ? Promise.resolve(userId + '|' + appId) : Promise.reject();

//const _validatePassword = (password, hash) =>
//    new Promise((resolve, reject) =>
//        crypto.compare(password, hash)
//            ? resolve()
//            : reject(messages.authenticationFailed()));

const validatePassword = (password, hash) =>
    new Promise((resolve, reject) =>
        crypto.compare(password, hash)
            .then(() => resolve())
            .catch(() => reject(messages.authenticationFailed())));

const verify = (token) =>
    new Promise((resolve, reject) =>
        Promise.promisify(jwt.verify)(token, config.supersecret)
            .then(() => resolve(messages.verify()))
            .catch(err => resolve(messages.verifyFailed('' + err))));

const refresh = (token) =>
    new Promise((resolve, reject) =>
        Promise.promisify(jwt.verify)(token, config.supersecret, { ignoreExpiration: true })
            .then(decoded => getToken(decoded.userId))
            .then(token => resolve({
                success: !!token,
                token: token || undefined,
                message: token ? undefined : 'Authentication failed.'
            }))
            .catch(err => reject(_.isObject(err) ? _.extend(err, { success: false }) : err)));

const getToken = (userId) =>
    jwt.sign({ userId: userId }, config.supersecret, tokenSettings);

module.exports = {
    messages,
    login,
    refresh,
    verify
};