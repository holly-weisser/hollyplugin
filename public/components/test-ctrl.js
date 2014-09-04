angular.module('informer')
    .controller('TestCtrl', function($scope, messagingSocket, session, $window) {
        var self = this;
        this.message = "";
        $scope.fullMessages = [];
        $scope.currentUsers = [];
        this.chatUsername = session.user.displayName;
        this.newUsername = '';
        var socket = messagingSocket;
        $scope.messageClass = 'animate nga-fadeIn ui blue inverted segment';
        $scope.colorOptions = ['White', 'Blue', 'Red', 'Purple', 'Teal', 'Black', 'Orange', 'Green'];
        $scope.userSelectedColor = 'White';
        $scope.colorClasses = {
            Blue : 'animate nga-fadeIn ui blue inverted segment',
            Red : 'animate nga-fadeIn ui red inverted segment',
            Purple : 'animate nga-fadeIn ui purple inverted segment',
            Teal : 'animate nga-fadeIn ui teal inverted segment',
            White : 'animate nga-fadeIn ui segment',
            Black : 'animate nga-fadeIn ui white inverted segment',
            Orange : 'animate nga-fadeIn ui orange inverted segment',
            Green : 'animate nga-fadeIn ui green inverted segment'
        };
        $scope.userIconColorClasses = {
            Blue : 'blue user icon',
            Red : 'red user icon',
            Purple : 'purple user icon',
            Teal : 'teal user icon',
            White : 'black inverted user icon',
            Black : 'black user icon',
            Orange : 'orange user icon',
            Green : 'green user icon',
            Away: 'disabled user icon'
        };

        this.isUsernameValid = true;
        this.supplyUsername = 'New username cannot be blank.';
        this.isValidMessage = true;
        this.supplyMessage = 'Message cannot be blank.';
        this.awayButtonText = 'Show status as away';
        this.isAway = false;

        socket.emit('subscribe', this.chatUsername);

        socket.on('new:user', function (allUsers) {
            $scope.currentUsers = allUsers;
        });

        socket.on('post:message', function (fullMessage) {
            $scope.fullMessages.push({user:fullMessage.user, message:fullMessage.message, color: fullMessage.color, date: fullMessage.date});
        });

        socket.on('change:color', function(allUsers) {
            $scope.currentUsers = allUsers;
        });

        socket.on('set:awayStatus', function(allUsers) {
            $scope.currentUsers = allUsers;
        });

        this.sendMessage = function () {
                socket.emit('post:message', {
                    user: this.chatUsername,
                    message: this.message,
                    color: $scope.userSelectedColor,
                    date: new Date()
                });
            this.message = '';
        };

        this.keyPress = function ($keyEvent) {
            if($keyEvent.charCode === 13 && self.validMessage()) {
                self.sendMessage();
            }
        };

        this.validMessage = function() {
            if(self.message!==null && self.message!=='') {
                this.isValidMessage = true;
                return true;
            }
            this.isValidMessage = false;
            return false;
        };

        this.getMessages = function() {
            return $scope.fullMessages;
        } ;

        this.changeUsername = function() {
            socket.emit('change:username', {originalId: session.user.displayName, previousName: this.chatUsername, newName: this.newUsername, color: $scope.userSelectedColor, isAway: this.isAway});
            this.chatUsername = this.newUsername;
            this.newUsername = '';
        };

        this.validUsername = function() {
            if(this.newUsername!==null && this.newUsername!=='') {
                this.isUsernameValid = true;
                return true;
            }
            this.isUsernameValid = false;
            return false;
        };

        this.clearMessages = function() {
            $scope.fullMessages = [];
        };

        $scope.selectColor = function(color) {
            $scope.userSelectedColor = color;
            socket.emit('change:color', {originalId: session.user.displayName, previousName: this.chatUsername, newName: this.newUsername, color: $scope.userSelectedColor, isAway: this.isAway});
        };

        $scope.$on('$stateChangeStart', function (event, next, current) {
                socket.emit('unsubscribe', session.user.displayName);
        });

        $window.onbeforeunload = function (event) {
            socket.emit('unsubscribe', session.user.displayName);
        };

        $scope.getUserIconColor = function (user) {
            if(user.isAway){
                return $scope.userIconColorClasses['Away'];
            }
            return $scope.userIconColorClasses[user.color];
        };

        this.toggleAway = function () {
            this.isAway = !this.isAway;
            if(this.isAway) {
                this.awayButtonText = 'Show status as active';
                socket.emit('set:awayStatus', {originalId: session.user.displayName, previousName: this.chatUsername, newName:this.newUsername, color:$scope.userSelectedColor, isAway:this.isAway});
            }else {
                this.awayButtonText = 'Show status as away';
                socket.emit('set:awayStatus', {originalId: session.user.displayName, previousName: this.chatUsername, newName:this.newUsername, color:$scope.userSelectedColor, isAway:this.isAway});
            }
        };

    });