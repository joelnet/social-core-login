'use strict';

const authentication = require('../../services/authentication');

module.exports.handler = (event, context) =>
    authentication.login({
            appId: event.appId,
            emailAddress: event.emailAddress,
            password: event.password
        })
        .then(response => context.done(null, response))
        .catch(err => context.done(null, err));
