'use strict';

import { hash as bcryptHash, hashSync as bcryptHashSync, compare as bcryptCompare }
               from 'bcrypt-nodejs';
import bs58    from 'bs58';
import uuid    from 'uuid';
import Promise from 'bluebird';

export const generateUuid = (type) =>
    (type = (type || '').toLowerCase())
        == 'binary' ? uuid.v4(type) : type
        == 'base58' ? bs58.encode(uuid.v4('binary'))
                    : uuid.v4(type);

export const hash = (value) =>
    Promise.promisify(bcryptHash)(value, null, null);

export const hashSync = (value) =>
    bcryptHashSync(value);

export const compare = (password, hash) =>
    Promise.promisify(bcryptCompare)(password, hash)
        .then(success => success ? Promise.resolve() : Promise.reject())
        .catch(() => Promise.reject());
