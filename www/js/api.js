(function (global) {
    'use strict';

    var root = 'https://mtfjs109kl.execute-api.us-west-2.amazonaws.com/dev/';

    var appId = '3HsVknja1NyHtd37tYUNTq';

    var api = {};

    api.get = function (method, params) {
        params = (params || {});
        params.appId = appId;

        fetchival.mode = 'cors';

        return fetchival(root)(method).get(params);
    };

    api.post = function (method, params) {
        params = (params || {});
        params.appId = appId;

        return fetchival(root)(method).post(params);
    };

    global.api = global.api || api;

}(window));