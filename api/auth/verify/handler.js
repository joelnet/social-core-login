'use strict';

import { verify, messages } from '../../services/authentication';

module.exports.handler = (event, context) =>
    verify(event.token)
        .then(response => context.done(null, response))
        .catch(err => context.done(null, err));
