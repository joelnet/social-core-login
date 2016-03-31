'use strict';

const loginService = require('../../services/authentication');

module.exports.handler = (event, context) =>
    loginService.refresh(event.token)
        .then(token => context.done(null, token))
        .catch(err => context.done(null, loginService.messages.verifyFailed()));
