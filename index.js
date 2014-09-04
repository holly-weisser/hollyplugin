'use strict';

var path = require('path');
var http = require('http');
var messageSocket = require('./message-socket');

var internals = {};

internals.getOptions = function(pathStr) {
    var options = {
        host: 'localhost',
        path: '/api/'+pathStr,
        port: '3000',
        headers: {'Authorization' : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvYmoiOiI1M2RmZWUwYTdkNzQxYzZjMDZmYzcwYTYiLCJleHAiOjE0MDg4MDczOTguNzE4LCJpYXQiOjE0MDg3MjA5OTh9.dYKwH1kY9uWmYKi3_fnjMs4wWELsBpAV_PgIU8lZ0Hk'}
    }

    return options;
}

	module.exports = {

	config: function(extension, opts, next) {
		extension.logInfo('Starting Holly\'s Plugin!');

		extension.api({
			method: 'GET',
			path: '/holly/{name}',
            config: {
                handler: function (req, reply) {
                    reply('Options: '+req.params.name);
                },
                auth:false,
                plugins: {hal:{api:'hp:holly'}}
            }
		});

        extension.api({
            method: 'GET',
            path: '/holly',
            config: {
                handler: function (req, reply) {
                    reply('This is the main page.');
                },
                auth:false,
                plugins: {hal:{api:'hp:hollyMain'}}
            }
        });

        extension.namespace({name:'hollyplugin', prefix:'hp', dir:path.join(__dirname, 'rels')});

        messageSocket(extension);

		next();
	}
};