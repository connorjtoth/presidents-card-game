var debounce = function ( funct, wait, immediate ) {
  var timeout;
  return function ( ) {
    var context = this;
    var args = arguments;
    var later = function ( ) {
      timeout = null;
      if ( !immediate ) {
        funct.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if ( callNow ) {
      funct.apply(context, args);
    }
  };
};


var isEqual = function ( ) {
  /* checks arbitrary number of element equality */
  var args = arguments;

  // obviously equal if less than 2 objects
  if ( args.length < 2 ) {
    return true;
  }

  // create arrays of property names
  var props = new Array(args.length);
  for ( var i = 0; i < args.length; i++ ) {
    props[i] = Object.getOwnPropertyNames(args[i]);
  }

  // not equal if not same number of properties
  var propCount = props[0].length;
  for ( var i = 1; i < args.length; i++ ) {
    if ( props[i].length != propCount ) {
      return false;
    }
  }

  // finally determine if the values of same property are equal
  for ( var i = 0; i < props[0].length; i++ ) {
    var propName = props[0][i];

    for ( var j = 0; j < props.length; j++ ) {
      if ( props[0][propName] !== props[j][propName]) {
        return false;
      }
    }
  }

  return true;
};