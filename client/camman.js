'use strict'
//CamManager è un oggetto che gestisce i parametri per la visualizzazione della porzione di mappa in cui è puntata la camera

//CamManager è costruito ai fini di gestire mappe 'isometriche staggered' con ordine 'right-down'

;(function CamManager(map){

  var
      CAM = Object.create(null),
      self = CAM;

  CAM.canvas = new Array();
  //assegno il punto della mappa in cui si trova la camera
  CAM.x  = 0;
  CAM.y  = 0;
  //coordinate della camera rispetto la prima cella processata
  CAM.rest_x = 0;
  CAM.rest_y = 0;
  //imposto le dimensioni della camera uguali a quelle del contesto
  CAM.w  = Math.min(window.innerWidth ,map.mapSize.w);
  CAM.h  = Math.min(window.innerHeight,map.mapSize.h);

  CAM.pntCache = new Array();
  //rilevo le dimensioni della camera in unità celle della mappa
  CAM.numCol = Math.ceil(self.w / map.tileSize.w);
  //il '*2' è dovuto alla visualizzazione 'staggered' della mappa
  CAM.numRow = Math.ceil(self.h / map.tileSize.ħ);
  //numero di colonne in meno e righe in più per garantire la visualizzazione in camera di tutte le porzione di immagine
  //in tal modo immagini che hanno dimensioni superiori a quelle delle celle della mappa
  //possono essere renderizzate correttamente anche quando la loro cella di riferimento non è in camera
  CAM.maxMinusCol= Math.ceil(map.maxImgSize.w / map.tileSize.w);
  CAM.maxPlusRow = Math.ceil(map.maxImgSize.h / map.tileSize.ħ);

  CAM.data = Object.create(null);
  CAM.data.pool = new Array();
  CAM.data.topId= NaN;
  //ctxPnt è un metodo di CamManager che ha come parametri l'indice del vettore generato dal metodo dataOnCam e il numero di colonne in più da renderizzare
  //ctxPnt restituisce le coordinate del punto da dove deve partire la renderizzazione della cella nel contesto
  CAM.findPnt = function(index,pnt,totCol){
    //controllo che la riga relativa alla cella relativa all'indice sia pari o dispari
    //tale controllo è necessario ai fini della composizione 'isometriche staggered'
    pnt.x = (index % totCol)* map.tileSize.w;
    pnt.y = Math.floor(index / totCol)* map.tileSize.ħ;
    if(Math.floor(index / totCol)%2 !== 0)
      pnt.x += Math.floor(map.tileSize.w/2);
  };
  //dataOnCam è un metodo di CamManager che legge la proprietà data di un livello
  //dataOnCam colleziona in un vettore gli indici delle celle della mappa da visualizzare nel contesto
  //dataOnCam ordina gli indici in modo che essi possano essere renderizzati secondo 'right-down'
  CAM.fillData = function(){
      var
          row = NaN,
          col = NaN,
          index = 0,
          //rilevo la colonna e la riga della cella in cui è posizionata la camera nella mappa
          //la cella in cui è puntata la mappa è la prima in alto a sinistra del contesto
          startCol= Math.floor(self.x / map.tileSize.w),
          //il '*2' è dovuto alla visualizzazione 'staggered' della mappa
          startRow= Math.floor(self.y / map.tileSize.ħ),
          //ricerco il numero di colonne da sottrarre all'acquisizione dati
          minusCol= Math.min(startCol, self.maxMinusCol),
          //verifico se la camera si trova o meno sui bordi laterali della mappa
          flag = (minusCol === self.maxMinusCol ? true : false),
          //ricerco il numero di righe da aggiungere all'acquisizione dati
          plusRow = Math.min((map.numTiles.h -(startRow + self.numRow)), self.maxPlusRow);
      //percorro le celle della mappa interne al contesto
      if(flag){
        for (row = startRow; row < startRow + self.numRow + plusRow; ++row){
          for (col = startCol - minusCol; col < startCol + self.numCol; ++col){
            self.data.pool[index].cell = (row * map.numTiles.w + col);
            self.data.pool[index].pnt  = self.pntCache[index];
            ++index;
          }
        }
      } else {
        for (row = startRow; row < startRow + self.numRow + plusRow; ++row){
          for (col = startCol - minusCol; col < startCol + self.numCol; ++col){
            self.data.pool[index].cell = (row * map.numTiles.w + col);
            self.findPnt(index,self.data.pool[index].pnt,(self.numCol + minusCol));
            ++index;
          }
        }
      }
      self.data.topId = index;
      
      return self.data;
    };

  CAM.setRest = function(){
    self.rest_x = self.x % map.tileSize.w;
    self.rest_y = self.y % map.tileSize.ħ;
  };

  CAM.addCanvas = function(id){
    var
        canvas = document.getElementById("canvas container").appendChild(document.createElement("canvas"));

    canvas.ctx = canvas.getContext("2d");
    if(typeof id !== "undefined")
      canvas.setAttribute('id' , id);
    canvas.setAttribute('style', 'border: 1px solid #000000; position: fixed;');
    //imposto automaticamente le dimensioni del contesto in base alla mappa assegnata a CamManager e ai valori W e H
    canvas.setAttribute('width' ,self.w);
    canvas.setAttribute('height',self.h);
    self.canvas.push(canvas);
  };

  (function(totCol,totRow){
    for(var index = 0; index < totCol * totRow; ++index){
      self.pntCache[index] = Object.create(null);
      self.findPnt(index,self.pntCache[index],totCol);
      self.data.pool[index] = Object.create(null);
      self.data.pool[index].cell = NaN;
      self.data.pool[index].pnt = Object.create(null);
    }
  }((self.numCol+self.maxMinusCol),(self.numRow+self.maxPlusRow)));

  window.camera = CAM;

  window.addEventListener("optimizedResize",
    function(){
      camera.w  = Math.min(window.innerWidth ,map.mapSize.w);
      camera.h  = Math.min(window.innerHeight,map.mapSize.h);
      //rilevo le dimensioni della camera in unità celle della mappa
      camera.numCol = Math.ceil(camera.w / map.tileSize.w);
      //il '*2' è dovuto alla visualizzazione 'staggered' della mappa
      camera.numRow = Math.ceil(camera.h / map.tileSize.ħ);
      for(var id in camera.canvas){
        camera.canvas[id].setAttribute('width' , camera.w);
        camera.canvas[id].setAttribute('height', camera.h);
      }
    });
}(window.map));
