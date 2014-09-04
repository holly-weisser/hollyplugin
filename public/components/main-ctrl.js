angular.module('informer')
    .controller('MainCtrl', function(toDisplay, $state, session) {

        this.userDisplayName = session.user.displayName;

        this.goToTestState = function () {
            $state.go('test', {name: 'chat'});
        };
    });