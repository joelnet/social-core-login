const expect  = require('expect.js');
const sinon   = require('sinon');
const Promise = require('bluebird');
const storage = require('../api/services/storage');
const auth    = require('../api/services/authentication');
const crypto  = require('../api/lib/crypto');
const _       = require('lodash');

describe('services/authentication', function () {
    const validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NjAwMDU2MTUsImV4cCI6MTc3NTM2NTYxNX0.2govpnr1elq5MsL8s5Boo0wU8D-72O3QSx1p636Oyhw';
    const invalidToken = 'EyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NjAwMDI0OTcsImV4cCI6MTQ2MDAwNDI5N30.l_dQ91YEQmvc7NgTwgO2eBf0LvQIxiHYBDnEQdLKj0U';
    const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NjAwMDYxMDAsImV4cCI6MTQ2MDAwNzkwMH0.idgUlAGIjzVTtc6GYVcrSZy7giDoPwXd6QKq0G2fshU';

    describe('#login()', () => {
        var mockLogin = () => ({ appId: 'appId', password: 'password', emailAddress: 'fake@email.address' });
        var mockUser = () => ({ appId: 'appId', userId: 'userId', password: 'password', emailAddress: 'fake@email.address', password: crypto.hashSync('password') });

        afterEach(function () {
            if (typeof storage.getUser.restore === 'function') {
                storage.getUser.restore();
            }
        });

        it('should return { success: false } when login is null.', function (done) {
            auth.login(null)
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.contain('login: argument cannot be null');
                    done();
                });
        });

        it('should return { success: false } when login is undefined.', function (done) {
            var obj = {};
            auth.login(obj.undefined)
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.contain('login: argument cannot be null');
                    done();
                });
        });

        it('should return { success: false } when appId is not set.', function (done) {
            var login = { password: 'password', emailAddress: 'fake@email.address' };
            auth.login(login)
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.contain('appId: argument cannot be null');
                    done();
                });
        });

        it('should return { success: false } when password is not set.', function (done) {
            var login = { appId: 'appId', emailAddress: 'fake@email.address' };
            auth.login(login)
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.contain('password: argument cannot be null');
                    done();
                });
        });

        it('should return { success: false } when password is empty string.', function (done) {
            var login = { appId: 'appId', emailAddress: 'fake@email.address', password: '' };
            auth.login(login)
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.contain('password: argument cannot be null');
                    done();
                });
        });

        it('should return { success: false } when emailAddress is not set.', function (done) {
            var login = { appId: 'appId', password: 'password' };
            auth.login(login)
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.contain('emailAddress: argument cannot be null');
                    done();
                });
        });

        it('should fail when storage fails.', function (done) {
            sinon.stub(storage, 'getUser').returns(Promise.reject(Error('unknown problem')));

            auth.login(mockLogin())
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.message).to.equal(auth.messages.authenticationFailed().message);
                    done();
                });
        });

        it('should return { success: false } when user does not exist.', function (done) {
            sinon.stub(storage, 'getUser').returns(Promise.resolve(null));

            auth.login(mockLogin())
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.be(auth.messages.authenticationFailed().message);
                    done();
                });
        });

        it('should return { success: false } when password does not match.', function (done) {
            sinon.stub(storage, 'getUser').returns(Promise.resolve(_.extend(mockUser(), { password: crypto.hashSync('wrong-password') })));

            auth.login(mockLogin())
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.be(auth.messages.authenticationFailed().message);
                    done();
                });
        });

        it('should return { success: false } when password hash is invalid.', function (done) {
            sinon.stub(storage, 'getUser').returns(Promise.resolve(_.extend(mockUser(), { password: 'invalid password hash' })));

            auth.login(mockLogin())
                .then(function (response) {
                    done(Error('Exception was expected.'));
                })
                .catch(function (err) {
                    expect(err.success).to.be(false);
                    expect(err.message).to.be(auth.messages.authenticationFailed().message);
                    done();
                });
        });

        it('should return { success: true } when login is valid.', function (done) {
            sinon.stub(storage, 'getUser').returns(Promise.resolve(mockUser()));

            auth.login(mockLogin())
                .then(function (response) {
                    done();
                })
                .catch(function (err) {
                    done(err);
                });
        });
    });

    describe('#verify()', () => {
        it('should return { success: false } when token is null.', (done) => {
            auth.verify(null)
                .then((msg) => {
                    expect(msg.success).to.equal(false);
                    done();
                })
                .catch((err) => done(err || 'Exception was not expected.'));
        });

        it('should return { success: false } when token is undefined.', (done) => {
            auth.verify(undefined)
                .then((msg) => {
                    expect(msg.success).to.equal(false);
                    done();
                })
                .catch((err) => done(err || 'Exception was not expected.'));
        });

        it('should return { success: false } when token is invalid.', (done) => {
            auth.verify(invalidToken)
                .then((msg) => {
                    expect(msg.success).to.equal(false);
                    done();
                })
                .catch((err) => done(err || 'Exception was not expected.'));
        });

        it('should return { success: false } when token is expired.', (done) => {
            auth.verify(expiredToken)
                .then((msg) => {
                    expect(msg.success).to.equal(false);
                    done();
                })
                .catch((err) => done(err || 'Exception was not expected.'));
        });

        it('should return { success: true } when token is valid.', (done) => {
            auth.verify(validToken)
                .then((msg) => {
                    expect(msg.success).to.equal(true);
                    done();
                })
                .catch((err) => done(err || 'Exception was not expected.'));
        });
    });

    describe('#refresh()', () => {
        it('should return JsonWebTokenError when token is null', (done) => {
            auth.refresh(null)
                .then(res => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.name).to.equal('JsonWebTokenError');
                    expect(err.message).to.equal('jwt must be provided');
                    done();
                });
        });

        it('should return JsonWebTokenError when token is undefined', (done) => {
            auth.refresh(undefined)
                .then(res => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.name).to.equal('JsonWebTokenError');
                    expect(err.message).to.equal('jwt must be provided');
                    done();
                });
        });

        it('should return JsonWebTokenError when token is invalid', (done) => {
            auth.refresh(invalidToken)
                .then(res => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.name).to.equal('JsonWebTokenError');
                    expect(err.message).to.equal('invalid token');
                    done();
                });
        });

        it('should return JsonWebToken when token is expired', (done) => {
            auth.refresh(expiredToken)
                .then(res => {
                    expect(res.success).to.equal(true);
                    expect(res.token).to.be.a('string');
                    done();
                })
                .catch(err => done(err || 'Exception was not expected.'));
        });

        it('should return JsonWebToken when token is valid', (done) => {
            auth.refresh(validToken)
                .then(res => {
                    expect(res.success).to.equal(true);
                    expect(res.token).to.be.a('string');
                    done();
                })
                .catch(err => done(err || 'Exception was not expected.'));
        });
    });
});