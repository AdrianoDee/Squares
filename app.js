'use strict'

var
		express = require('express'),
		app = express(),
		serv = require('http').Server(app),
		io = require('socket.io')(serv,{}),
		poolMan = require('./PoolMan.js'),
		time = require('./TimeMan.js'),
		animFrame = require('./AnimMan.js'),
		SOCKET_LIST = {},
		PLAYERS= poolMan(["imgId","x","y","dir"],"players",50);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);

console.log("Server started.");
console.log(animFrame);


io.sockets.on('connection',
	function(socket){

		var player 		= Object.create(null);
				player.x = 250;
				player.y = 250;
				//export tileset firstgid
				player.tileset = 7;

		socket.id = PLAYERS.insert(player);

		socket.animId = NaN;

		SOCKET_LIST[socket.id] = socket;

		console.log("player ID: "+socket.id+" is connected");

		socket.emit("initPlayer",{"id" : socket.id , "player" : player});

		socket.on("updatePlayer",
			function(data){
				if(PLAYERS.pool[socket.id].dir !== data.dir){
					if(socket.animId !== NaN)
						time.stopAnimation(socket.animId);
					socket.animId = time.startAnimation(animFrame[data.dir],
						function(tile){
							tile += player.tileset;
							PLAYERS.modifyPoolElement(socket.id,{"imgId":tile});
						});
				}
				PLAYERS.modifyPoolElement(socket.id,data);
			});

		socket.on('disconnect',
			function(){
				delete SOCKET_LIST[socket.id];
				PLAYERS.delete(socket.id);
				console.log("player ID: "+socket.id+" is disconnected")
			});
	});

time.startSignal(30,
	function(){
		io.emit("move")
	});

time.startSignal(25,
	function(){
		io.emit("players",PLAYERS.getPool());
	});

setInterval(function(){

	time.update();

},1000/25);
