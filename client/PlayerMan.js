;function PlayerMan(x,y,w,h){
	//Properties
	this.id = NaN;
	this.data = [NaN,x || 250, y || 250, w || 10, h || 10];
	//Properties for collision
	this.temp_x = x || 250;
	this.temp_y = y || 250;
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
		return {temp_x : this.temp_x,
						temp_y : this.temp_y,
						width  : this.data[3],
						height : this.data[4]};
	};
	this.move = function(socket){
		this.data[1/*x*/] = this.temp_x;
		this.data[2/*y*/] = this.temp_y;
		socket.emit("playerUpdate",this.data);
	};
};
