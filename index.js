'use strict';

var path = require('path');

	module.exports = {

	config: function(extension, opts, next) {
		extension.logInfo('Starting Holly\'s Plugin!');

		extension.api({
			method: 'GET',
			path: '/holly/{name}',
            config: {
                handler: function (req, reply) {
                    reply('this is a test! '+req.params.name);
                },
                auth:false,
                plugins: {hal:{api:'hp:holly'}}
            }
		});

        extension.namespace({name:'hollyplugin', prefix:'hp', dir:path.join(__dirname, 'rels')});

		next();
	}
};