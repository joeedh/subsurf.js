//global for accessing module in debugger console
var _draw = undefined;

define([
  "util", "vectormath", "math"
], function(util, vectormath, math) {
  "use strict";
  
  var exports = {};
  
  var Vector3 = vectormath.Vector3;
  var Matrix4 = vectormath.Matrix4;
  var Quat = vectormath.Quat;
    
  /*loadShader comes with the following copyright disclaimer:*/
  /*
   * Copyright (C) 2009 Apple Inc. All Rights Reserved.
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions
   * are met:
   * 1. Redistributions of source code must retain the above copyright
   *    notice, this list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright
   *    notice, this list of conditions and the following disclaimer in the
   *    documentation and/or other materials provided with the distribution.
   *
   * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
   * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
   * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
   * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
   * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
   * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   */

  //
  // loadShader
  //
  // 'shaderId' is the id of a <script> element containing the shader source string.
  // Load this shader and return the WebGLShader object corresponding to it.
  //
  function loadShader(ctx, shaderId)
  {
    var shaderScript = document.getElementById(shaderId);
    if (!shaderScript) {
      shaderScript = {text : shaderId, type : undefined};
      
      if (shaderId.trim().toLowerCase().startsWith("//vertex")) {
        shaderScript.type = "x-shader/x-vertex";
      } else if (shaderId.trim().toLowerCase().startsWith("//fragment")) {
        shaderScript.type = "x-shader/x-fragment";
      } else {
        console.trace();
        console.log("Invalid shader type");
        console.log("================");
        console.log(shaderScript);
        console.log("================");
        throw new Error("Invalid shader type for shader script;\n script must start with //vertex or //fragment");
      }
    }

    if (shaderScript.type == "x-shader/x-vertex")
        var shaderType = ctx.VERTEX_SHADER;
    else if (shaderScript.type == "x-shader/x-fragment")
        var shaderType = ctx.FRAGMENT_SHADER;
    else {
        log("*** Error: shader script '"+shaderId+"' of undefined type '"+shaderScript.type+"'");
        return null;
    }

    // Create the shader object
    if (ctx == undefined || ctx == null || ctx.createShader == undefined)
      console.trace();
      
    var shader = ctx.createShader(shaderType);

    // Load the shader source
    ctx.shaderSource(shader, shaderScript.text);

    // Compile the shader
    ctx.compileShader(shader);

    // Check the compile status
    var compiled = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);
    if (!compiled && !ctx.isContextLost()) {
        // Something went wrong during compilation; get the error
        var error = ctx.getShaderInfoLog(shader);
        
        var lines = shaderScript.text.split("\n");
        var s = ""
        var cols = Math.ceil(Math.log(lines.length == 0 ? 1 : lines.length) / Math.log(10));
        for (var i=0; i<lines.length; i++) {
          var si = ""+(i+1);
          for (var j=si.length; j<cols; j++) {
            s += " ";
          }
          
          s += si + ":  " + lines[i] + "\n";
        }
        
        console.log(s);
        console.log("*** Error compiling shader '"+shaderId+"':"+error);
        ctx.deleteShader(shader);
        return null;
    }

    return shader;
  }

  //kindof a crappy shader wrangler class
  var ShaderProgram = exports.ShaderProgram = function(gl, vshader, fshader, attribs) {
   // create our shaders
    var vertexShader = loadShader(gl, vshader);
    var fragmentShader = loadShader(gl, fshader);
    this.uniforms = {}
    
    this.gl = gl;
    
    // Create the program object
    var program = gl.createProgram();
    this.program = program;
    
    // Attach our two shaders to the program
    gl.attachShader (program, vertexShader);
    gl.attachShader (program, fragmentShader);

    // Bind attributes
    for (var i = 0; i < attribs.length; ++i)
        gl.bindAttribLocation (program, i, attribs[i]);

    // Link the program
    gl.linkProgram(program);

    // Check the link status
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked && !gl.isContextLost()) {
        // something went wrong with the link
        var error = gl.getProgramInfoLog (program);
        console.log("Error in program linking:"+error);

        //do nothing
        //gl.deleteProgram(program);
        //gl.deleteProgram(fragmentShader);
        //gl.deleteProgram(vertexShader);

        return null;
    }

    this.program = program;
  }
  
  util.new_prototype(ShaderProgram, {
    bind : function(drawmats) {
      var gl = this.gl;
      
      gl.useProgram(this.program);
      
      drawmats.rendermat.setUniform(gl, this.uniformloc("projectionMatrix"));
      drawmats.cameramat.setUniform(gl, this.uniformloc("modelMatrix"));
      drawmats.normalmat.setUniform(gl, this.uniformloc("normalMatrix"));
    },
    
    uniformloc : function(name) {
      if (!(name in this.uniforms)) {
        this.uniforms[name] = this.gl.getUniformLocation(this.program, name); 
      }
      
      return this.uniforms[name];
    }
  });
  
  var DrawMats = exports.DrawMats = function(normalmat, cameramat, persmat) {
    this.normalmat = new Matrix4(normalmat);
    this.cameramat = new Matrix4(cameramat);
    this.cameramat_zoom = new Matrix4(); //cameramat with zoom applied
    this.persmat = new Matrix4(persmat);
    this.rendermat = new Matrix4(); //private
  }
  
  util.new_prototype(DrawMats, {
    copy : function() {
      var cpy = new DrawMats(this.normalmat, this.cameramat, 
                             this.persmat);
      cpy.rendermat = new Matrix4(this.rendermat);
      
      return cpy;
    },

    toJSON : function() {
      return {
        normalmat : this.normalmat.toJSON(),
        cameramat : this.cameramat.toJSON(),
        persmat : this.persmat.toJSON(),
        rendermat : this.rendermat.toJSON()
      }
    }
  });
  
  DrawMats.fromJSON = function(json) {
    var dm = new DrawMats();
    
    dm.normalmat = Matrix4.fromJSON(json.normalmat);
    dm.cameramat = Matrix4.fromJSON(json.cameramat);
    dm.persmat = Matrix4.fromJSON(json.persmat);
    dm.rendermat = Matrix4.fromJSON(json.rendermat);
    
    return dm;
  }
  
  var Camera = exports.Camera = function() {
    this.up = new Vector3([0, 1, 0]);
    this.pos = new Vector3([0, 0, 3]);
    this.target = new Vector3([0.0, 0.0, 0.0]);
    this.aspect = 1.0;
    this.fovy = 35;
    this.drawmats = undefined;
  };
  
  util.new_prototype(Camera, {
    update : function() {
      this.gen_mats(this.drawmats, this.aspect);
    },
    
    copy : function() {
      var ret = new Camera();
      
      ret.up.load(this.up);
      ret.pos.load(this.pos);
      ret.target.load(this.target);
      
      ret.aspect = this.aspect;
      ret.fovy = this.fovy;
      ret.drawmats = undefined;
      
      return ret;
    },
    
    gen_mats : function(drawmats, aspect) {
      this.drawmats = drawmats;
      
      this.aspect = aspect;
      var persmat = new Matrix4();
      persmat.perspective(this.fovy, 1/this.aspect, 0.1, 1000);
      
      drawmats.persmat.load(persmat);
      
      var modelmat = new Matrix4();
      
      var zvec = new Vector3(this.target).sub(this.pos).normalize().negate();
      var yvec = new Vector3(this.up).normalize();
      var xvec = new Vector3(yvec).cross(zvec).normalize();
      yvec.load(zvec).cross(xvec).normalize();
      
      modelmat.lookat(this.target[0], this.target[1], this.target[2], this.pos[0], this.pos[1], this.pos[2], this.up[0], this.up[1], this.up[2]);
      
      var x=xvec, y=yvec, z=zvec;
      
      /*
      zvec = x;
      yvec = y;
      xvec = z;
      // */
      
      // /*
      modelmat.$matrix.m11 = xvec[0];
      modelmat.$matrix.m12 = xvec[1];
      modelmat.$matrix.m13 = xvec[2];
      modelmat.$matrix.m14 = 0;
      
      modelmat.$matrix.m21 = yvec[0];
      modelmat.$matrix.m22 = yvec[1];
      modelmat.$matrix.m23 = yvec[2];
      modelmat.$matrix.m24 = 0;
      
      modelmat.$matrix.m31 = zvec[0];
      modelmat.$matrix.m32 = zvec[1];
      modelmat.$matrix.m33 = zvec[2];
      modelmat.$matrix.m34 = 0;
      
      modelmat.$matrix.m41 = 0;
      modelmat.$matrix.m42 = 0;
      modelmat.$matrix.m43 = 0;
      modelmat.$matrix.m44 = 1;
      
      modelmat.transpose();
      
      drawmats.normalmat.load(modelmat);
      //drawmats.normalmat.invert();
      
      //modelmat.translate(-this.pos[0], -this.pos[1], -this.pos[2]);
      // */
      // /*
      var mat2 = new Matrix4();
      mat2.multiply(modelmat);
      mat2.translate(-this.pos[0], -this.pos[1], -this.pos[2]);
      modelmat = mat2;
      //*/
      
      drawmats.cameramat.load(modelmat);
      drawmats.rendermat.load(persmat);
      drawmats.rendermat.multiply(modelmat);
      drawmats.rendermat.isPersp = true;
      
      var pos = new Vector3();
      
      //console.log(modelmat.decompose(pos));
      //console.log("pos", pos, modelmat.$matrix.m43);
    }
  });
  
  var RenderBuffers = exports.RenderBuffers = function() {
    this.buffers = {};
    this.regen = true;
  };
  
  util.new_prototype(RenderBuffers, {
    destroy : function(gl) {
      for (var k in this.buffers) {
        gl.deleteBuffer(this.buffers[k]);
      }
      
      this.buffers = {};
    },
    
    //delexist is optional, false
    buffer : function(gl, name, delexist) {
      if (name in this.buffers) {
        if (!delexist) {
          return this.buffers[name];
        } else {
          gl.deleteBuffer(this.buffers[name]);
        }
      }
      
      this.buffers[name] = gl.createBuffer();
      
      return this.buffers[name];
    }
  });
  
  _draw = exports;
  return exports;
});