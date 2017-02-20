var express = require('express'),
 		app = express(),
 		serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");


//Implementazione del metodo extend per gli Oggetti
;Object.prototype.extend = function (extendPrototype) {
  var hasOwnProperty = Object.hasOwnProperty;
  var object = Object.create(this);

  for (var property in extendPrototype) {
    if (hasOwnProperty.call(extendPrototype,property) ||
        typeof object[property] === 'undefined') {
          object[property] = extendPrototype[property];
        }
  }
  return object;
};
//Implementazione del metodo transfer per gli ArrayBuffer
if (!ArrayBuffer.transfer) {
    ArrayBuffer.transfer = function(source, length) {
        source = Object(source);
        var dest = new ArrayBuffer(length);
        if (!(source instanceof ArrayBuffer) || !(dest instanceof ArrayBuffer)) {
            throw new TypeError('Source and destination must be ArrayBuffer instances');
        }
        if (dest.byteLength >= source.byteLength) {
            var nextOffset = 0;
            var leftBytes = source.byteLength;
            var wordSizes = [8, 4, 2, 1];
            wordSizes.forEach(function(_wordSize_) {
                if (leftBytes >= _wordSize_) {
                    var done = transferWith(_wordSize_, source, dest, nextOffset, leftBytes);
                    nextOffset = done.nextOffset;
                    leftBytes = done.leftBytes;
                }
            });
        }
        return dest;
        function transferWith(wordSize, source, dest, nextOffset, leftBytes) {
            var ViewClass = Uint8Array;
            switch (wordSize) {
                case 8:
                    ViewClass = Float64Array;
                    break;
                case 4:
                    ViewClass = Float32Array;
                    break;
                case 2:
                    ViewClass = Uint16Array;
                    break;
                case 1:
                    ViewClass = Uint8Array;
                    break;
                default:
                    ViewClass = Uint8Array;
                    break;
            }
            var view_source = new ViewClass(source, nextOffset, Math.trunc(leftBytes / wordSize));
            var view_dest = new ViewClass(dest, nextOffset, Math.trunc(leftBytes / wordSize));
            for (var i = 0; i < view_dest.length; i++) {
                view_dest[i] = view_source[i];
            }
            return {
                nextOffset : view_source.byteOffset + view_source.byteLength,
                leftBytes : source.byteLength - (view_source.byteOffset + view_source.byteLength)
            }
        }
    };
}
//Implementazione RequestAnimationFrame cross browser
if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		       window.mozRequestAnimationFrame    ||
	      	 window.oRequestAnimationFrame      ||
		       window.msRequestAnimationFrame     ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );
		};
	} )();
}


;function PlayerMan(x,y,w,h){
	//Properties
	this.id= NaN;
	this.w = w || 10;
	this.h = h || 10;
	this.x = x || 250;
	this.y = y || 250;
	//Properties for collision
	this.temp_x = this.x;
	this.temp_y = this.y;
	//Properties for moves
	this.toUp   = false;
	this.toDown = false;
	this.toLeft = false;
	this.toRight= false;
	//Methods
	this.tryMove = function(){
		if(this.toUp   ) this.temp_y -= 10;
		if(this.toDown ) this.temp_y += 10;
		if(this.toLeft ) this.temp_x -= 10;
		if(this.toRight) this.temp_x += 10;
		if(this.toUp && this.toLeft ) this.temp_x -= 7; this.temp_y -= 7;
		if(this.toUp && this.toRight) this.temp_x += 7; this.temp_y -= 7;
		if(this.toDown && this.toLeft ) this.temp_x -= 7; this.temp_y += 7;
		if(this.toDown && this.toRight) this.temp_x += 7; this.temp_y += 7;
		return this;
	};
	this.move = function(socket){
		this.x = temp_x;
		this.y = temp_y;
		socket.emit("playerUpdate",this);
	};
}


;function PoolManager(DATATYPES, //array value: "Int8","Uint8",
                                 //             "Int16","Uint16",
                                 //             "Int32","Uint32","Float32",
                                 //             "Float64"
                      startPoolDimension){
  //private properties
  var
      dataTypes     = DATATYPES;
      poolDimension = startPoolDimension;
      numByte       = [],  //for every dataType slot
      groupSize     = 0,   //total entity byte size
      //buffer      = null,//byte array for entities
      //inIndex     = [],  //indices of in game entities
      outIndex      = [],  //indices of out game entities
      poolIncrement = 0;   //counter of all pool memory increment
	//AIF
	(function(){
		for(var i = 0; i < dataTypes.length; ++i){
      switch (dataTypes[i]) {
        case "Int8": case "Uint8":
          numByte[i] = 1;
          break;
        case "Int16": case "Uint16":
          numByte[i] = 2;
          break;
        case "Int32": case "Uint32": case "Float32":
          numByte[i] = 4;
          break;
        case "Float64":
          numByte[i] = 8;
          break;
        default:
          numByte[i] = 0;
      }
    }
	}())
	//properties
  this.pool = [/*buffer,inIndex*/];
  //methods
  this.init = function(){

  	var buffer = null,
  			inIndex = new Array();

    poolDimension = startPoolDimension;
    groupSize     = 0;
    poolIncrement = 0;

    for(i = 0; i < numByte.length; ++i)
      groupSize += numByte[i];
    for(i = 0; i < poolDimension; ++i)
      outIndex.push(i);

    buffer = new ArrayBuffer(poolDimension*groupSize);

    this.pool = [buffer,inIndex,poolDimension];

  };

  this.encode = function(dataArray,index){

    var offset = index*groupSize,
        encodedData = new DataView(this.pool[0]/*buffer*/);

    for(var i = 0; i < dataTypes.length; ++i){
      encodedData["set"+dataTypes[i]](offset,dataArray[i]);
      offset += numByte[i];
    }
  };

  this.decode = function(index){

    var offset = index*groupSize,
        encodedData = new DataView(this.pool[0]/*buffer*/);
        decodedData = [];

    for(var i = 0; i < dataTypes.length; ++i){
      decodedData.push(encodedData["get"+dataTypes[i]](offset));
      offset += numByte[i];
    }
    return decodedData;
  };

  this.insert = function(dataArray){

    var index = NaN;

    if(outIndex.length > 0){
      index = outIndex[0];
      outIndex.splice(0,1);

    } else {
      index = poolDimension;
      for(i = poolDimension + 1; i < Math.floor(1.5*poolDimension); ++i)
        outIndex.push(i);
      poolDimension = Math.floor(1.5*poolDimension);
      this.pool[0]/*buffer*/ = ArrayBuffer.transfer(this.pool[0]/*buffer*/,poolDimension*groupSize);
      this.pool[2] = poolDimension;
      ++poolIncrement;
    }

    this.encode(dataArray,index);
    this.pool[1]/*inIndex*/.push(index);
    return index;

  };

  this.delete = function(index){

    for(var i = 0; i < this.pool[1]/*inIndex*/.length; ++i){
      if(this.pool[1]/*inIndex*/[i] === index){
        this.pool[1]/*inIndex*/.splice(i,1);
        outIndex.push(index);
        return;
      }
    }
  };

  this.getDataTypes = function(){
    return dataTypes;
  };

  this.getNumByte = function(){
    return numByte;
  };
};


var io = require('socket.io')(serv,{}),
		SOCKET_LIST = {},
 		PLAYERS_MANAGER = new PoolManager(["Uint16",  //Entity_Img_Id			   (int from 0 to        +65.535)
																			 "Uint16",  //Entity_Dimension_W   (int from 0 to        +65.535)
                                    	 "Uint16",  //Entity_Dimension_H   (int from 0 to        +65.535)
                                    	 "Uint32",  //Entity_Position_X    (int from 0 to +4.294.967.295)
                                    	 "Uint32"], //Entity_Position_Y    (int from 0 to +4.294.967.295)
                                    	 500);

io.sockets.on('connection', function(socket){

	var newPlayer = new Player();

	socket.id = PLAYERS_MANAGER.insert(newPlayer);

	newPlayer.id = socket.id;

	SOCKET_LIST[socket.id] = socket;

	socket.emit("initPlayer",newPlayer);

	socket.on("playerUpdate",function(data){
		PLAYERS_MANAGER.encode(data,data.id);
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
