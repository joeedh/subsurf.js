define([
  "util", "vectormath", "math", "draw"
], function(util, vectormath, math, draw) {
  "use strict";
  
  var exports = {};
  
  var Vector2 = vectormath.Vector2;
  var Vector3 = vectormath.Vector3;
  var Vector4 = vectormath.Vector4;
  var Quat = vectormath.Quat;
  var Matrix4 = vectormath.Matrix4;
  
  var ElementTypes = exports.ElementTypes = {
    VERTEX : 1,
    EDGE   : 2,
    LOOP   : 4,
    FACE   : 8
  };
  
  var ElementFlags = exports.ElementFlags = {
    SELECT : 1,
    DIRTY  : 2
  };
  
  var Element = exports.Element = function(type) {
    this.eid = 0;
    this.type = type;
    this.flag = 0;
    this.index = 0;
  }
  
  util.new_prototype(Element, {
    __keystr__ : function() {
      return this.constructor.name[5] + this.eid;
    }
  }, "mesh.Element");
  
  var Vertex = exports.Vertex = function(co, no) {
    Element.call(this, ElementTypes.VERTEX);
    
    this.l = undefined;
    
    this.co = new Vector3(co);
    this.no = new Vector3(no);
    
    var this2 = this;
    
    //faces around vert iterator 
    this.faces = {
      forEach : function(cb, thisvar) {
        if (this2.l ==  undefined) return;
        if (this2.edges == undefined) return;
        
        var fset = {};
        for (var i=0; i<this2.edges.length; i++) {
          var e = this2.edges[i];
          var l = e.l;
          
          if (l == undefined) continue;
          
          var c = 0;
          do {
            if (c++ > 1000) {
              console.trace("Infinite loop detected");
              break;
            }
            
            if (!(l.f.eid in fset)) {
              fset[l.f.eid] = 1;
              
              if (thisvar != undefined)
                cb.call(thisvar, l.f);
              else
                cb(l.f);
            }
            
            l = l.radial_next;
          } while (l != e.l);
        }
      }
    }
    
    //loops around vert iterator
    this.loops = {
      forEach : function(cb, thisvar) {
        for (var i=0; i<this2.edges.length; i++) {
          var e = this2.edges[i];
          var l = e.l;
          
          if (l == undefined) continue;
          
          var c = 0;
          do {
            if (c++ > 1000) {
              console.trace("Infinite loop detected");
              break;
            }
            
            var lret = l.v != this2 ? l.next : l;
            
            if (thisvar != undefined)
              cb.call(thisvar, lret);
            else
              cb(lret);
            
            l = l.radial_next;
          } while (l != e.l);
        }
      }
    }
    
    var iterlength = {
      get : function() {
        var i = 0;
        this.forEach(function(v) {
          i++;
        }, this);
        
        return i;
      }
    };
    
    Object.defineProperty(this.faces, "length", iterlength);
    Object.defineProperty(this.loops, "length", iterlength);
    
    this.edges = [];
  };
  
  Vertex.prototype = util.inherit(Vertex, Element, {
  }, "mesh.Vertex");
  
  var Edge = exports.Edge = function(v1, v2) {
    Element.call(this, ElementTypes.EDGE);
    
    this.l = undefined;
    
    this.v1 = v1;
    this.v2 = v2;
    
    var this2 = this;
    this.faces = {
      forEach : function(cb, thisvar) {
        if (this2.l ==  undefined) return;
          
        var l = this2.l;
        var c = 0;
        do {
          if (c++ > 1000) {
            console.trace("warning, infinite loop detected");
            break;
          }
          
          if (thisvar != undefined) {
            cb.call(thisvar, l.f);
          } else {
            cb(l.f);
          }
          
          l = l.radial_next;
        } while (l != this2.l);
      }
    }
    
    var this2 = this;
    this.loops = {
      forEach : function(cb, thisvar) {
        if (this2.l ==  undefined) return;
          
        var l = this2.l;
        var c = 0;
        do {
          if (c++ > 1000) {
            console.trace("warning, infinite loop detected");
            break;
          }
          
          if (thisvar != undefined) {
            cb.call(thisvar, l);
          } else {
            cb(l);
          }
          
          l = l.radial_next;
        } while (l != this2.l);
      }
    }
    
    var iterlength = {
      get : function() {
        var i = 0;
        this.forEach(function(v) {
          i++;
        }, this);
        
        return i;
      }
    };
    
    Object.defineProperty(this.faces, "length", iterlength); 
  };
  
  Edge.prototype = util.inherit(Edge, Element, {
    other_face : function(f) {
      if (this.faces.length < 2) return f;
      
      if (this.faces[0] == f)
        return this.faces[1];
      else if (this.faces[1] == f)
        return this.faces[0];
      else
        console.trace("Error in Edge.other_face; f was:", f);
    },
    
    other_vert : function(v) {
      if (this.v1 == v)
        return this.v2;
      else if (this.v2 == v)
        return this.v1;
      
      console.trace("invalid call to Edge.other_vert!", v);
      return undefined;
    }
  }, "mesh.Edge");
  
  //half edge
  var Loop = exports.Loop = function(v, e, f) {
    Element.call(this, ElementTypes.LOOP);
    
    this.v = v;
    this.e = e;
    this.f = f;
    this.next = this.prev = undefined;
    this.radial_next = this.radial_prev = this;
  };
  
  util.inherit(Loop, Element, {
    
  });
  
  var Face = exports.Face = function() {
    Element.call(this, ElementTypes.FACE);
    
    this.no = new Vector3();
    this.center = new Vector3();
    
    this.l = 0; //circular linked list of half-edge "loops"
    this.totvert = 0;
    
    var this2 = this;
    this.loops = {
      forEach : function(cb, thisvar) {
        var l = this2.l;
        var c = 0;
        
        do {
          if (c++ > 1000) {
            console.trace("infinite loop detected");
            break;
          }
          
          if (thisvar != undefined)
            cb.call(thisvar, l);
          else
            cb(l);
          
          l = l.next;
        } while (l != this2.l);
      }
    };
    
    var iterlength = {
      get : function() {
        var i = 0;
        this.forEach(function(v) {
          i++;
        }, this);
        
        return i;
      }
    };
    
    Object.defineProperty(this.loops, "length", iterlength);
  };
  
  Face.prototype = util.inherit(Face, Element, {
  }, "mesh.Face");
  
  var Mesh = exports.Mesh = function() {
    this.verts = [];
    this.edges = [];
    this.faces = [];
    
    this.eidgen = new util.IDGen();
    this.eidmap = {};
    
    this.render = new draw.RenderBuffers();
  };
  
  util.new_prototype(Mesh, {
    make_vert : function(co, no) {
      var v = new Vertex(co, no);
      v.eid = this.eidgen.gen();
      this.eidmap[v.eid] = v;
      
      this.verts.push(v);
      return v;
    },
    
    get_edge : function(v1, v2) {
      for (var i=0; i<v1.edges.length; i++) {
        if (v1.edges[i].other_vert(v1) == v2) {
          return v1.edges[i];
        }
      }
      
      return undefined;
    },
    
    //check_exist is optional, defaults to true
    make_edge : function(v1, v2, check_exist) {
      if (check_exist == undefined)
        check_exist = true;
      
      if (check_exist) {
        for (var i=0; i<v1.edges.length; i++) {
          if (v1.edges[i].other_vert(v1) == v2) {
            return v1.edges[i];
          }
        }
      }
      
      var e = new Edge(v1, v2);
      e.eid = this.eidgen.gen();
      this.eidmap[e.eid] = e;
      
      v1.edges.push(e);
      v2.edges.push(e);
      
      this.edges.push(e);
      
      return e;
    },
    
    radial_loop_insert : function(l) {
      if (l.e.l == undefined) {
        l.radial_next = l.radial_prev = l;
        l.e.l = l;
        return;
      }
      
      var e = l.e;
      
      l.radial_prev = e.l;
      l.radial_next = e.l.radial_next;
      e.l.radial_next.radial_prev = l;
      e.l.radial_next = l;
      
      //e.l = l;
      
      if (l.v.l == undefined)
        l.v.l = l;
    },
    
    radial_loop_remove : function(l) {
      if (l.radial_next == undefined) {
        if (l == l.e.l)
          l.e.l = undefined;
        
        console.log("double free detected!");
        return;
      }
      
      if (l == l.e.l)
        l.e.l = l.radial_next;
      
      if (l == l.v.l) {
        var l2 = l.e.l;
        
        l.v.l = undefined;
        var c = 0;
        while (l2 != l) {
          if (l2.v == l.v) {
            l.v.l = l2;
            break;
          }
          
          if (c++ > 5) {
            console.trace("infinite loop in radial_loop_remove!");
            break;
          }
          
          l2 = l2.radial_next;
        }
      }
      
      if (l == l.e.l)
        l.e.l = undefined;
      
      l.radial_next.radial_prev = l.radial_prev;
      l.radial_prev.radial_next = l.radial_next;
      
      l.radial_next = l.radial_prev = undefined;
    },
    
    make_face : function(verts) {
      var f = new Face();
      
      f.totvert = verts.length;
      f.eid = this.eidgen.gen();
      
      this.eidmap[f.eid] = f;
      
      this.faces.push(f);
      
      //ensure all edges exist
      f.l = new Loop(verts[0], this.make_edge(verts[0], verts[1], true), f);
      f.l.eid = this.eidgen.gen();
      var lastl = f.l;
      
      for (var i=1; i<verts.length; i++) {
        var v1 = verts[i];
        var v2 = verts[(i+1)%verts.length];
        var e = this.make_edge(v1, v2, true);
        
        var l = new Loop(v1, e, f);
        l.eid = this.eidgen.gen();
        
        lastl.next = l;

        l.prev = lastl;
        
        lastl = l;
      }
      
      lastl.next = f.l;
      f.l.prev = lastl;
      
      var l = f.l;
      for (var i=0; i<verts.length; i++) {
        this.radial_loop_insert(l);
        l = l.next;
      }
        
      return f;
    },
    
    change_eid : function(e, eid) {
      this.eidgen.max_id(eid);
      delete this.eidmap[e.eid];
      
      e.eid = eid;
      this.eidmap[e.eid] = e;
    },
    
    copy : function() {
      var mesh2 = new Mesh();
      
      for (var i=0; i<this.verts.length; i++) {
        var v = this.verts[i];
        
        var newv = mesh2.make_vert(this.verts[i].co, this.verts[i].no);
        newv.flag = v.flag;
        
        //set correct eid
        mesh2.change_eid(newv, v.eid);
      }
      
      for (var i=0; i<this.edges.length; i++) {
        var e = this.edges[i];
        
        var v1 = mesh2.eidmap[e.v1.eid];
        var v2 = mesh2.eidmap[e.v2.eid];
        
        var newe = mesh2.make_edge(v1, v2, false);
        newe.flag = e.flag;
        
        //set correct eid
        mesh2.change_eid(newe, e.eid);
      };
      
      for (var i=0; i<this.faces.length; i++) {
        var f = this.faces[i];
        
        var verts = [];
        var l = f.l;
        var k = 0;
        do {
          var newv = mesh2.eidmap[l.v.eid];
          verts.push(newv);
          
          if (k++ > 100) {
            console.log("infinite loop");
            break;
          }
          
          l = l.next;
        } while (l != f.l);
        
        var newf = mesh2.make_face(verts);
        newf.flag = f.flag;
        newf.no.load(f.no);
        
         //set correct eid
        mesh2.change_eid(newf, f.eid);
     }
      
      return mesh2;
    },
    
    load : function(mesh) { //load data from another mesh structure
      this.verts = mesh.verts;
      this.edges = mesh.edges;
      this.faces = mesh.faces;
    },
    
    kill_vert : function(v) {
      while (v.edges.length > 0) {
        this.kill_edge(v.edges[0]);
      }
      
      delete this.eidmap[v.eid];
      this.verts.remove(v);
    },
    
    kill_edge : function(e) {
      var c = 0;
      while (e.l != undefined) {
        if (c++ > 10) {
          console.trace("infinite loop detected!");
          break;
        }
        
        this.kill_face(e.l.f);
      };
        
      e.v1.edges.remove(e);
      e.v2.edges.remove(e);
      
      delete this.eidmap[e.eid];
      this.edges.remove(e);
    },
    
    kill_face : function(f) {
      var l = f.l;
      var c = 0;
      do {
        this.radial_loop_remove(l);
        
        if (c++ > 100) {
          console.log("infinite loop!");
          break;
        }
        
        l = l.next;
      } while (l != f.l);
      
      delete this.eidmap[f.eid];
      this.faces.remove(f);
    },
    
    gen_buffers : function(gl) {
      this.render.destroy(gl);
      
      var cos = [];
      var clrs = [];
      var nos = [];
      
      var ecos = [];
      var eclrs = [];
      var enos = [];
      
      var clr = [0.75, 0.2, 0.8, 1.0];
      
      this.faces.forEach(function(f) {
        var l = f.l.next;
        do {
          var v1 = f.l.v, v2 = l.v, v3 = l.next.v;
          
          v1.co.concat_array(cos);
          v2.co.concat_array(cos);
          v3.co.concat_array(cos);
          
          v1.no.concat_array(nos);
          v2.no.concat_array(nos);
          v3.no.concat_array(nos);
    
          for (var j=0; j<12; j++) {
            clrs.push(clr[j%4]);
          }
          
          l = l.next;
        } while (l != f.l);
      }, this);
      
      var eclr = [0, 0, 0, 1];
      this.edges.forEach(function(e) {
        e.v1.co.concat_array(ecos);
        e.v2.co.concat_array(ecos);
        
        for (var i=0; i<8; i++) {
          eclrs.push(eclr[i%4]);
        }
      });
      
      var vbuf = this.render.buffer(gl, "tri_vbuf");
      var cbuf = this.render.buffer(gl, "tri_cbuf");
      var nbuf = this.render.buffer(gl, "tri_nbuf");
      
      cos = new Float32Array(cos); clrs = new Float32Array(clrs);
      nos = new Float32Array(nos);
      
      this.render.tri_totvert = cos.length/3;
      
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
      gl.bufferData(gl.ARRAY_BUFFER, cos, gl.STATIC_DRAW);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
      gl.bufferData(gl.ARRAY_BUFFER, clrs, gl.STATIC_DRAW);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, nbuf);
      gl.bufferData(gl.ARRAY_BUFFER, nos, gl.STATIC_DRAW);
      
      
      this.render.edge_totvert = ecos.length/3;
      
      var vbuf = this.render.buffer(gl, "edge_vbuf");
      var cbuf = this.render.buffer(gl, "edge_cbuf");
      
      ecos = new Float32Array(ecos); eclrs = new Float32Array(eclrs);
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
      gl.bufferData(gl.ARRAY_BUFFER, ecos, gl.STATIC_DRAW);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
      gl.bufferData(gl.ARRAY_BUFFER, eclrs, gl.STATIC_DRAW);
    },
    
    recalc_normals : function() {
      var faces = this.faces;
      var verts = this.verts;
      var n1 = new Vector3();
      var n2 = new Vector3();
      var n3 = new Vector3();
      
      for (var i=0; i<verts.length; i++) {
        verts[i].no.zero();
      }
      
      for (var i=0; i<faces.length; i++) {
        var f = faces[i];
        
        n1.load(f.l.v.co).sub(f.l.next.v.co).normalize();
        n2.load(f.l.prev.v.co).sub(f.l.next.v.co).normalize();
        n1.cross(n2).normalize();
        
        f.no.load(n1);
        
        f.center.zero();
        var l = f.l;
        do {
          l.v.no.add(f.no);
          l = l.next;
          f.center.add(l.v.co);
        } while (l != f.l);
        
        f.center.mulScalar(1.0/f.totvert);
      }
      
      for (var i=0; i<verts.length; i++) {
        verts[i].no.normalize();
      }
    },
    
    draw : function(gl, drawmats) {
      if (this.render.regen) {
        this.render.regen = 0;
        this.gen_buffers(gl);
      }
      
      var vbuf = this.render.buffer(gl, "tri_vbuf");
      var cbuf = this.render.buffer(gl, "tri_cbuf");
      var nbuf = this.render.buffer(gl, "tri_nbuf");
      
      gl.simpleshader.bind(drawmats);
      
      gl.polygonOffset(2, 2);
       
      gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, nbuf);
      gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);
    
      gl.enableVertexAttribArray(0);
      gl.enableVertexAttribArray(1);
      gl.enableVertexAttribArray(2);
      
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      
      gl.drawArrays(gl.TRIANGLES, 0, this.render.tri_totvert);
      //gl.drawArrays(gl.POINTS, 0, this.render.tri_totvert);
      //gl.drawArrays(gl.LINES, 0, this.render.tri_totvert);
      
      gl.polygonOffset(0, 0);
      gl.flatshader.bind(drawmats);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.render.buffer(gl, "edge_vbuf"));
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.render.buffer(gl, "edge_cbuf"));
      gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    
      gl.enableVertexAttribArray(0);
      gl.enableVertexAttribArray(1);
      gl.disableVertexAttribArray(2);
      
      gl.drawArrays(gl.LINES, 0, this.render.edge_totvert);
      
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      
    },
    
    regen_render : function() {
      this.render.regen = true;
    }
  }, "mesh.Mesh");
  
  var remove_doubles = exports.remove_doubles = function(mesh, limit) {
    if (limit == undefined)
      limit = 0.001;
    
    var mesh2 = new Mesh();
    
    var verts = [];
    var vmap = {};
    var eidmap = {};
    
    for (var i=0; i<mesh.verts.length; i++) {
      verts.push(mesh.verts[i]);
    }
    
    /*
    verts.sort(function(a, b) {
      var c1 = a.co, c2 = b.co;
      
      if (c1[0] != c2[0]) {
        return c1[0] - c2[0];
      } else if (c1[1] != c2[1]) {
        return c1[1] - c2[1];
      } else {
        return c1[2] - c2[2];
      }
    });
    */
    
    var tag = {};
    var limitsq = limit*limit;
    
    for (var i=0; i<verts.length; i++) {
      var v1 = verts[i];
      
      if (v1.eid in tag)
        continue;
      
      var newv = mesh2.make_vert(v1.co, v1.no);
      newv.flag = v1.flag;
      
      tag[v1.eid] = 1;
      vmap[v1.eid] = newv;
      
      for (var j=0; j<verts.length; j++) {
        var v2 = verts[j];
        
        if (v2.eid in tag)
          continue;
        
        if (v2.co.vectorDistance(v1.co) < limit) {
          vmap[v2.eid] = newv;
          tag[v2.eid] = 1;
        }
      }
    }
    
    for (var i=0; i<mesh.edges.length; i++) {
      var e = mesh.edges[i];
      var v1 = vmap[e.v1.eid];
      var v2 = vmap[e.v2.eid];
      
      if (v1 == v2) continue;
      
      var newe = mesh2.make_edge(v1, v2, true);
      newe.flag = e.flag;
    }
    
    for (var i=0; i<mesh.faces.length; i++) {
      var f = mesh.faces[i];
      
      var verts2 = [];
      var vset = {};
      var l = f.l;
      do {
        var v1 = vmap[l.v.eid];
        if (!(v1.eid in vset)) {
          vset[v1.eid] = 1;
          verts2.push(v1);
        }
        
        l = l.next;
      } while (l != f.l);
      
      if (verts2.length > 2) {
        var newf = mesh2.make_face(verts2);
        newf.flag = f.flag;
      }
    }
    
    mesh.verts = mesh2.verts;
    mesh.edges = mesh2.edges;
    mesh.faces = mesh2.faces;
    mesh.recalc_normals();
    mesh.regen_render();
  };
  
  Mesh.createCube = function(mesh, mat) {
    if (mesh == undefined)
      var mesh = new Mesh();
    
    if (mat == undefined)
      mat = new Matrix4();
    
    function plane(mat) {
      var d = 0.5;
      var v1 = mesh.make_vert([-d, -d, 0]);
      var v2 = mesh.make_vert([-d, d, 0]);
      var v3 = mesh.make_vert([d, d, 0]);
      var v4 = mesh.make_vert([d, -d, 0]);
      
      v1.co.multVecMatrix(mat);
      v2.co.multVecMatrix(mat);
      v3.co.multVecMatrix(mat);
      v4.co.multVecMatrix(mat);
      
      var f = mesh.make_face([v1, v2, v3, v4]);

      return f;
    }
    
    mat = new Matrix4(mat);
    mat.translate(0, 0, 0.5);
    
    var mat2 = new Matrix4(mat);
    plane(mat2);
    
    mat2 = new Matrix4(mat);
    mat2.translate(0, 0, -1);
    mat2.rotate(Math.PI, 0, 0);
    plane(mat2);
    
    mat2 = new Matrix4(mat);
    mat2.translate(0, -0.5, -0.5);
    mat2.rotate(Math.PI/2, 0, 0);
    plane(mat2);
    
    mat2 = new Matrix4(mat);
    mat2.translate(0, 0.5, -0.5);
    mat2.rotate(-Math.PI/2, 0, 0);
    plane(mat2);
    
    mat2 = new Matrix4(mat);
    mat2.translate(0.5, 0.0, -0.5);
    mat2.rotate(0, Math.PI/2, 0);
    plane(mat2);
    
    mat2 = new Matrix4(mat);
    mat2.translate(-0.5, 0, -0.5);
    mat2.rotate(0, -Math.PI/2, 0);
    plane(mat2);
    
    remove_doubles(mesh);
    mesh.recalc_normals();
    mesh.regen_render();
    
    return mesh;
  }

  return exports;
});
