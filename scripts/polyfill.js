if (Array.prototype.pop_i == undefined) {
  Array.prototype.pop_i = function(i) {
    var ret = this[i];
    
    for (var j=i; j<this.length-1; j++) {
      this[j] = this[j+1];
    }
    
    this.length--;
    return ret;
  }
}

Number.prototype.__keystr__ = function() {
  return ""+this;
}

String.prototype.__keystr__ = function() {
  return this;
}

Boolean.prototype.__keystr__ = function() {
  return ""+this;
}

if (Array.prototype.remove == undefined) {
  Array.prototype.remove = function(item) {
    var i = this.indexOf(item);
    if (i < 0) {
      console.log("Warning: invalid item passed to Array.remove", item);
      return;
    }
    
    return this.pop_i(i);
  }
}

if (Math.atan2 == undefined) {
  Math.atan2 = function(x, y) {
    if (x > 0)
      return Math.atan(y/x);
    else if (y >= 0 && x < 0)
      return Math.atan(y/x) + Math.PI;
    else if (y < 0 && x < 0)
      return Math.atan(y/x) - Math.PI;
    else if (y > 0 && x == 0)
      return Math.PI*0.5;
    else if (y < 0 && x == 0)
      return -Math.PI*0.5;
    else
      return undefined;
  }
}
