;function PoolManager(DATATYPES, //array value: "Int8","Uint8",
                                 //             "Int16","Uint16",
                                 //             "Int32","Uint32","Float32",
                                 //             "Float64"
                      startPoolDimension){
  //private properties
  var
      dataTypes     = DATATYPES;
      poolDimension = startPoolDimension;
      numByte       = [],  //for every dataType slot
      groupSize     = 0,   //total entity byte size
      //buffer      = null,//byte array for entities
      //inIndex     = [],  //indices of in game entities
      outIndex      = [],  //indices of out game entities
      poolIncrement = 0;   //counter of all pool memory increment
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
	}())
	//properties
  this.pool = [/*buffer,inIndex*/];
  //methods
  this.init = function(){

  	var buffer = null,
  			inIndex = new Array();

    poolDimension = startPoolDimension;
    groupSize     = 0;
    poolIncrement = 0;

    for(i = 0; i < numByte.length; ++i)
      groupSize += numByte[i];
    for(i = 0; i < poolDimension; ++i)
      outIndex.push(i);

    buffer = new ArrayBuffer(poolDimension*groupSize);

    this.pool = [buffer,inIndex,poolDimension];

  };

  this.encode = function(dataArray,index){

    var offset = index*groupSize,
        encodedData = new DataView(this.pool[0]/*buffer*/);

    for(var i = 0; i < dataTypes.length; ++i){
      encodedData["set"+dataTypes[i]](offset,dataArray[i]);
      offset += numByte[i];
    }
  };

  this.decode = function(index){

    var offset = index*groupSize,
        encodedData = new DataView(this.pool[0]/*buffer*/);
        decodedData = [];

    for(var i = 0; i < dataTypes.length; ++i){
      decodedData.push(encodedData["get"+dataTypes[i]](offset));
      offset += numByte[i];
    }
    return decodedData;
  };

  this.insert = function(dataArray){

    var index = NaN;

    if(outIndex.length > 0){
      index = outIndex[0];
      outIndex.splice(0,1);

    } else {
      index = poolDimension;
      for(i = poolDimension + 1; i < Math.floor(1.5*poolDimension); ++i)
        outIndex.push(i);
      poolDimension = Math.floor(1.5*poolDimension);
      this.pool[0]/*buffer*/ = ArrayBuffer.transfer(this.pool[0]/*buffer*/,poolDimension*groupSize);
      this.pool[2] = poolDimension;
      ++poolIncrement;
    }

    this.encode(dataArray,index);
    this.pool[1]/*inIndex*/.push(index);
    return index;

  };

  this.delete = function(index){

    for(var i = 0; i < this.pool[1]/*inIndex*/.length; ++i){
      if(this.pool[1]/*inIndex*/[i] === index){
        this.pool[1]/*inIndex*/.splice(i,1);
        outIndex.push(index);
        return;
      }
    }
  };

  this.getDataTypes = function(){
    return dataTypes;
  };

  this.getNumByte = function(){
    return numByte;
  };
};
