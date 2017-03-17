'use strict'

;(function(){
  for(var mapName in TileMaps)
    window.map = TileMaps[mapName];
  delete window.TileMaps;
}());
(function MapMan(mapJSON){

  var MAP = Object.create(null),
      self = MAP,
      //variabile per il totale delle immagini presenti in mappa
      totImg = 0,
      //contatore di immagini sorgente caricate
      imgLoadCount = 0;
  //------------------------------------------------------------------------------
  //AIF
  (function imgInMap(){
    //rilevo il numero di immagini sorgente totali della mappa
    //rilevo il numero di livelli immagine nella mappa
    for (var id_1 in mapJSON.layers){
      if (mapJSON.layers[id_1].type === "imagelayer") ++totImg;
    }
    //rilevo il numero di immagini che compongono tileset eterogenei
    for (id_1 in mapJSON.tilesets){
      if (!mapJSON.tilesets[id_1].imageheight && !mapJSON.tilesets[id_1].imagewidth){
        for (var id_2 in mapJSON.tilesets[id_1].tiles){
          if (mapJSON.tilesets[id_1].tiles[id_2].image) ++totImg;
        }
        --totImg;
      }
    }
    totImg += mapJSON.tilesets.length;
  }());
  //------------------------------------------------------------------------------
  //prorietà processate dal file JSON ottenuto da TILED
  //livelli:
  MAP.layers = [];
  //tilesets:
  MAP.tilesets = [];
  //parsed tiles
  MAP.tiles = [];
  //dimensioni mappa in unità celle
  MAP.numTiles = Object.create(null);
  //dimensioni cella mappa in pixel
  MAP.tileSize = Object.create(null);
  //dimensioni mappa in pixel
  MAP.mapSize = Object.create(null);
  //dimensioni massime tra le celle dei tileset e dei tile di immagine
  MAP.maxImgSize = Object.create(null);
  MAP.maxImgSize.w = 0;
  MAP.maxImgSize.h = 0;
  //bandiera di avvenuto caricamentodell'intera mappa
  MAP.fullyLoaded = false;
  //------------------------------------------------------------------------------
  //funzione per caricare le immagini della mappa
  var loadImg = function(src){
    //carico l'oggetto immagine
    var img = new Image();
    //stabilisco la funzione di callback
    img.onload = function () {
      //a caricamento atlante avvenuto incremento il contatore
      ++imgLoadCount;
      //verifico che tutti i file immagine siano stati caricati
      if (imgLoadCount === totImg) {
        //se la verifica ha successo imposto la bandiera su 'vero'
        self.fullyLoaded = true;
      }
    };
    //imposto la sorgente dell'immagine
    img.src = src;
    return img;
  };

  var parseMapJSON = function(){
    var
        id_1 = NaN,
        id_2 = NaN,
        img  = new Array();
    //dimensioni mappa in unità celle
    self.numTiles.w = mapJSON.width  || 1;
    self.numTiles.h = mapJSON.height || 1;
    //dimensioni cella della mappa
    self.tileSize.w = Math.floor(mapJSON.tilewidth)    || 128;
    self.tileSize.ħ = Math.floor(mapJSON.tileheight/2) || 32;
    //dimensioni mappa in pixel
    self.mapSize.w = Math.floor(self.numTiles.w * self.tileSize.w) || 128;
    self.mapSize.h = Math.floor(self.numTiles.h * self.tileSize.ħ) || 64;
    //immagazzino i tilesets nel vettore relativo
    for(id_1 = 0; id_1 < mapJSON.tilesets.length; ++id_1){
      //carico i tileset composti da immagini O carico i tileset con atlante
      if (!mapJSON.tilesets[id_1].imageheight && !mapJSON.tilesets[id_1].imagewidth){
        img[id_1] = new Array();
        //in questo caso la proprietà image sarà un vettore di immagini
        for (id_2 in mapJSON.tilesets[id_1].tiles)
          if (mapJSON.tilesets[id_1].tiles[id_2].image)
            //carico l'immagine relativa al tile nel vettore
            img[id_1][id_2] = loadImg("client/img/"+mapJSON.tilesets[id_1].tiles[id_2].image.replace(/^.*[\\\/]/,''));
      } else {
        //per ogni tileset carico l'atlante relativo come un immagine
        img[id_1] = loadImg("client/img/"+mapJSON.tilesets[id_1].image.replace(/^.*[\\\/]/,''));
      }
      //imposto le dimensioni della cella più grande presente nella mappa
      if (mapJSON.tilesets[id_1].tilewidth  > self.maxImgSize.w) self.maxImgSize.w = mapJSON.tilesets[id_1].tilewidth;
      if (mapJSON.tilesets[id_1].tileheight > self.maxImgSize.h) self.maxImgSize.h = mapJSON.tilesets[id_1].tileheight;
      //assegno l'atlante alla proprietà immagine del tileset
      mapJSON.tilesets[id_1].image = img[id_1];
      //inserisco il tileset nel vettore
      self.tilesets.push(mapJSON.tilesets[id_1]);
    }
    //inserisco i livelli nel vettore relativo
    for(id_1 = 0; id_1 < mapJSON.layers.length; ++id_1){
      //se il livello è un livello immagini
      //carico l'immagine relativa prima di procedere
      if (mapJSON.layers[id_1].type === "imagelayer"){
        img[id_1 + mapJSON.tilesets.length] = loadImg("client/img/"+mapJSON.layers[id_1].image.replace(/^.*[\\\/]/,''));
        //assegno l'immagine alla proprietà immagine del livello
        mapJSON.layers[id_1].image = img[id_1 + mapJSON.tilesets.length];
      }
      //se è un livello celle aggiungo l'ultimo valore
      if (mapJSON.layers[id_1].data)
        mapJSON.layers[id_1].data.push(0);
      //inserisco il livello nel vettore
      self.layers.push(mapJSON.layers[id_1]);
    }
  };

  var dataPackCostructor = function(dataValue){
    //genero un oggetto che organizza le informazioni che desidero
    var
        pkt = Object.create(null),
        tile = NaN,
        index = NaN,
        W = NaN,
        tileW = NaN,
        tileH = NaN,
        obj = null,
        newObj = Object.create(null);
    //rilevo il tileset di appartenenza della cella
    //effettuo un confronto tra 'dataValue' e il 'firstgid' di ogni tileset
    for(tile = self.tilesets.length - 1; tile >= 0; --tile)
      if(self.tilesets[tile].firstgid <= dataValue) break;
    // -indice della cella relativo al tileset di appartenenza
    index = dataValue - self.tilesets[tile].firstgid;

    if(!self.tilesets[tile].imageheight && !self.tilesets[tile].imagewidth){
      //assegno le proprietà dal tileset di immagini all'oggetto pkt
      pkt.img = self.tilesets[tile].image[index];
      pkt.w   = self.tilesets[tile].image[index].width -self.tilesets[tile].spacing;
      pkt.h   = self.tilesets[tile].image[index].height-self.tilesets[tile].spacing;
      pkt.x   = self.tilesets[tile].margin;
      pkt.y   = self.tilesets[tile].margin;
    } else {
      //assegno le proprietà dal tileset all'oggetto pkt
      pkt.img = self.tilesets[tile].image;
      pkt.w   = self.tilesets[tile].tilewidth;
      pkt.h   = self.tilesets[tile].tileheight;
      //inizializzo delle variabili locali utili per rilevare le coordinate
      // -larghezza in celle dell'atlante del tileset
      W     = Math.floor(self.tilesets[tile].imagewidth / pkt.w);
      // -dimensioni delle celle comprensive della spaziatura
      tileW = pkt.w + self.tilesets[tile].spacing;
      tileH = pkt.h + self.tilesets[tile].spacing;

      //assegno le coordinate della cella
      //le coordinate sono relative al margine impostato sul tileset
      pkt.x = self.tilesets[tile].margin + Math.floor(index % W) * tileW;
      pkt.y = self.tilesets[tile].margin + Math.floor(index / W) * tileH;
    }
    //verifico l'esistenza di un'animazione corrispondente alla cella in questione
    if (self.tilesets[tile].tiles && self.tilesets[tile].tiles[index] && self.tilesets[tile].tiles[index].animation){
      pkt.animation = self.tilesets[tile].tiles[index].animation;
    }
    //verifico l'esistenza di oggetti nella corrispondente alla cella in questione
    if (self.tilesets[tile].tiles && self.tilesets[tile].tiles[index] && self.tilesets[tile].tiles[index].objectgroup){

      pkt.obj = Object.create(null);
      obj = self.tilesets[tile].tiles[index].objectgroup.objects;

      for (var i in obj){
        //inizializzo l'oggetto da classificare
        //verifico la tipologia dell'oggetto
        newObj.x  = Math.floor(obj[i].x);
        newObj.y  = Math.floor(obj[i].y);
        newObj.w  = Math.floor(obj[i].width);
        newObj.h  = Math.floor(obj[i].height);
        newObj.pnt= Object.create(null);
        if (obj[i].polygon){
          newObj.polygon = true;
          for (var pnt = 0 ; pnt < obj[i].polygon.length ; ++pnt){
            newObj.pnt[pnt] = Object.create(null);
            newObj.pnt[pnt].x = Math.floor(newObj.x + obj[i].polygon[pnt].x);
            newObj.pnt[pnt].y = Math.floor(newObj.y + obj[i].polygon[pnt].y);
          }
        } else if (obj[i].polyline){
          newObj.polyline = true;
          for (var pnt = 0 ; pnt < obj[i].polyline.length ; ++pnt){
            newObj.pnt[pnt] = Object.create(null);
            newObj.pnt[pnt].x = Math.floor(newObj.x + obj[i].polyline[pnt].x);
            newObj.pnt[pnt].y = Math.floor(newObj.y + obj[i].polyline[pnt].y);
          }
        } else if (obj[i].ellipse ){
          newObj.ellipse = true;
          newObj.pnt[0] = Object.create(null);
          newObj.pnt[0].x = Math.floor(newObj.x +(newObj.w / 2));
          newObj.pnt[0].y = Math.floor(newObj.y +(newObj.h / 2));
        } else {
          newObj.rectangle = true;
          newObj.pnt[0] = Object.create(null);
          newObj.pnt[0].x = Math.floor(newObj.x);
          newObj.pnt[0].y = Math.floor(newObj.y);
          newObj.pnt[1] = Object.create(null);
          newObj.pnt[1].x = Math.floor(newObj.x + newObj.w);
          newObj.pnt[1].y = Math.floor(newObj.y);
          newObj.pnt[2] = Object.create(null);
          newObj.pnt[2].x = Math.floor(newObj.x + newObj.w);
          newObj.pnt[2].y = Math.floor(newObj.y + newObj.h);
          newObj.pnt[3] = Object.create(null);
          newObj.pnt[3].x = Math.floor(newObj.x);
          newObj.pnt[3].y = Math.floor(newObj.y + newObj.h);
        }
        pkt.obj[i] = newObj;
      }
    }
    //restituisco l'oggetto pkt
    return pkt;
  };

  var parseMapTilesets = function(){

    var
        id = self.tilesets.length-1,
        maxTile = self.tilesets[id].firstgid;

    if (!self.tilesets[id].imageheight && !self.tilesets[id].imagewidth){
      maxTile += (self.tilesets[id].tiles.length - 1);
    } else {

      var
          W     = Math.floor(self.tilesets[id].imagewidth / self.tilesets[id].tilewidth),
          H     = Math.floor(self.tilesets[id].imageheight/ self.tilesets[id].tileheight);

      maxTile += ((W*H)- 1);
    }

    self.tiles[0] = undefined;
    for(id = 1; id <= maxTile; ++id){
      self.tiles[id] = dataPackCostructor(id);
    }
  };

  parseMapJSON();

  parseMapTilesets();

  window.map = MAP;
}(window.map));
