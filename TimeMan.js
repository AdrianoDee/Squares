'use strict'
//time manager
;module.exports = (function TimeManager(){

  var poolMan = require('./PoolMan.js'),
      TIME    = Object.create(null),
      self = TIME;
//------------------------------------------------------------------------------
//properties
  TIME.currentTime = Date.now();
  TIME.signals     = poolMan(["startTime","interval","callback"],"time");
//------------------------------------------------------------------------------
//method
  TIME.startSignal= function(interval,callback){

    var data = Object.create(null);
    data.startTime = Date.now();
    data.interval = (typeof interval === "number"? interval : 1000);
    data.callback = (typeof callback === "function"? callback : undefined);
    return self.signals.insert(data);
  };
  TIME.modifySignal= function(signalId,interval,callback){
    var data = Object.create(null);
    if(typeof interval === "number")
      data.interval = interval;
    if(typeof callback === "function")
      data.callback = callback;
    self.signals.modifyPoolElement(signalId,data);
    return signalId;
  };
  TIME.checkSignal= function(signalId){
    var
        signal = self.signals.pool[signalId],
        startTime  = signal.startTime,
        interval   = signal.interval,
        currentTime= self.currentTime,
        elapsed    = currentTime - startTime;

    if(interval <= elapsed){
      signal.startTime = currentTime - (elapsed % interval);
      signal.callback(signalId);
    }
  };
  TIME.startAnimation = function(animation,callback){
    var id = 0;

    if(!animation) return NaN;

    callback(animation[0].tileid);

    return self.startSignal(animation[id].duration,
      function(signalId){
        id = (++id % animation.length);
        callback(animation[id].tileid);
        self.modifySignal(signalId,animation[id].duration);
      },0);
  };
  TIME.stopAnimation = function(animId){
    self.signals.delete(animId);
  };
  TIME.update = function(){
    self.currentTime = Date.now();
    for(var id = 0; id < self.signals.inIndex.length; ++id)
      self.checkSignal(self.signals.inIndex[id]);
  };

  return TIME;
}());
