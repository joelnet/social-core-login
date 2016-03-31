'use strict';

const bcrypt  = require('bcrypt-nodejs');
const bs58    = require('bs58');
const uuid    = require('uuid');
const Promise = require('bluebird');

const generateUuid = (type) =>
    (type = (type || '').toLowerCase())
        == 'binary' ? uuid.v4(type) : type
        == 'base58' ? bs58.encode(uuid.v4('binary'))
                    : uuid.v4(type);

const hash = (value) =>
    Promise.promisify(bcrypt.hash)(value, null, null);

const hashSync = (value) =>
    bcrypt.hashSync(value);

const compare = (password, hash) =>
    Promise.promisify(bcrypt.compare)(password, hash)
        .then(success => success ? Promise.resolve() : Promise.reject())
        .catch(() => Promise.reject());

module.exports = {
    compare,
    generateUuid,
    hash,   
    hashSync
};