/**
 * @file Provides constants for client-side
 * @author Connor J. Toth 
 */

Constants = {
  
  /** Array of character representation of valid card suits */
  suits: ['H', 'S', 'D', 'C'],

  /** Array of valid integer card ranks */
  ranks: (function ( ) {
    var ret = new Array( );
    for ( var i = 1; i < 14; i++ )
      ret.push(i);
    return ret;
  })( ),

  /** Pixel size of visual card representation */
  cardSize: { x: 120, y: 160 },

  /** Array sorted for Presidents value/trump weight */
  sortOrder: [ 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 14 ]

};
