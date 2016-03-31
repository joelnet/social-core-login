(function () { 
    'use strict';

    var app = new Vue({
        el: '#app',
        data: {
            loginForm: {
                emailAddress: 'testuser@fake.domain',
                password: null,
                message: null
            },
            identity: store.get('identity')
        },
        methods: {
            login: function (event) {
                var _this = this;
                api.get('auth/login', {
                        emailAddress: _this.loginForm.emailAddress,
                        password: _this.loginForm.password
                    })
                    .then(function (res) {
                        if (res.success) {
                            _this.identity = { emailAddress: _this.loginForm.emailAddress, token: res.token };
                            store.set('identity', _this.identity);
                        } else {
                            _this.loginForm.message = res.message;
                        }
                        _this.loginForm.password = '';
                    });
            },
            createAccount: function () {
                var _this = this;
                api.get('account/create', {
                        emailAddress: _this.loginForm.emailAddress,
                        password: _this.loginForm.password
                    })
                    .then(function (res) {
                        _this.loginForm.message = res.message;
                    }, function (err) {
                        console.error(err);
                    });
            },
            logout: function () {
                this.identity = null;
                store.remove('identity');
            }
        }
    });
}());