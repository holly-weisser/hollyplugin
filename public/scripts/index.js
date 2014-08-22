angular.module('informer')
    .controller('TestCtrl', function(value) {
        this.value = value;
    })
    .config(function ($stateProvider) {
        $stateProvider.state('test', {
            url: '/holly/{name}',
            template: '<div>{{ctrl.value}}</div>',
            controller: 'TestCtrl as ctrl',
            resolve: {
                value: function(api, $stateParams){
                    return api.get('hp:holly', {name:$stateParams.name});
                }
            }
        });
    });