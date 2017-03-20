'use strict'

;function MapMan(mapJSON){

  var MAP = Object.create(null),
      self = MAP,
      totImg = 0,
      imgLoadCount = 0,
      objectgroups= [],
      tilesets = [];
  //------------------------------------------------------------------------------
  //prorietà processate dal file JSON ottenuto da TILED
  //immagini
  MAP.images = [];
  //livelli:
  MAP.layers = [];
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
  //bandiera di avvenuto caricamentodell'intera mappa
  MAP.fullyLoaded = false;
  //------------------------------------------------------------------------------
  //funzione per caricare le immagini della mappa
  var loadImg = function(src){
    //carico l'oggetto immagine
    var img = new Image();
    try{
      //stabilisco la funzione di callback
      img.onload = function () {
        //a caricamento atlante avvenuto incremento il contatore
        ++imgLoadCount;
        //verifico che tutti i file immagine siano stati caricati
        if (imgLoadCount === totImg)
          //se la verifica ha successo imposto la bandiera su 'vero'
          self.fullyLoaded = true;
      };
      //imposto la sorgente dell'immagine
      img.src = src;
    }catch(err){
      console.log("loadImg error: "+err.message);
      //incremento il contatore ugualmente
      ++imgLoadCount;
      //verifico che tutti i file immagine siano stati processati
      if (imgLoadCount === totImg)
        //se la verifica ha successo imposto la bandiera su 'vero'
        self.fullyLoaded = true;
      img = undefined;
    }
    return img;
  };

  var imgInMap = function (){
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
  };

  var parseMapJSON = function(){
    var
        id_1  = NaN,
        id_2  = NaN,
        imgSrc= "",
        img = null;
    //dimensioni mappa in unità celle
    self.numTiles.w = mapJSON.width  || 1;
    self.numTiles.h = mapJSON.height || 1;
    //dimensioni cella della mappa
    self.tileSize.w = Math.floor(mapJSON.tilewidth)    || 128;
    self.tileSize.ħ = Math.floor(mapJSON.tileheight/2) || 32;
    //dimensioni mappa in pixel
    self.mapSize.w = Math.floor(self.numTiles.w * self.tileSize.w) || 128;
    self.mapSize.h = Math.floor(self.numTiles.h * self.tileSize.ħ) || 64;
    //predispongo le dimensioni massime delle immagini
    MAP.maxImgSize.w = 0;
    MAP.maxImgSize.h = 0;
    //immagazzino i tilesets nel vettore relativo
    for(id_1 = 0; id_1 < mapJSON.tilesets.length; ++id_1){
      //carico i tileset composti da immagini O carico i tileset con atlante
      if (!mapJSON.tilesets[id_1].imageheight && !mapJSON.tilesets[id_1].imagewidth){
        self.images[id_1] = new Array();
        //in questo caso la proprietà image sarà un vettore di immagini
        for (id_2 in mapJSON.tilesets[id_1].tiles){
          if (mapJSON.tilesets[id_1].tiles[id_2].image){
            //carico l'immagine relativa al tile nel vettore
            imgSrc = "client/img/"+mapJSON.tilesets[id_1].tiles[id_2].image.replace(/^.*[\\\/]/,'');
            self.images[id_1][id_2] = loadImg(imgSrc);
          }
        }
      } else if(mapJSON.tilesets[id_1].image){
        //per ogni tileset carico l'atlante relativo come un immagine
        imgSrc = "client/img/"+mapJSON.tilesets[id_1].image.replace(/^.*[\\\/]/,'');
        self.images[id_1] = loadImg(imgSrc);
      }
      //imposto le dimensioni della cella più grande presente nella mappa
      if (mapJSON.tilesets[id_1].tilewidth  > self.maxImgSize.w) self.maxImgSize.w = mapJSON.tilesets[id_1].tilewidth;
      if (mapJSON.tilesets[id_1].tileheight > self.maxImgSize.h) self.maxImgSize.h = mapJSON.tilesets[id_1].tileheight;
      //assegno l'atlante alla proprietà immagine del tileset
      mapJSON.tilesets[id_1].image = self.images[id_1];
      //inserisco il tileset nel vettore
      tilesets.push(mapJSON.tilesets[id_1]);
    }
    //inserisco i livelli nel vettore relativo
    for(id_1 = 0; id_1 < mapJSON.layers.length; ++id_1){
      //inserisco un segno di riconoscimento per il livello corrente
      mapJSON.layers[id_1].index  = id_1
      //se il livello è un livello immagini
      //carico l'immagine relativa prima di procedere
      if (mapJSON.layers[id_1].type === "imagelayer"){
        imgSrc = "client/img/"+mapJSON.layers[id_1].image.replace(/^.*[\\\/]/,'');
        //assegno l'immagine alla proprietà immagine del livello
        self.images[id_1 + mapJSON.tilesets.length] = loadImg(imgSrc);
        mapJSON.layers[id_1].image = self.images[id_1 + mapJSON.tilesets.length];
      }
      if (mapJSON.layers[id_1].type === "objectgroup")
        objectgroups.push(mapJSON.layers[id_1]);
      //se è un livello celle aggiungo l'ultimo valore
      if (mapJSON.layers[id_1].data)
        mapJSON.layers[id_1].data.push(0);
      //inserisco il livello nel vettore
      self.layers.push(mapJSON.layers[id_1]);
    }
  };

  var parsePolygon = function(obj){
    var max_min = function(points){
      var maxX = points[0].x,
          maxY = points[0].y,
          minX = points[0].x,
          minY = points[0].y;
      for(var i = 1; i < points.length; ++i){
        if(points[i].x < minX) minX = points[i].x;
        if(points[i].y < minY) minY = points[i].y;
        if(points[i].x > maxX) maxX = points[i].x;
        if(points[i].y > maxY) maxY = points[i].y;
      }
      return {"max":{"x":maxX,"y":maxY},"min":{"x":minX,"y":minY}};
    };
    for(var i in obj.polygon){
      obj.polygon[i].x += obj.x;
      obj.polygon[i].y += obj.y;
    }
    var pnt = max_min(obj.polygon);
    return {"w":Math.abs(pnt.max.x - pnt.min.x),"h":Math.abs(pnt.max.y - pnt.min.y),"pnt":pnt.min};
  };

  var parseObjInPack = function(obj){
    var objPack = new Array();
    for (var i in obj){
      var objElement = Object.create(null);
      //inizializzo l'oggetto da classificare
      //verifico la tipologia dell'oggetto
      objElement.x  = Math.floor(obj[i].x);
      objElement.y  = Math.floor(obj[i].y);
      objElement.w  = Math.floor(obj[i].width);
      objElement.h  = Math.floor(obj[i].height);
      objElement.pnt= Object.create(null);
      if (obj[i].polyline){
        /*newObj.polyline = true;
        for (var pnt = 0 ; pnt < obj[i].polyline.length ; ++pnt){
          newObj.pnt[pnt] = Object.create(null);
          newObj.pnt[pnt].x = Math.floor(newObj.x + obj[i].polyline[pnt].x);
          newObj.pnt[pnt].y = Math.floor(newObj.y + obj[i].polyline[pnt].y);
        }*/
        continue;
      } else if (obj[i].polygon){
        objElement.polygon = true;
        var polyData = parsePolygon(obj[i]);
        objElement.x  = Math.floor(polyData.pnt.x);
        objElement.y  = Math.floor(polyData.pnt.y);
        objElement.w  = Math.floor(polyData.w);
        objElement.h  = Math.floor(polyData.h);
        for (var pnt = 0 ; pnt < obj[i].polygon.length ; ++pnt){
          objElement.pnt[pnt] = Object.create(null);
          objElement.pnt[pnt].x = Math.floor(obj[i].polygon[pnt].x);
          objElement.pnt[pnt].y = Math.floor(obj[i].polygon[pnt].y);
        }
      } else if (obj[i].ellipse ){
        objElement.ellipse = true;
        objElement.pnt[0] = Object.create(null);
        objElement.pnt[0].x = Math.floor(objElement.x +(objElement.w / 2));
        objElement.pnt[0].y = Math.floor(objElement.y +(objElement.h / 2));
      } else {
        objElement.rectangle = true;
        objElement.pnt[0] = Object.create(null);
        objElement.pnt[0].x = Math.floor(objElement.x);
        objElement.pnt[0].y = Math.floor(objElement.y);
        objElement.pnt[1] = Object.create(null);
        objElement.pnt[1].x = Math.floor(objElement.x + objElement.w);
        objElement.pnt[1].y = Math.floor(objElement.y);
        objElement.pnt[2] = Object.create(null);
        objElement.pnt[2].x = Math.floor(objElement.x + objElement.w);
        objElement.pnt[2].y = Math.floor(objElement.y + objElement.h);
        objElement.pnt[3] = Object.create(null);
        objElement.pnt[3].x = Math.floor(objElement.x);
        objElement.pnt[3].y = Math.floor(objElement.y + objElement.h);
      }
      objPack.push(objElement);
    }
    return objPack;
  };

  var dataPackCostructor = function(dataValue){
    //genero un oggetto che organizza le informazioni che desidero
    var
        pkt = Object.create(null),
        tile = NaN,
        index = NaN,
        W = NaN,
        tileW = NaN,
        tileH = NaN;

    pkt.img = null;
    pkt.w = 0;
    pkt.h = 0;
    pkt.x = 0;
    pkt.y = 0;
    //rilevo il tileset di appartenenza della cella
    //effettuo un confronto tra 'dataValue' e il 'firstgid' di ogni tileset
    for(tile = tilesets.length - 1; tile >= 0; --tile)
      if(tilesets[tile].firstgid <= dataValue) break;
    // -indice della cella relativo al tileset di appartenenza
    index = dataValue - tilesets[tile].firstgid;

    if(!tilesets[tile].imageheight && !tilesets[tile].imagewidth){
      if(self.images[tile][index] instanceof Image)
        //assegno le proprietà dal tileset di immagini all'oggetto pkt
        pkt.img = self.images[tile][index];
        pkt.w   = Promise.resolve(Math.floor(pkt.img.width - tilesets[tile].spacing));
        pkt.h   = Promise.resolve(Math.floor(pkt.img.height- tilesets[tile].spacing));
      pkt.x   = Math.floor(tilesets[tile].margin);
      pkt.y   = Math.floor(tilesets[tile].margin);
    } else if(self.images[tile] instanceof Image){
      //assegno le proprietà dal tileset all'oggetto pkt
      pkt.img = self.images[tile];
      pkt.w   = Math.floor(tilesets[tile].tilewidth);
      pkt.h   = Math.floor(tilesets[tile].tileheight);
      //inizializzo delle variabili locali utili per rilevare le coordinate
      // -larghezza in celle dell'atlante del tileset
      W     = Math.floor(tilesets[tile].imagewidth / pkt.w);
      // -dimensioni delle celle comprensive della spaziatura
      tileW = pkt.w + tilesets[tile].spacing;
      tileH = pkt.h + tilesets[tile].spacing;

      //assegno le coordinate della cella
      //le coordinate sono relative al margine impostato sul tileset
      pkt.x = Math.floor(tilesets[tile].margin + Math.floor(index % W) * tileW);
      pkt.y = Math.floor(tilesets[tile].margin + Math.floor(index / W) * tileH);
    }
    //verifico l'esistenza di un'animazione corrispondente alla cella in questione
    if (tilesets[tile].tiles && tilesets[tile].tiles[index] && tilesets[tile].tiles[index].animation)
      pkt.animation = true;
    //verifico l'esistenza di oggetti nella corrispondente alla cella in questione
    if (tilesets[tile].tiles && tilesets[tile].tiles[index] && tilesets[tile].tiles[index].objectgroup)
      pkt.obj = parseObjInPack(tilesets[tile].tiles[index].objectgroup.objects);
    //restituisco l'oggetto pkt
    return pkt;
  };

  var parseMapTiles = function(){

    var
        id = tilesets.length-1,
        maxTile = tilesets[id].firstgid;

    if (!tilesets[id].imageheight && !tilesets[id].imagewidth){
      maxTile += (tilesets[id].tiles.length - 1);
    } else {

      var
          W     = Math.floor(tilesets[id].imagewidth / tilesets[id].tilewidth),
          H     = Math.floor(tilesets[id].imageheight/ tilesets[id].tileheight);

      maxTile += ((W*H)- 1);
    }

    self.tiles[0] = undefined;
    for(id = 1; id <= maxTile; ++id){
      self.tiles[id] = dataPackCostructor(id);
    }
  };

  var parseMapObj = function(){

    var objPosition = function(obj,list){
      var id = 0;
      for(id = 0; id < list.length; ++id){
        if(obj.y < list[id].y)
          break;
        if(obj.y === list[id].y)
          if(obj.x <= list[id].x)
            break;
      }
      list.splice(id,0,obj);
    };

    var objList,
        obj;

    for(var id_1 = 0; id_1 < objectgroups.length; ++id_1){
      objList = new Array();
      for(var id_2 = 0; id_2 < objectgroups[id_1].objects.length; ++id_2){
        obj = objectgroups[id_1].objects[id_2];
        if(obj.polyline){
          continue;
        } else if(obj.gid){
          obj.height= Math.floor(self.tiles[obj.gid].h);
          obj.width = Math.floor(self.tiles[obj.gid].w);
          obj.x = Math.floor(obj.x);
          obj.y = Math.floor(obj.y - obj.height);
        } else if(obj.polygon){
          var dimension = parsePolygon(obj);
          obj.x = Math.floor(dimension.pnt.x);
          obj.y = Math.floor(dimension.pnt.y);
          obj.height= Math.floor(dimension.h);
          obj.width = Math.floor(dimension.w);
        } else {
          obj.x = Math.floor(obj.x);
          obj.y = Math.floor(obj.y);
          obj.width = Math.floor(obj.width);
          obj.height= Math.floor(obj.height);
        }
        objPosition(obj,objList);
      }
      objectgroups[id_1].objects = objList;
      self.layers[objectgroups[id_1].index] = objectgroups[id_1];
    }
  };

  imgInMap();

  parseMapJSON();

  parseMapTiles();

  parseMapObj();

  return MAP;
};

(function(){
  for(var mapName in TileMaps)
    window.map = MapMan(TileMaps[mapName]);
  delete window.TileMaps;
}());
