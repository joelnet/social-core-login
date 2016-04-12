'use strict';

import config  from '../config.json';
import { compare as comparePassword } from '../lib/crypto';
import Promise from 'bluebird';
import jwt     from 'jsonwebtoken';
import *  as storage from './storage';
import _       from 'lodash';

export const messages = {
    argumentNull:         arg   => `${arg}: argument cannot be null.`,
    authentication:       token => ({ success: true, token: token }),
    authenticationFailed: err   => ({ success: false, message: 'Authentication failed.' + (err ? ' ' + err : '') }),
    verify:               ()    => ({ success: true, message: 'Successfully authenticated.' }),
    verifyFailed:         err   => ({ success: false, message: err || 'Failed to authenticate token.' }),
};

const tokenSettings = {
    expiresIn: config.tokenExpiration
};

export const login = (auth) =>
    validateLogin(auth)
        .then(getUser)
        .then(user => validatePassword(auth.password, _.get(user, 'password')))
        .then(() => getToken(auth.userId))
        .then(messages.authentication);

export const verify = (token) =>
    Promise.promisify(jwt.verify)(token, config.supersecret)
        .then(messages.verify)
        .catch(err => Promise.resolve(messages.verifyFailed('' + err)));

export const refresh = (token) =>
    Promise.promisify(jwt.verify)(token, config.supersecret, { ignoreExpiration: true })
        .then(decoded => getToken(decoded.userId))
        .then(token => ({
            success: !!token,
            token: token || undefined,
            message: token ? undefined : 'Authentication failed.'
        }))
        .catch(err => Promise.reject(_.isObject(err) ? _.extend(err, { success: false }) : err));

const getUser = (auth) =>
    storage.getUser(auth.emailAddress + '|' + auth.appId)
        .catch(err => Promise.reject(messages.authenticationFailed()));

const validateLogin = (login) =>
    !login              ? Promise.reject(messages.authenticationFailed(messages.argumentNull('login'))) :
    !login.appId        ? Promise.reject(messages.authenticationFailed(messages.argumentNull('appId'))) :
    !login.password     ? Promise.reject(messages.authenticationFailed(messages.argumentNull('password'))) :
    !login.emailAddress ? Promise.reject(messages.authenticationFailed(messages.argumentNull('emailAddress'))) :
                          Promise.resolve(login);

const getUserId = (appId, userId) =>
    appId && userId ? Promise.resolve(userId + '|' + appId) : Promise.reject();

const validatePassword = (password, hash) =>
    comparePassword(password, hash)
        .catch(() => Promise.reject(messages.authenticationFailed()));

const getToken = (userId) =>
    jwt.sign({ userId: userId }, config.supersecret, tokenSettings);
