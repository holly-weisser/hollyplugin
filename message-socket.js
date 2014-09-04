'use strict';

var _ = require('lodash');

module.exports = function(plugin) {
    var io = plugin.plugins['ent-socket'].io;

    var currUsers = [];

    var nsp = io.of('/messages');

    nsp.on('connect', function (socket) {
        socket.on('subscribe', function (id) {
            plugin.logInfo("User subscribed to messages: "+id);
                nsp.emit('post:message', {
                    user: 'admin',
                    message: '' + id + ' has entered the room.',
                    color: 'White',
                    date: new Date()
                });
                var newUser = {originalId: id, originalName: id, chatName: id, color: 'White', isAway: false};
                _.remove(currUsers, function (user) {
                    return user.originalId === newUser.originalId;
                });
                var insertIndex = getInsertIndex(newUser);
                currUsers.splice(insertIndex, 0, newUser);
                nsp.emit('new:user', currUsers);
                socket.join(id);
        });

        socket.on('unsubscribe', function (id) {
            plugin.logInfo("User unsubscribed from messages: "+id);
            nsp.emit('post:message', {
                user: 'admin',
                message: ''+id+' has left the room.',
                color: 'White',
                date: new Date()
            });
            _.remove(currUsers, function(user) { return user.originalId === id; });
            nsp.emit('new:user', currUsers);
            socket.leave(id);
        });

        plugin.logInfo('Connected to messages');

        socket.on('post:message', function(data) {
            plugin.logInfo(data.user+' is posting a message.');
            nsp.emit('post:message', {
                user: data.user,
                message: data.message,
                color: data.color,
                date: data.date
            });
        });

        socket.on('change:username', function(data) {
            plugin.logInfo(data.originalId+' changed their chat name to: '+data.newName);
            _.remove(currUsers, function(user) { return user.originalId === data.originalId });
            var newUser = {originalId: data.originalId, previousName : '', chatName : data.newName, color: data.color, isAway: data.isAway};
            var insertIndex = getInsertIndex(newUser);
            currUsers.splice(insertIndex, 0, newUser);
            nsp.emit('new:user', currUsers);
            nsp.emit('post:message', {
                user: 'admin',
                message: data.previousName+' will now be referred to as \''+data.newName+'\'',
                color: 'White',
                date: new Date()
            });
        });

        socket.on('change:color', function(data) {
            plugin.logInfo(data.originalId+' changed their message color.');
            var theUser = _.find(currUsers, function(user) {
                return user.originalId === data.originalId;
            });
            if(theUser){
                _.remove(currUsers, theUser);
                theUser.color = data.color;
                var insertIndex = getInsertIndex(theUser);
                currUsers.splice(insertIndex, 0, theUser);
            }
            nsp.emit('change:color', currUsers);
        });

        socket.on('set:awayStatus', function(data) {
            plugin.logInfo(data.originalId+' changed their status.');
            var theUser = _.find(currUsers, function(user) {
                return user.originalId === data.originalId;
            });
            if(theUser){
                _.remove(currUsers, theUser);
                theUser.isAway = data.isAway;
                var insertIndex = getInsertIndex(theUser);
                currUsers.splice(insertIndex, 0, theUser);
            }
            nsp.emit('set:awayStatus', currUsers);
            var message = '';
            if(data.isAway) {
                message = theUser.chatName+' is away';
            }else {
                message = theUser.chatName+' is back';
            }
            nsp.emit('post:message', {
                user: 'admin',
                message: message,
                color: 'White',
                date: new Date()
            });
        });
    });

    nsp.on('disconnect', function () {
        plugin.logInfo('Socket disconnected from messages namespace');
    });

    var getInsertIndex = function (theUser) {
        var insertIndex = _.findIndex(currUsers, function(currentUser) { return currentUser.chatName.toLowerCase() > theUser.chatName.toLowerCase(); });
        if(insertIndex === -1) {
            insertIndex = currUsers.length;
        }
        return insertIndex;
    };

};