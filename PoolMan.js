'use strict'

;module.exports = function PoolMan(DATAKEYS, //vettore delle chiavi degli oggetti in pool
                                   poolType,
                                   poolStartDimension,
                                   increment){

  var
      POOL = Object.create(null),
      poolType = poolType || "",
      poolStartDimension = poolStartDimension || 100,
      increment = increment || Math.floor(poolStartDimension/2);
  //imposto i DATAKEYS in caso di passaggio di un vettore come elemento della
  if(typeof DATAKEYS === "number"){
    var array = new Array();
    for(var i = 0; i < DATAKEYS; ++i){
      array[i] = i;
    }
    DATAKEYS = array;
  }

  //properties
  POOL.poolDimension = NaN;

  POOL.pool    = null;

  POOL.inIndex = null;

  POOL.outIndex= null;

  //methods
  POOL.createPoolElement = function(){

    var newElement = Object.create(null);

    for(var key in DATAKEYS)
        newElement[DATAKEYS[key]] = null;

    return newElement;
  };
  POOL.modifyPoolElement = function(index,data){

    for(var key in DATAKEYS)
      if(data[DATAKEYS[key]])
        this.pool[index][DATAKEYS[key]] = data[DATAKEYS[key]];
  };
  POOL.modifyPoolDimension = function(flag,DELTA){

    var
        DELTA = DELTA || increment,
        flag = flag || false,
        id = NaN,
        key= "",
        newDimension = NaN,
        newPool = Object.create(null);

    if(!flag){
      newDimension = this.poolDimension+DELTA;

      for(id = this.poolDimension; id < newDimension; ++id){
        this.outIndex.push(id);
        this.pool[id] = this.createPoolElement();
      }
    } else {
      newDimension = this.poolDimension-DELTA;

      if(this.inIndex.length > newDimension)
        this.inIndex = this.inIndex.slice(this.inIndex.length-newDimension);

      this.outIndex = new Array();

      for(id = 0; id < newDimension; ++id){
        if(this.inIndex.hasOwnProperty(id)){
          newPool[id] = this.pool[this.inIndex[id]];
          this.inIndex[id] = id;
        } else {
          newPool[id] = this.createPoolElement();
          this.outIndex.push(id);
        }
      }

      this.pool = newPool;
    }
    this.poolDimension = newDimension;
  };
  POOL.init = function(dimension){

    var dimension = dimension || poolStartDimension;

    this.poolDimension = 0;

    this.pool    = Object.create(null);

    this.inIndex = new Array();

    this.outIndex= new Array();

    this.modifyPoolDimension(false,dimension);
  };
  POOL.insert = function(data){

    var index = NaN;

    if(this.outIndex.length <= 0)
      this.modifyPoolDimension();

    index = this.outIndex[0];

    this.outIndex.splice(0,1);

    this.inIndex.push(index);

    this.modifyPoolElement(index,data);

    return index;
  };
  POOL.delete = function(index){

    for(var id = 0; id < this.inIndex.length; ++id){
      if(index === this.inIndex[id]){
        this.inIndex.splice(id,1);
        this.outIndex.push(index);
      }
    }
  };
  POOL.poolType = function(){
    return poolType;
  };
  POOL.dataKeys = function(){
    return DATAKEYS;
  };
  POOL.getPool = function(){
    return {"pool" : this.pool, "index" : this.inIndex};
  };

  POOL.init();

  return POOL;
};
