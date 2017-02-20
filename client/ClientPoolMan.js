;function ClientPoolManager(DATATYPES, //array value: "Int8","Uint8",
                                       //             "Int16","Uint16",
                                       //             "Int32","Uint32","Float32",
                                       //             "Float64"
                           elementConstructor){
  //private properties
  var
      dataTypes     = DATATYPES;
      numByte       = [],  //for every dataType slot
      groupSize     = 0,   //total entity byte size
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
    for(i = 0; i < numByte.length; ++i)
      groupSize += numByte[i];
	}());
	//properties
  this.parsedPool = [];
  this.inIndex = [];
  this.pool = [/*buffer,inIndex*/];
  //methods
  this.decode = function(encodedData,index){

    var offset = index*groupSize,
        decodedData = [];

    for(var i = 0; i < dataTypes.length; ++i){
      decodedData.push(encodedData["get"+dataTypes[i]](offset));
      offset += numByte[i];
    }
    return decodedData;
  };

  this.parsePool = function(){

    var i,
        data = new DataView(this.pool[0]/*buffer*/);
        parsedElements = this.parsedPool.length,
        poolElements = this.pool[2];
    //verifico che vi sia sufficiente spazio nella parsedPool
    if(parsedElements !== poolElements){
      if(parsedElements < poolElements)
        for(i = parsedElements; i < poolElements; ++i)
          this.parsedPool[i] = new elementConstructor();
      else this.parsedPool = this.parsedPool.slice(0,poolElements);
    }
    //acquisisco la lista degli indici attivi
    this.inIndex = this.pool[1];
    //aggiorno gli elementi attivi nella parsedPool
    for(i = 0; i < this.inIndex.length; ++i)
      this.parsedPool[this.inIndex[i]] = this.decode(data,this.inIndex[i]);

  };

  this.getDataTypes = function(){
    return dataTypes;
  };

  this.getNumByte = function(){
    return numByte;
  };
};
