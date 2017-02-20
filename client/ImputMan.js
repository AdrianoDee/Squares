//Imput Manager
document.addEventListener("keydown",
  function(event){
    if (event.keyCode === 87 || event.keyCode === 38) player.toUp    = true ;
    if (event.keyCode === 83 || event.keyCode === 40) player.toDown  = true ;
    if (event.keyCode === 65 || event.keyCode === 37) player.toLeft  = true ;
    if (event.keyCode === 68 || event.keyCode === 39) player.toRight = true ;
  });
document.addEventListener("keyup",
  function(event){
    if (event.keyCode === 87 || event.keyCode === 38) player.toUp    = false ;
    if (event.keyCode === 83 || event.keyCode === 40) player.toDown  = false ;
    if (event.keyCode === 65 || event.keyCode === 37) player.toLeft  = false ;
    if (event.keyCode === 68 || event.keyCode === 39) player.toRight = false ;
  });
