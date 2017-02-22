var canvas = document.getElementById("canvas"),
    ctx    = canvas.getContext("2d"),
    socket = io(),
    player = null;
    playersManager = new ClientPoolManager(["Uint16",  //Entity_Id            (int from 0 to        +65.535)
                                            "Uint32",  //Entity_Position_X    (int from 0 to +4.294.967.295)
                                            "Uint32",  //Entity_Position_Y    (int from 0 to +4.294.967.295)
                                            "Uint16",  //Entity_Dimension_W   (int from 0 to        +65.535)
                                            "Uint16"], //Entity_Dimension_H   (int from 0 to        +65.535)
                                            PlayerMan);
//Set canvas
canvas.width = window.innerWidth ;
canvas.height= window.innerHeight;
window.addEventListener("optimizedResize",
  function(){
    canvas.width = window.innerWidth ;
    canvas.height= window.innerHeight;
  })
//Response to Server Messages
socket.on("initPlayer",
  function(data){
    player = data;
  });
  //FIXME updatePlayers si confonde con playerUpdate
socket.on("updatePlayers",
  function(data){
    playersManager.pool = data;
    playersManager.parsePool();
  });
//Loop
document.onload = function mainLoop(){
    //
    var playerData = null;
    //controllo il movimento
    if(collisionTest(player.tryMove(),playersManager.parsedPool)){
      player.move(socket);
      //aggiornamento temporaneo della posizione del player
      playersManager.parsedPool[player.id] = player.data;
    }
    //disegno
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(var i = 0; i < playersManager.inIndex.length; ++i){
      playerData = playersManager.parsedPool[playersManager.inIndex[i]];
      ctx.fillRect(playerData[0/*x*/],
                   playerData[1/*y*/],
                   playerData[2/*w*/],
                   playerData[3/*h*/]);
    }
    //richiamo la funzione di callback per il loop
    requestAnimationFrame(mainLoop);
  };
