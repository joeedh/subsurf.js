/*
  this file is public domain
*/
//console shortcut for debugging purposes
var S = undefined; //state

//for coding purposes
var _appstate = undefined; //state
var _version_code = 0.001;

var abs = Math.abs;
var pow = Math.pow;
var sin = Math.sin;
var cos = Math.cos;
var floor = Math.floor;
var ceil = Math.ceil;
var log = Math.log;
var tan = Math.tan;
var asin = Math.asin;
var acos = Math.acos;
var atan = Math.atan;
var sqrt = Math.sqrt;
var PI = Math.PI;

define([
  "util", "vectormath", "math", 
  "screen", "draw", "modaltool",
  "mesh", "subdiv", "patch"
], function(util, vectormath, math, 
           screen, draw, modaltool,
           mesh, subdiv, patch) 
{
  "use strict";
  
  var exports = {};
  
  var Vector3 = vectormath.Vector3;
  var Matrix4 = vectormath.Matrix4;
  
  var State = exports.State = function() {
    this.screen = undefined;
    this.size = [window.innerWidth, window.innerHeight];
    this.event_manager = new util.EventManager();
    this.mesh = mesh.Mesh.createCube();
    
    this.params = {
      steps : 10
    };
    
    this.ss_mesh = undefined;
  };
 
  State.prototype = util.new_prototype(State, {
    init : function() {
      console.log("initializing state...")
      this.screen = new screen.Screen(this);
      
      var canvas = this.screen.canvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      var gl = this.screen.gl;
      gl.simpleshader = new draw.ShaderProgram(gl, "simple_vshader", "simple_fshader", ["position", "color", "normal"]);
      gl.flatshader = new draw.ShaderProgram(gl, "flat_vshader", "flat_fshader", ["position", "color", "normal"]);
      
      this.gl = gl;
      
      //float texture extension
      gl.getExtension("OES_texture_float");

      this.regen();
      this.start();
      this.subsurf();
    },
    
    start : function() {
      var this2 = this;
      
      function drawframe() {
        var gl = this2.screen.gl;
        
        this2.on_resize(); //test for resize
        
        gl.viewport(0, 0, window.innerWidth, window.innerHeight);
        
        gl.clearColor(0.4, 0.5, 0.8, 1.0);
        gl.clearDepth(100000);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        window.requestAnimationFrame(drawframe);
        this2.screen.draw(this2.screen.gl);
      }
      
      window.requestAnimationFrame(drawframe);
    },
    
    on_resize : function() {
      if (window.innerWidth != this.size[0] || window.innerHeight != this.size[1]) {
        var canvas = this.screen.canvas;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.size[0] = this.screen.size[0] = window.innerWidth;
        this.size[1] = this.screen.size[1] = window.innerHeight;
        
        this.screen.camera.aspect = this.size[1]/this.size[0];
        this.screen.camera.update();
      }
    },
    
    regen : function() {
      console.log("regen");
    },
    
    modal_tool : function(tool) {
      tool.state = this;
      tool.start_modal();
      this.event_manager.push_modal(tool);
    },
    
    load_obj : function(text) {
      var lines = text.split("\n");
      var m = new mesh.Mesh();
      
      var verts = [], faces = [];
      for (var i=0; i<lines.length; i++) {
        var l = lines[i].trim();
        
        if (l[0] == "#") continue;
        
        if (l[0] == "mtllib") continue;
        if (l[0] == "o") continue;
        
        if (l[0] == "v") {
          var xyz = l.slice(1, l.length).trim().split(" ");
          
          var v = m.make_vert();
          for (var j=0; j<xyz.length; j++) {
            if (j >= 3) break;
            v.co[j] = parseFloat(xyz[j]);
          }
          
          verts.push(v);
        } else if (l[0] == "f") {
          var vs = l.slice(2, l.length).trim().split(" ");
          var verts2 = [];
          
          for (var j=0; j<vs.length; j++) {
            vs[j] = vs[j].split("/"); //ensure we can handle complex face definitions
            
            var v = verts[parseInt(vs[j][0])-1];
            
            if (v == undefined) {
              console.log("warning! undefined v!");
              continue;
            }
            
            verts2.push(v);
          }
          var f = m.make_face(verts2);
        }
      }
      
      m.recalc_normals();
      this.mesh = m;
      m.regen_render();
      this.subsurf();
    }, 
    
    change_steps : function(steps) {
      this.params.steps = steps;
      if (this.ss_mesh == undefined) return;
      
      patch.change_steps(this.gl, this.ss_mesh, steps);
    },
    
    subsurf : function() {
      if (this.ss_mesh != undefined) {
        patch.destroy_subsurf_mesh(this.gl, this.ss_mesh);
      }
      this.ss_mesh = patch.gpu_subsurf(this.gl, this.mesh, Math.floor(this.params.steps));
    },
    
    on_keydown : function(event) {
      console.log(event.keyCode);
      
      switch (event.keyCode) {
        case 68: //dkey
          subdiv.subdivide(this.mesh);
          this.subsurf();
          
          break;
        case 71: //gkey
          var tool = new modaltool.ViewTool();
          this.modal_tool(tool);
          break;
        case 37: //left arrow
        case 39: //right arrow
          var dir = event.keyCode == 37 ? -1 : 1;
          
          var camera = this.screen.camera;
          var rot = new Matrix4();
          
          rot.rotate(0, 0, dir*0.1);
          console.log("rotating");
          
          camera.target.sub(camera.pos);
          camera.target.multVecMatrix(rot);
          camera.target.add(camera.pos);
          console.log(camera.target);
          
          camera.update();
          
          break;
      }
    },
    
    on_mousedown : function(event) {
      if (event.button == 0 || event.button == 1) {
        var mode = modaltool.ViewToolModes.ORBIT;
        
        if (event.shiftKey) mode = modaltool.ViewToolModes.PAN;
        if (event.ctrlKey) mode = modaltool.ViewToolModes.ZOOM;
        
        var tool = new modaltool.ViewTool(mode);
        this.modal_tool(tool);
      }
    },
    
    on_mousemove : function(event) {
    },
    
    on_mouseup : function(event) {
    },
  });
  
  var state = new State();
  _appstate = state;

  state.init();
  
  function on_keydown(event) {
    if (state.event_manager.consume_event("keydown", event))
      return;
    state.on_keydown(event);
  }
  
  function mevt(event) {
    //copy mouse event, with flipped y
    var cpy = {};
    for (var k in event) {
      cpy[k] = event[k];
    }
    
    for (var k in event.__proto__) {
      cpy[k] = event[k];
    }
    
    cpy.y = window.innerHeight - cpy.y;
    
    return cpy;
  }
  function on_mousedown(event) {
    event = mevt(event);
    if (state.event_manager.consume_event("mousedown", event))
      return;
      
    state.on_mousedown(event);
    console.log("mdown");
  }
  
  function on_mousemove(event) {
    event = mevt(event);
    if (state.event_manager.consume_event("mousemove", event))
      return;
    //console.log("mmove", event.x, event.y);
  }
  
  function on_mouseup(event) {
    event = mevt(event);
    if (state.event_manager.consume_event("mouseup", event))
      return;
    
    console.log("mup");
    state.on_mouseup(event);
  }
  
  var canvas = state.screen.canvas;
  
  window.addEventListener("keydown", on_keydown);
  
  canvas.addEventListener("mousedown", on_mousedown);
  canvas.addEventListener("mousemove", on_mousemove);
  canvas.addEventListener("mouseup", on_mouseup);
  
  state.screen.camera.update();
  
  return exports;
});
