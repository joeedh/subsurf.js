/*
  small library for wrangling topological (verts/edges/faces) arrays
*/
var _elementarray;

define([
  "util",
], function(util) {
  "use strict";
  
  var exports = {};
  
  var NULLITEM = {};
  var ElementArray = exports.ElementArray = function(eidmap) {
    this._array = [];
    
    this.eidmap = eidmap;
    this.length = 0;
   
    this.indexmap = {};
    this.freelist = [];
  };
  
  util.new_prototype(ElementArray, {
    push : function(item) {
      var i;
      if (1) { //this.freelist.length == 0) {
        i = this._array.length;
        this._array.push(item);
      } else {
        i = this.freelist.pop();
        this._array[i] = item;
      }
      
      item.__idx = i;
      this.length++;
    },
    
    change_eid : function(e, eid) {
      e.eid = eid;
    },
    
    remove : function(item) {
      if (item == undefined) return;
      
      var i = item.__idx;
      if (i == undefined) {
        console.trace("Bad clal to elementarray.remove", item._freed, key);
        return;
      }

      item._freed = 1;
      this.freelist.push(i);

      this._array[i] = NULLITEM;
      this.length--;
    },
    
    has : function(item) {
      var bad = item != undefined && typeof item == "object" && "__idx" in item && !("_freed" in item);
      bad = bad && this._array[item.__idx] === item;
      
      return bad;
    },
    
    forEach : function(cb, thisvar) {
      for (var i=0; i<this._array.length; i++) {
        var item = this._array[i];
        
        if (item === NULLITEM) continue;
        
        if (thisvar != undefined)
          cb.call(thisvar, item);
        else
          cb(item);
      }
    }
  });
  
  _elementarray = exports;
  return exports;
});
