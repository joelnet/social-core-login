var expect = require('expect.js');
var bs58   = require('bs58');
var crypto = require('../api/lib/crypto');

describe('lib/crypto', function () {
    describe('#hash()', function () {
        it('should return hash when password is null.', function (done) {
            crypto.hash(null)
                .then(hash => {
                    expect(hash).to.be.a('string');
                    done();
                });
        });

        it('should return hash when password is undefined.', function (done) {
            crypto.hash(undefined)
                .then(hash => {
                    expect(hash).to.be.a('string');
                    done();
                });
        });

        it('should return hash when password is set.', function (done) {
            crypto.hash('password')
                .then(hash => {
                    crypto.compare('password', hash)
                        .then(done)
                        .catch(done);
                });
        });

        it('should fail when password does not match.', function (done) {
            crypto.hash('password')
                .then(hash => {
                    crypto.compare('passffword', hash)
                        .then(()  => done(Error('Exception was expected.')))
                        .catch(() => done());
                });
        });
    });

    describe('#generateUuid()', () => {
        it('should return binary when type is binary.', function () {
            var uuid = crypto.generateUuid('binary');
            expect(uuid).to.be.an('array');
        });

        it('should return base58 when type is base58.', function () {
            var uuid = crypto.generateUuid('base58');
            var decoded = bs58.decode(uuid)
            expect(decoded).to.be.an('array');
        });

        it('should return string when type is string.', function () {
            var uuid = crypto.generateUuid('string');
            expect(uuid).to.be.a('string');
            expect(uuid).to.match(/^[{(]?[0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12}[)}]?$/i);
        });

        it('should return string when type is null.', function () {
            var uuid = crypto.generateUuid(null);
            expect(uuid).to.be.a('string');
            expect(uuid).to.match(/^[{(]?[0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12}[)}]?$/i);
        });

        it('should return string when type is undefined.', function () {
            var uuid = crypto.generateUuid(null);
            expect(uuid).to.be.a('string');
            expect(uuid).to.match(/^[{(]?[0-9A-F]{8}[-]?([0-9A-F]{4}[-]?){3}[0-9A-F]{12}[)}]?$/i);
        });
    });

    describe('#compare()', function () {
        var password = 'password';
        var passwordHash = '$2a$10$RV27pDXlgHIBTx1W0aXPQuUlk2f1frnToHWoIPwScpdXsp6ittzMa';
        var invalidPasswordHash = '$a$10$OAMTCGUYjwuFHPJSW5cs9O/XHiUmBbM.6r3QDSj6gmLZLhpbsEHd.';

        it('should fail when hash is invalid.', function (done) {
            crypto.compare(password, invalidPasswordHash)
                .then(() => done(Error('Exception was expected.')))
                .catch(() => done());
        });

        it('should fail when hash is null.', function (done) {
            crypto.compare(password, null)
                .then(() => done(Error('Exception was expected.')))
                .catch(() => done());
        });

        it('should fail when hash is undefined.', function (done) {
            crypto.compare(password, undefined)
                .then(() => done(Error('Exception was expected.')))
                .catch(() => done());
        });

        it('should fail when password is null.', function (done) {
            crypto.compare(null, passwordHash)
                .then(() => done(Error('Exception was expected.')))
                .catch(() => done());
        });

        it('should fail when password is undefined.', function (done) {
            crypto.compare(undefined, passwordHash)
                .then(() => done(Error('Exception was expected.')))
                .catch(() => done());
        });

        it('should pass when password matches hash.', function (done) {
            crypto.compare(password, passwordHash)
                .then(() => done())
                .catch(err => done(err || 'Exception was not expected.'));
        });
    });
});