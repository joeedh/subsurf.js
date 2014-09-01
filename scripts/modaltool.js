var _tool = undefined;
define([
  "util", "vectormath", "math", "draw"
], function(util, vectormath, math, draw) {
  var exports = {};
  
  var Vector2 = vectormath.Vector2;
  var Vector3 = vectormath.Vector3;
  var Matrix4 = vectormath.Matrix4;
  var Quat = vectormath.Quat;
  
  var ModalTool = exports.ModalTool = function() {
    this.running = false;
    this.state = undefined;
  }
  
  util.new_prototype(ModalTool, {
    cancel : function() {
      console.log("default cancel implementation");
    },
    
    finish : function() {
    },
    
    end_modal : function() {
      this.state.event_manager.pop_modal();
    },
    
    start_modal : function() {
    },
    
    on_keydown : function(event) {
      switch (event.keyCode) {
        case 13: //return key
          this.end_modal();
          this.finish();
          break;
        case 27: //escape key
          this.end_modal();
          this.cancel();
          break;
      }
    },
    
    on_keyup : function(event) {
    },
    
    on_mousedown : function(event) {
    },
    
    on_mouseup : function(event) {
      this.end_modal();
      this.finish();
    },
    
    on_mousemove : function(event) {
    }
  });
  
  var ViewToolModes = exports.ViewToolModes = {
    PAN   : 1,
    ZOOM  : 2,
    ORBIT : 4
  };
  
  var ViewTool = exports.ViewTool = function(mode) {
    ModalTool.call(this);
    
    this.mode = mode;
    
    this.start_mpos = new Vector2();
    this.start_camera = undefined;
    this.first = true;
  }
  
  ViewTool.prototype = util.inherit(ViewTool, ModalTool, {
    on_mousemove : function(event) {
      var state = this.state;
      var screen = state.screen;
      var camera = screen.camera;
      
      if (this.first) {
        this.first = false;
        this.start_camera = screen.camera.copy();
        this.start_mpos.load([event.x, event.y]);
        this.start_mpos.divide(screen.size);
        
        this.mat = new Matrix4(screen.drawmats.rendermat);
        this.imat = new Matrix4(screen.drawmats.rendermat);
        
        this.imat.invert();
        return;
      }
      
      var mpos = new Vector2([event.x, event.y]);
      mpos.divide(screen.size);
      
      if (this.mode & ViewToolModes.PAN)
        this.pan(new Vector2(mpos));
      if (this.mode & ViewToolModes.ZOOM)
        this.zoom(new Vector2(mpos));
      if (this.mode & ViewToolModes.ORBIT)
        this.orbit(new Vector2(mpos));
    },
    
    pan : function(mpos, event) {
      var state = this.state;
      var screen = state.screen;
      var camera = screen.camera;
      var start = this.start_camera;
      
      var targetdis = start.pos.vectorDistance(start.target);
      
      var target = new Vector3(camera.target).sub(camera.pos).mulScalar(2).add(camera.pos);
      target.multVecMatrix(this.mat);
      
      var mstart = new Vector3([this.start_mpos[0], this.start_mpos[1], target[2]]);
      mstart.multVecMatrix(this.imat);
      
      var vec = new Vector3([mpos[0], mpos[1], target[2]]);
      
      vec.multVecMatrix(this.imat);
      
      vec.sub(mstart).negate();
      
      camera.pos.load(start.pos).add(vec);
      camera.target.load(start.target).add(vec);
      camera.update();
    },
    
    zoom : function(mpos, event) {
      var state = this.state;
      var screen = state.screen;
      var camera = screen.camera;
      var start = this.start_camera;
      
      var targetdis = start.pos.vectorDistance(start.target);
      
      mpos.sub(this.start_mpos);
      var r = -mpos.vectorLength() * (mpos[1] < 0 ? -1 : 1);
      camera.pos.load(start.pos).sub(camera.target);
      
      var len = camera.pos.vectorLength();
      
      len += r*targetdis;
      camera.pos.normalize().mulScalar(len);
      camera.pos.add(camera.target);
      
      camera.update();
    },
    
    orbit : function(mpos, event) {
      var state = this.state;
      var screen = state.screen;
      var camera = screen.camera;
      
      mpos.sub(this.start_mpos);
      
      var cent = new Vector3();
      cent.multVecMatrix(this.mat);
      var z = -0.01
      var tan = new Vector3([mpos[1], -mpos[0], z]).normalize();
      
      tan.multVecMatrix(this.imat);
      var pos = new Vector3();
      this.imat.decompose(pos);
      tan.sub(pos);
      
      tan.normalize();
      
      var mstart = this.start_mpos;
      
      var r = mpos.vectorLength();
      var a = Math.atan2(mpos[0]+this.start_mpos[0], mpos[1]+this.start_mpos[1]);
      var b = Math.atan2(mstart[0], mstart[1]);
      
      camera.pos.load(this.start_camera.pos).sub(camera.target);
      var quat = new Quat();
      
      quat.axisAngleToQuat(tan, r*3);
      var mat = quat.toMatrix();
      
      camera.pos.multVecMatrix(mat);
      camera.up.load(this.start_camera.up).multVecMatrix(mat);
      camera.pos.add(camera.target);
      camera.update();
    }
  });
  
  _tool = exports;
  return exports;
});
