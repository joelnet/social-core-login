const expect  = require('expect.js');
const account = require('../api/services/account');
const storage = require('../api/services/storage');
const sinon   = require('sinon');
const _       = require('lodash');

describe('services/account', function () {
    describe('#create()', function () {
        const getValidLogin = () => ({ emailAddress: 'email@address.com', appId: 'myAppid', password: 'myPassword' });

        afterEach(function () {
            if (typeof storage.createUser.restore === 'function') {
                storage.createUser.restore();
            }
        });

        it('should return { success: false} when user is null.', function (done) {
            account.create(null)
                .then(() => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.message).to.equal('Failed to create user. user: argument cannot be null.');
                    done();
                });
        });

        it('should return { success: false} when user is undefined.', function (done) {
            account.create(null)
                .then(() => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.message).to.equal('Failed to create user. user: argument cannot be null.');
                    done();
                });
        });

        it('should return { success: false} when email is not set.', function (done) {
            account.create(_.omit(getValidLogin(), ['emailAddress']))
                .then(() => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.message).to.equal('Failed to create user. emailAddress: argument cannot be null.');
                    done();
                });
        });

        it('should return { success: false} when appId is not set.', function (done) {
            account.create(_.omit(getValidLogin(), ['appId']))
                .then(() => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.message).to.contain('appId: argument cannot be null.');
                    done();
                });
        });

        it('should return { success: false} when password is not set.', function (done) {
            account.create(_.omit(getValidLogin(), ['password']))
                .then(() => done(Error('Exception was expected.')))
                .catch(err => {
                    expect(err.success).to.equal(false);
                    expect(err.message).to.contain('password: argument cannot be null.');
                    done();
                });
        });

        it('should return { success: false} when user already exists.', function (done) {
            var login = getValidLogin();
            sinon.stub(storage, 'createUser').returns(Promise.resolve(login));

            account.create(login)
                .then(user => {
                    expect(user).to.be.ok();
                    done();
                })
                .catch(err => done(Error('Exception was not expected.')));
        });
    });
});