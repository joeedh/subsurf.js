/*
  this file is public domain
*/
var _screen;

define([
  "util",
  "vectormath",
  "math",
  "dat.gui", "draw", "mesh", "patch"
], function(util, vectormath, math, dat1, draw, mesh, patch) {
  "use strict";
  
  var exports = {};
  
  var Vector2 = vectormath.Vector2;
  var Vector3 = vectormath.Vector3;
  var Vector4 = vectormath.Vector4;
  var Quat = vectormath.Quat;
  var Matrix4 = vectormath.Matrix4;
  
  var Screen = exports.Screen = function(state) {
    this.state = state;
    this.size = [window.innerWidth, window.innerHeight];
    this.canvas = document.getElementById("canvas3d");
    this.gl = this.canvas.getContext("webgl");
    
    this.aspect = this.size[1] / this.size[0];
    this.camera = new draw.Camera();
    this.drawmats = new draw.DrawMats();
    
    this.gui = new dat.GUI();
    this.gui.useLocalStorage = true;
    this.make_gui();
    
    this.camera.gen_mats(this.drawmats, this.aspect);
  }
  
  Screen.prototype = util.new_prototype(Screen, {
    on_resize : function() {
      this.size = [window.innerWidth, window.innerHeight];
      this.aspect = this.size[1] / this.size[0];
      this.camera.gen_mats(this.drawmats, this.aspect);
    },
    
    make_gui : function() {
      var gui = this.gui;
      
      var filedom = undefined;
      
      var this2 = this;
      var guiobj = {
        load_obj : function() {
          console.log("loading obj. . .");
          
          var file = filedom.files[0];
          var reader = new FileReader();
          reader.onload = function(e) {
              var buf = e.target.result;
              
              this2.state.load_obj(buf);
          };
          
          reader.readAsText(file);
        },
        
        file : ""
      }
      
      gui.add(guiobj, "load_obj").name("Load OBJ(click me");
      
      //recursively search for input DOM node,
      //hopefully this won't break on any future
      //dat.gui API changes
      //
      //hopefully
      function get_input(node) {
        if (node == undefined) return;

        if (node.childNodes == undefined) return;
        if (node.tagName == "INPUT") return node;
        
        for (var i=0; i<node.childNodes.length; i++) {
          var ret = get_input(node.childNodes[i]);
          if (ret != undefined) return ret;
        }
      }
      
      var input = gui.add(guiobj, "file");
      input = get_input(input.domElement);
      
      input.type = "file";
      filedom = input;
      
      var this2 = this;
      function update_mesh() {
        this2.state.subsurf();
      }

      gui.add(this.state.params, "steps", 3, 100).onChange(function() {
        this2.state.change_steps(Math.floor(this2.state.params.steps));
      });
      
      console.log(input);
    },
    
    draw : function(gl) {
      this.aspect = this.size[1] / this.size[0];
      this.drawmats.aspect = this.aspect;
      
      if (this.state.ss_mesh != undefined) {
        patch.subsurf_render(gl, this.state.ss_mesh, this.drawmats);
      } else {
        this.state.mesh.draw(gl, this.drawmats);
      }
    }
  });
  
  _screen = exports;
  
  return exports;
});
