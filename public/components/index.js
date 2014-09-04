angular.module('informer')
    .factory('messagingSocket', function ($rootScope, io, session, socketFactory) {
        var createSocket = function(namespace) {
            var ioSocket, socket = io.connect(namespace, { path: '/api/socket.io', query: session.urlToken && 'token='+session.urlToken });

            $rootScope.$on('login', function(event, session) {
                ioSocket.socket = io.connect('', { query: session.urlToken && 'token=' + session.urlToken});
            });
            $rootScope.$on('logout', function() {
                socket.disconnect();
            });

            ioSocket = socketFactory({ ioSocket: socket });
            return ioSocket;
        };
        var socket = createSocket('/messages');
        return socket;
    })
    .config(function ($stateProvider) {
        $stateProvider.state('test', {
            url: '/holly/{name}',
            templateUrl: '/hollyplugin/components/views/test-tpl.html',
            controller: 'TestCtrl as ctrl',
            resolve: {
                value: function(api, $stateParams){
                    return api.get('hp:holly', {name:$stateParams.name});
                },
                datasources: ['api', function (api) {
                    return api.link('inf:datasources').first().get().get('inf:datasource').all();
                }]
            }
        });
    })
    .config(function ($stateProvider) {
        $stateProvider.state('main', {
            url:'/holly',
            templateUrl:'/hollyplugin/components/views/main-tpl.html',
            controller: 'MainCtrl as mainCtrl',
            resolve: {
                toDisplay: function(api) {
                    return api.get('hp:hollyMain');
                }
            }
        })
    });