'use strict';

const _ = require('lodash');
const account = require('../../services/account');

const hasSuccess = msg => _.isBoolean((msg || {}).success);

module.exports.handler = (event, context) =>
    account.create({
            appId: event.appId,
            emailAddress: event.emailAddress,
            password: event.password,
        })
        .then(response => context.done(null, response))
        .catch(err => hasSuccess(err) ? context.done(null, err) : context.done(account.messages.createFailed(event.emailAddress, err)));
