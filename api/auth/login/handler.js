'use strict';

import { login } from '../../services/authentication';

module.exports.handler = (event, context) =>
    login({
            appId: event.appId,
            emailAddress: event.emailAddress,
            password: event.password
        })
        .then(response => context.done(null, response))
        .catch(err => context.done(null, err));
