'use strict';

const auth = require('../../services/authentication');

module.exports.handler = (event, context) =>
    auth.verify(event.token)
        .then(response => context.done(null, response))
        .catch(err => context.done(null, auth.messages.verifyFailed()));
