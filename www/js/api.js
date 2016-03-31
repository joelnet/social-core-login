(function (global) {
    'use strict';

    var root = 'https://mtfjs109kl.execute-api.us-west-2.amazonaws.com/dev/';

    var appId = '3HsVknja1NyHtd37tYUNTq';

    var api = {};

    api.get = function (method, params) {
        params = (params || {});
        params.appId = appId;

        return pegasus(root + method + serialize(params));
    };

    function serialize(obj) {
        var queryString = Object.keys(obj)
            .map(function (k) {
                return k + '=' + encodeURIComponent(obj[k]);
            }).join('&');

        return queryString.length ? '?' + queryString : '';
    }

    global.api = global.api || api;

}(window));