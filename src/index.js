const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMsg, generateUrlMsg } = require('./utils/msg');
const { addUser,
	removeUser,
	getUser,
	getUsersByRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000

const publicDir = path.join(__dirname, '../public');

app.use(express.static(publicDir));

const welcomeMsg = ', welcome to this chat';
const joinMsg = ' has joined the chat';
const discMsg = ' has left the chat';

io.on('connection', (socket) => {
	console.log('Websocket Connected');

	socket.on('user-msg', (message, callback) => {
		const user = getUser(socket.id);
		const filter = new Filter({ placeHolder: '#' });

		if (filter.isProfane(message)) return callback(filter.clean(message));

		io.to(user.roomName).emit('chat-message', generateMsg(user.userName, message))
		callback();
	})

	socket.on('send-loc', (coords, callback) => {
		const user = getUser(socket.id);
		io.to(user.roomName).emit('sendLoc', generateUrlMsg(user.userName, 'https://google.com/maps?q=' + coords.lat + ',' + coords.long))
		callback();
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io.to(user.roomName).emit('disc-message', generateMsg(user.userName, discMsg));
			io.to(user.roomName).emit('roomData', {
				roomName: user.roomName,
				users: getUsersByRoom(user.roomName)
			})
		}
	})

	socket.on('join', ({ userName, roomName }, callback) => {

		const { error, user } = addUser({ id: socket.id, userName, roomName })
		if (error) return callback(error);

		socket.join(user.roomName);

		socket.emit('welcome-message', generateMsg(user.userName, welcomeMsg));
		socket.broadcast.to(user.roomName).emit('join-message', generateMsg(user.userName, joinMsg));
		io.to(user.roomName).emit('roomData', {
			roomName: user.roomName,
			users: getUsersByRoom(user.roomName)
		})

		callback();
	})

})


server.listen(port, () => {
	console.log('Server is up on port ' + port);
})

