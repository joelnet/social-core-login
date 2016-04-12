'use strict';

import { refresh, messages } from '../../services/authentication';

module.exports.handler = (event, context) =>
    refresh(event.token)
        .then(token => context.done(null, token))
        .catch(err => context.done(null, err));
