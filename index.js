var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

//Routing
app.use(express.static(__dirname + '/public'));


//Initial variables
var usernames = {};
var numUsers = 0;


//Socket connection handler
io.on('connection', function(socket){
	var addedUser = false;
	console.log('A user has connected');
	

	//New chat message
	socket.on('new message', function(msg){
		console.log('message: ' + msg);

		//Execute message
		socket.broadcast.emit('new message', {
			username: socket.username,
			message: msg
		});
	});


	//When a new user joins
	socket.on('add user', function(username){

		//Store the username
		socket.username = username;
		usernames[username] = username;
		++numUsers;
		addedUser = true;
		socket.emit('login', {
			numUsers: numUsers
		});

		//Emit a global message
		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		});

	});


	//When a user is typing
	socket.on('typing', function(){
		socket.broadcast.emit('typing', {
			username: socket.username
		});
	});


	//When a user stops typing
	socket.on('stop typing', function(){
		socket.broadcast.emit('stop typing', {
			username: socket.username
		});
	});


	//Msg on disconnect
	socket.on('disconnect', function(){
		console.log('A user has disconnected');

		//Remove the username from our list
		if(addedUser){
			delete usernames[socket.username];
			--numUsers;

			//Tell others the user has left
			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});

});

server.listen(port, function(){
	console.log('listening on %d', port);
});