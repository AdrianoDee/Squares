require("./PlayerMan.js");
require("./PoolMan.js");

var express = require('express'),
 		app = express(),
 		serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var io = require('socket.io')(serv,{}),
		SOCKET_LIST = {},
 		PLAYERS_MANAGER = new PoolManager(["Uint16",  //Entity_Id			       (int from 0 to        +65.535)
                                       "Uint32",  //Entity_Position_X    (int from 0 to +4.294.967.295)
                                       "Uint32",  //Entity_Position_Y    (int from 0 to +4.294.967.295)
																			 "Uint16",  //Entity_Dimension_W   (int from 0 to        +65.535)
                                    	 "Uint16"], //Entity_Dimension_H   (int from 0 to        +65.535)
                                    	 500);

io.sockets.on('connection', function(socket){

	var newPlayer = new PlayerMan();

	socket.id = PLAYERS_MANAGER.insert(newPlayer.data);

	newPlayer.data[0/*id*/] = socket.id;

	SOCKET_LIST[socket.id] = socket;

	socket.emit("initPlayer",newPlayer);

	socket.on("playerUpdate",function(data){
		PLAYERS_MANAGER.encode(data,socket.id);
	});
	socket.on("disconnect",function(){
		PLAYERS_MANAGER.delete(socket.id);
		delete SOCKET_LIST[socket.id];
	});
});

setInterval(function(){

	for(var key in SOCKET_LIST)
		SOCKET_LIST[key].emit("updatePlayers",PLAYERS_MANAGER.pool);

},1000/25);
