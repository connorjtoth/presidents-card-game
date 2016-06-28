/* functs.js */
function debounce(func, wait, immediate)
{
  var timeout;
  return function()
  {
    var context = this,
        args = arguments;
    var later = function()
    {
      timeout = null;
      if (!immediate)
        func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow)
      func.apply(context, args);
  };
};

var isEqual = function(a, b)
{
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length)
        return false;

    for (var i = 0; i < aProps.length; i++)
    {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName])
            return false;
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
};