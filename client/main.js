'use strict'

var
    socket = io(),
    start = false,
    player = null,
    players= null;

camera.addCanvas("canvas");

socket.on("initPlayer",
  function(data){
    player = new PlayerMan(data.id,data.player);
    start = true;
    console.log("player is ready");
    socket.on("move",function(){
      player.move(socket);
    });
  });
socket.on("players",function(data){
    players = data;
});

window.onload = function mainLoop(){
  //
  if(start && map.fullyLoaded){
    var canvas = camera.canvas[0],
        ctx = canvas.ctx;
    //disegno
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(var id in players.index){
      var currentPlayer = players.pool[players.index[id]];
      if(currentPlayer.imgId === null || currentPlayer.imgId === 0) continue;
      var tile = map.tiles[currentPlayer.imgId];
      ctx.drawImage(tile.img,tile.x,tile.y,tile.w,tile.h,
                    currentPlayer.x,currentPlayer.y,tile.w,tile.h);
    }
  }
  requestAnimationFrame(mainLoop);
};
