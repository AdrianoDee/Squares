//Implementazione del metodo extend per gli Oggetti
;Object.prototype.extend = function (extendPrototype) {
  var hasOwnProperty = Object.hasOwnProperty;
  var object = Object.create(this);

  for (var property in extendPrototype) {
    if (hasOwnProperty.call(extendPrototype,property) ||
        typeof object[property] === 'undefined') {
          object[property] = extendPrototype[property];
        }
  }
  return object;
};
//Implementazione del metodo transfer per gli ArrayBuffer
if (!ArrayBuffer.transfer) {
    ArrayBuffer.transfer = function(source, length) {
        source = Object(source);
        var dest = new ArrayBuffer(length);
        if (!(source instanceof ArrayBuffer) || !(dest instanceof ArrayBuffer)) {
            throw new TypeError('Source and destination must be ArrayBuffer instances');
        }
        if (dest.byteLength >= source.byteLength) {
            var nextOffset = 0;
            var leftBytes = source.byteLength;
            var wordSizes = [8, 4, 2, 1];
            wordSizes.forEach(function(_wordSize_) {
                if (leftBytes >= _wordSize_) {
                    var done = transferWith(_wordSize_, source, dest, nextOffset, leftBytes);
                    nextOffset = done.nextOffset;
                    leftBytes = done.leftBytes;
                }
            });
        }
        return dest;
        function transferWith(wordSize, source, dest, nextOffset, leftBytes) {
            var ViewClass = Uint8Array;
            switch (wordSize) {
                case 8:
                    ViewClass = Float64Array;
                    break;
                case 4:
                    ViewClass = Float32Array;
                    break;
                case 2:
                    ViewClass = Uint16Array;
                    break;
                case 1:
                    ViewClass = Uint8Array;
                    break;
                default:
                    ViewClass = Uint8Array;
                    break;
            }
            var view_source = new ViewClass(source, nextOffset, Math.trunc(leftBytes / wordSize));
            var view_dest = new ViewClass(dest, nextOffset, Math.trunc(leftBytes / wordSize));
            for (var i = 0; i < view_dest.length; i++) {
                view_dest[i] = view_source[i];
            }
            return {
                nextOffset : view_source.byteOffset + view_source.byteLength,
                leftBytes : source.byteLength - (view_source.byteOffset + view_source.byteLength)
            }
        }
    };
}
//Implementazione RequestAnimationFrame cross browser
if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		       window.mozRequestAnimationFrame    ||
	      	 window.oRequestAnimationFrame      ||
		       window.msRequestAnimationFrame     ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );
		};
	} )();
}
