"use strict"

;function PlayerMan(id,player){
	var DIRECTION = {"S":0,"SE":1,"E":2,"NE":3,"N":4,"NW":5,"W":6,"SW":7};
	//properties
	this._id = id || NaN;
	this._x  = NaN;
	this._y  = NaN;
	this._dir= DIRECTION.S;
	this._tileset = player.tileset || 0;
	//
	this.playerPack = Object.create(null);
	this.playerPack.x  = player.x  || 250;
	this.playerPack.y  = player.y  || 250;
	this.playerPack.dir= player.tileset;
	//move properties
	this.maxSpd  = 5;
	this.toRight = false;
	this.toLeft  = false;
	this.toUp    = false;
	this.toDown  = false;
	//methods
	this.move = function(socket){

		var flag = true;

		this._x = this.playerPack.x;
		this._y = this.playerPack.y;

		if(this.toDown && this.toRight){
			this._x += this.maxSpd;
			this._y += this.maxSpd;
			this._dir= DIRECTION.SE;
		} else if(this.toDown && this.toLeft){
			this._x -= this.maxSpd;
			this._y += this.maxSpd;
			this._dir= DIRECTION.SW;
		} else if(this.toUp && this.toRight){
			this._x += this.maxSpd;
			this._y -= this.maxSpd;
			this._dir= DIRECTION.NE;
		} else if(this.toUp && this.toLeft){
			this._x -= this.maxSpd;
			this._y -= this.maxSpd;
			this._dir= DIRECTION.NW;
		} else if(this.toRight){
			this._x += this.maxSpd;
			this._dir= DIRECTION.E;
		} else if(this.toLeft){
			this._x -= this.maxSpd;
			this._dir= DIRECTION.W;
		} else if(this.toUp){
			this._y -= this.maxSpd;
			this._dir= DIRECTION.N;
		} else if(this.toDown){
			this._y += this.maxSpd;
			this._dir= DIRECTION.S;
		} else {
			flag = false;
		}
		this.playerPack.dir = this._tileset + this._dir*5;
		if(flag){
			this.playerPack.x    = this._x;
			this.playerPack.y    = this._y;
			++this.playerPack.dir;
			socket.emit("updatePlayer",this.playerPack);
		} else {
			socket.emit("updatePlayer",{"imgId":this.playerPack.dir,"dir":this.playerPack.dir});
		}
	};
};
