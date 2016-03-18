'use strict';

const path = require('path');
const sql = require(path.join(__dirname, '../sql'));

module.exports = function(db) {
  return {
    create: function(){
      return db.none(sql.hunts.create);
    },
    // Values: {owner_id:, deadline:, wager:}
    add: function(values){
      return db.one(sql.hunts.add, values);
    }
  };
};
