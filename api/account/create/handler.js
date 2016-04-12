'use strict';

import _ from 'lodash';
import { create, messages } from '../../services/account';

module.exports.handler = (event, context) =>
    create({
            appId: event.appId,
            emailAddress: event.emailAddress,
            password: event.password,
        })
        .then(response => context.done(null, response))
        .catch(err => context.done(null, err));
