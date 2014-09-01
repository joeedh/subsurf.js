"use strict";

/*
  a really small utility library.  includes a really simple type/class system,
  which you should be able to plug into any existing type library out there
  (hopefully).
*/

var _util = undefined;
define([
  "polyfill"
], function(polyfill) {
  var exports = {};
  
  var prototype_idgen = 0;
  var new_prototype = exports.new_prototype = function(cls, proto, name) {
    if (name != undefined) {
     // cls.name = name; argh, stupid read-only constructor names
    }
    
    cls.__parent__ = undefined;
    cls.__prototypeid__ = prototype_idgen++;
    cls.prototype = proto;
    
    return cls.prototype;
  };
  
  var inherit = exports.inherit = function(cls, parent, childproto, name) {
    if (name != undefined) {
     // cls.name = name; argh, stupid read-only constructor names
    }
    
    cls.__parent__ = parent;
    cls.__prototypeid__ = prototype_idgen++;
    cls.prototype = Object.create(parent.prototype);
    
    for (var k in childproto) {
      cls.prototype[k] = childproto[k];
      if (k in parent.prototype)
        cls.prototype[k].base = parent.prototype[k];
    }
    
    return cls.prototype;
  }
  
  //ordered set class
  var set = exports.set = function(input) {
    this.items = [];
    this.map = {};
    
    if (input instanceof set) {
      for (var i=0; i<input.items.length; i++) {
      }
    }
    
    this.length = 0;
  };
  
  var _set_null = {};
  new_prototype(set, {
    add : function(item) {
      var k = item.__keystr__();
      if (k in this.map) return;
      
      this.map[k] = Math.floor(this.items.length/2);
      
      this.items.push(k);
      this.items.push(item);
      
      this.length++;
    },
    
    remove : function(item) {
      var k = item.__keystr__();
      if (!(k in this.map)) return;
      
      var i = this.map[k];
      delete this.map[k];
      
      this.items[i*2] = _set_null;
      this.items[i*2+1] = _set_null;
      
      this.length--;
    },
    
    has : function(item) {
      return item.__keystr__() in this.map;
    },
    
    forEach : function(cb, thisvar) {
      for (var i=0; i<this.items.length; i += 2) {
        var item = this.items[i+1];
        if (item === _set_null) continue;
        
        if (thisvar != undefined) {
          cb.call(thisvar, item);
        } else {
          cb(item);
        }
      }
    }
  });
  
  var IDGen = exports.IDGen = function() {
    this.curid = 0;
  };
  
  new_prototype(IDGen, {
    gen    : function() {
      return this.curid++;
    },
    
    max_id : function(id) {
      this.curid = Math.max(this.curid, id+1);
    },
    
    toJSON : function() {
      return this.curid;
    }
  });
  
  var cachering = exports.cachering = function(createfunc, num) {
    this.items = [];
    this.cur = 0;
    
    for (var i=0; i<num; i++) {
      this.items.push(createfunc());
    }
  };
  
  new_prototype(cachering, {
    next : function() {
      var ret = this.items[this.cur];
      this.cur = (this.cur+1)%this.items.length;
      
      return ret;
    }
  });
  
  cachering.fromConstructor = function(cls, num) {
    var createfunc = function() {
      return new cls();
    }
    
    return new cachering(createfunc, num);
  }
  
  var EventManager = exports.EventManager = function() {
    this.stack = [];
  };
  
  new_prototype(EventManager, {
    push_modal : function(obj) {
      var handlers = {};
      var obj2 = {ob : obj, handlers : handlers};
      
      for (var k in obj) {
        if (k[0] == "o" && k[1] == "n") {
          handlers[this.norm_name(k)] = obj[k];
        }        
      }
      
      this.stack.push(obj2);
    },
    
    pop_modal : function(obj) {
      return this.stack.pop();
    },
    
    consume_event : function(name, event) {
      if (this.stack.length == 0) return false;
      
      var ret = this.norm_name(name) in this.stack[this.stack.length-1].handlers;
      
      this.feed_event(name, event);
      return ret;
    },
    
    feed_event : function(name, event) {
      var h = this.stack[this.stack.length-1];
      name = this.norm_name(name);
      
      if (!(name in h.handlers)) {
        return;
      }
      
      h.handlers[name].call(h.ob, event);
    },
    
    norm_name : function(name) {
      if (name[0] == "o" && name[1] == "n") {
        if (name[2] == "_") name = name.slice(3, name.length);
        else name = name.slice(2, name.length);
      }
      
      name = name.toLowerCase();
      
      return name;
    }
  });
  
  _util = exports;
  return exports;
})
