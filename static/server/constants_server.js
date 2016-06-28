exports.suits = ['H', 'S', 'D', 'C'];

exports.ranks = (function()
    {
      var ret = new Array();
      for (var i = 1; i < 14; i++)
        ret.push(i);
      return ret;
    })();

exports.cardSize = {x: 120, y: 160};

exports.Presidents = 
{
  sortOrder: [3,4,5,6,7,8,9,10,11,12,13,1,2,14]
};
