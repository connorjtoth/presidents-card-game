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

var Table = function( starter )
{
  var table = starter || new Array();

  this.remove = function ( entry )
  {
    for (var i = 0; i < table.length; i++)
    {
      if ( isEqual( table[i], entry ) )
      {
        table.splice(i, 1);
        break;
      }
    }
  };

  this.removeLast = function ( entry )
  {
    for (var i = table.length - 1; i >= 0; i--)
    {
      if ( isEqual(table[i], entry) )
      {
        table.splice(i, 1);
        break;
      }
    }
  };

  this.removeAll = function ( entry )
  {
    for (var i = 0; i < table.length; i++)
    {
      if ( isEqual( table[i], entry) )
      {
        table.splice(i, 1);
      }
    }
  };

  this.removeSet = function ( entryArr )
  {
    for ( var entry of entryArr)
    {
      this.remove( entry );
    }
  };

  this.arr = function ( )
  {
    return table;
  };

  this.push = function ( obj )
  {
    table.push(obj);
  };
  
  this.contains = function ( query )
  {
    for (var entry of table)
    {
      if ( isEqual(entry, query))
        return true;
    }
    return false;
  };

};

if (module !== undefined)
  module.exports = Table;