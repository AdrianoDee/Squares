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
