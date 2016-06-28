var Table = function( starter )
{
  table = starter || new Array();
};

Table.prototype = 
{
  remove: function ( entry )
  {
    for (var i = 0; i < table.length; i++)
    {
      if ( isEqual( table[i], entry ) )
      {
        table.splice(i, 1);
        break;
      }
    }
  },

  removeLast: function ( entry )
  {
    for (var i = table.length - 1; i >= 0; i--)
    {
      if ( isEqual(table[i], entry) )
      {
        table.splice(i, 1);
        break;
      }
    }
  },

  removeAll: function ( entry )
  {
    for (var i = 0; i < table.length; i++)
    {
      if ( isEqual( table[i], entry) )
      {
        table.splice(i, 1);
      }
    }
  },

  removeSet: function ( entryArr )
  {
    for ( var entry of entryArr)
    {
      this.remove( entry );
    }
  },

  arr: function ( )
  {
    return table;
  },

  push: function ( obj )
  {
    table.push(obj);
  },

  contains: function ( query )
  {
    for (var entry of table)
    {
      if ( isEqual(entry, query))
        return true;
    }
    return false;
  }
};