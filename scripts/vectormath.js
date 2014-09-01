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
 
var _vectormath = undefined;
var _Vector3 = undefined;
var _Matrix4 = undefined;

define(["util"], function(util) {
  var exports = {};
  
  var HasCSSMatrix=false;
  var HasCSSMatrixCopy=false;
  var M_SQRT2=Math.sqrt(2.0);
  var FLT_EPSILON=2.22e-16;
  function internal_matrix() {
    this.m11 = 0.0;
    this.m12 = 0.0;
    this.m13 = 0.0;
    this.m14 = 0.0;
    this.m21 = 0.0;
    this.m22 = 0.0;
    this.m23 = 0.0;
    this.m24 = 0.0;
    this.m31 = 0.0;
    this.m32 = 0.0;
    this.m33 = 0.0;
    this.m34 = 0.0;
    this.m41 = 0.0;
    this.m42 = 0.0;
    this.m43 = 0.0;
    this.m44 = 0.0;
  }
  var Matrix4=exports.Matrix4 = function(m) {
    if (HasCSSMatrix)
      this.$matrix = new WebKitCSSMatrix;
    else 
      this.$matrix = new internal_matrix();
    this.isPersp = false;
    if (typeof m=='object') {
        if ("length" in m&&m.length>=16) {
            this.load(m);
            return ;
        }
        else 
          if (m instanceof Matrix4) {
            this.load(m);
            return ;
        }
    }
    this.makeIdentity();
  };
  Matrix4.prototype = util.new_prototype(Matrix4, {
    clone : function() {
      return new Matrix4(this);
    },

    load : function() {
      if (arguments.length==1&&typeof arguments[0]=='object') {
          var matrix;
          if (arguments[0] instanceof Matrix4) {
              matrix = arguments[0].$matrix;
              this.isPersp = arguments[0].isPersp;
              this.$matrix.m11 = matrix.m11;
              this.$matrix.m12 = matrix.m12;
              this.$matrix.m13 = matrix.m13;
              this.$matrix.m14 = matrix.m14;
              this.$matrix.m21 = matrix.m21;
              this.$matrix.m22 = matrix.m22;
              this.$matrix.m23 = matrix.m23;
              this.$matrix.m24 = matrix.m24;
              this.$matrix.m31 = matrix.m31;
              this.$matrix.m32 = matrix.m32;
              this.$matrix.m33 = matrix.m33;
              this.$matrix.m34 = matrix.m34;
              this.$matrix.m41 = matrix.m41;
              this.$matrix.m42 = matrix.m42;
              this.$matrix.m43 = matrix.m43;
              this.$matrix.m44 = matrix.m44;
              return ;
          }
          else 
            matrix = arguments[0];
          if ("length" in matrix&&matrix.length>=16) {
              this.$matrix.m11 = matrix[0];
              this.$matrix.m12 = matrix[1];
              this.$matrix.m13 = matrix[2];
              this.$matrix.m14 = matrix[3];
              this.$matrix.m21 = matrix[4];
              this.$matrix.m22 = matrix[5];
              this.$matrix.m23 = matrix[6];
              this.$matrix.m24 = matrix[7];
              this.$matrix.m31 = matrix[8];
              this.$matrix.m32 = matrix[9];
              this.$matrix.m33 = matrix[10];
              this.$matrix.m34 = matrix[11];
              this.$matrix.m41 = matrix[12];
              this.$matrix.m42 = matrix[13];
              this.$matrix.m43 = matrix[14];
              this.$matrix.m44 = matrix[15];
              return ;
          }
      }
      this.makeIdentity();
    },

    toJSON : function() {
      return {isPersp: this.isPersp, items: this.getAsArray()}
    },

    getAsArray : function() {
      return [this.$matrix.m11, this.$matrix.m12, this.$matrix.m13, this.$matrix.m14, this.$matrix.m21, this.$matrix.m22, this.$matrix.m23, this.$matrix.m24, this.$matrix.m31, this.$matrix.m32, this.$matrix.m33, this.$matrix.m34, this.$matrix.m41, this.$matrix.m42, this.$matrix.m43, this.$matrix.m44];
    },

    getAsFloat32Array : function() {
      if (HasCSSMatrixCopy) {
          var array=new Float32Array(16);
          this.$matrix.copy(array);
          return array;
      }
      return new Float32Array(this.getAsArray());
    },

    setUniform : function(ctx, loc, transpose) {
      if (Matrix4.setUniformArray==undefined) {
          Matrix4.setUniformWebGLArray = new Float32Array(16);
          Matrix4.setUniformArray = new Array(16);
      }
      if (HasCSSMatrixCopy)
        this.$matrix.copy(Matrix4.setUniformWebGLArray);
      else {
        Matrix4.setUniformArray[0] = this.$matrix.m11;
        Matrix4.setUniformArray[1] = this.$matrix.m12;
        Matrix4.setUniformArray[2] = this.$matrix.m13;
        Matrix4.setUniformArray[3] = this.$matrix.m14;
        Matrix4.setUniformArray[4] = this.$matrix.m21;
        Matrix4.setUniformArray[5] = this.$matrix.m22;
        Matrix4.setUniformArray[6] = this.$matrix.m23;
        Matrix4.setUniformArray[7] = this.$matrix.m24;
        Matrix4.setUniformArray[8] = this.$matrix.m31;
        Matrix4.setUniformArray[9] = this.$matrix.m32;
        Matrix4.setUniformArray[10] = this.$matrix.m33;
        Matrix4.setUniformArray[11] = this.$matrix.m34;
        Matrix4.setUniformArray[12] = this.$matrix.m41;
        Matrix4.setUniformArray[13] = this.$matrix.m42;
        Matrix4.setUniformArray[14] = this.$matrix.m43;
        Matrix4.setUniformArray[15] = this.$matrix.m44;
        Matrix4.setUniformWebGLArray.set(Matrix4.setUniformArray);
      }
      ctx.uniformMatrix4fv(loc, transpose, Matrix4.setUniformWebGLArray);
    },

    makeIdentity : function() {
      this.$matrix.m11 = 1;
      this.$matrix.m12 = 0;
      this.$matrix.m13 = 0;
      this.$matrix.m14 = 0;
      this.$matrix.m21 = 0;
      this.$matrix.m22 = 1;
      this.$matrix.m23 = 0;
      this.$matrix.m24 = 0;
      this.$matrix.m31 = 0;
      this.$matrix.m32 = 0;
      this.$matrix.m33 = 1;
      this.$matrix.m34 = 0;
      this.$matrix.m41 = 0;
      this.$matrix.m42 = 0;
      this.$matrix.m43 = 0;
      this.$matrix.m44 = 1;
    },

    transpose : function() {
      var tmp=this.$matrix.m12;
      this.$matrix.m12 = this.$matrix.m21;
      this.$matrix.m21 = tmp;
      tmp = this.$matrix.m13;
      this.$matrix.m13 = this.$matrix.m31;
      this.$matrix.m31 = tmp;
      tmp = this.$matrix.m14;
      this.$matrix.m14 = this.$matrix.m41;
      this.$matrix.m41 = tmp;
      tmp = this.$matrix.m23;
      this.$matrix.m23 = this.$matrix.m32;
      this.$matrix.m32 = tmp;
      tmp = this.$matrix.m24;
      this.$matrix.m24 = this.$matrix.m42;
      this.$matrix.m42 = tmp;
      tmp = this.$matrix.m34;
      this.$matrix.m34 = this.$matrix.m43;
      this.$matrix.m43 = tmp;
    },

    invert : function() {
      if (HasCSSMatrix) {
          this.$matrix = this.$matrix.inverse();
          return ;
      }
      var det=this._determinant4x4();
      if (Math.abs(det)<1e-08)
        return null;
      this._makeAdjoint();
      this.$matrix.m11/=det;
      this.$matrix.m12/=det;
      this.$matrix.m13/=det;
      this.$matrix.m14/=det;
      this.$matrix.m21/=det;
      this.$matrix.m22/=det;
      this.$matrix.m23/=det;
      this.$matrix.m24/=det;
      this.$matrix.m31/=det;
      this.$matrix.m32/=det;
      this.$matrix.m33/=det;
      this.$matrix.m34/=det;
      this.$matrix.m41/=det;
      this.$matrix.m42/=det;
      this.$matrix.m43/=det;
      this.$matrix.m44/=det;
    },

    translate : function(x, y, z) {
      if (typeof x=='object'&&"length" in x) {
          var t=x;
          x = t[0];
          y = t[1];
          z = t[2];
      }
      else {
        if (x==undefined)
          x = 0;
        if (y==undefined)
          y = 0;
        if (z==undefined)
          z = 0;
      }
      if (HasCSSMatrix) {
          this.$matrix = this.$matrix.translate(x, y, z);
          return ;
      }
      var matrix=new Matrix4();
      matrix.$matrix.m41 = x;
      matrix.$matrix.m42 = y;
      matrix.$matrix.m43 = z;
      this.multiply(matrix);
    },

    scale : function(x, y, z) {
      if (typeof x=='object'&&"length" in x) {
          var t=x;
          x = t[0];
          y = t[1];
          z = t[2];
      }
      else {
        if (x==undefined)
          x = 1;
        if (z==undefined) {
            if (y==undefined) {
                y = x;
                z = x;
            }
            else 
              z = 1;
        }
        else 
          if (y==undefined)
          y = x;
      }
      if (HasCSSMatrix) {
          this.$matrix = this.$matrix.scale(x, y, z);
          return ;
      }
      var matrix=new Matrix4();
      matrix.$matrix.m11 = x;
      matrix.$matrix.m22 = y;
      matrix.$matrix.m33 = z;
      this.multiply(matrix);
    },

    rotate : function(angle, x, y, z) {
      if (typeof x=='object'&&"length" in x) {
          var t=x;
          x = t[0];
          y = t[1];
          z = t[2];
      }
      else {
        if (arguments.length==1) {
            x = 0;
            y = 0;
            z = 1;
        }
        else 
          if (arguments.length==3) {
            this.rotate(angle, 1, 0, 0);
            this.rotate(x, 0, 1, 0);
            this.rotate(y, 0, 0, 1);
            return ;
        }
      }
      if (HasCSSMatrix) {
          this.$matrix = this.$matrix.rotateAxisAngle(x, y, z, angle);
          return ;
      }
      angle/=2;
      var sinA=Math.sin(angle);
      var cosA=Math.cos(angle);
      var sinA2=sinA*sinA;
      var len=Math.sqrt(x*x+y*y+z*z);
      if (len==0) {
          x = 0;
          y = 0;
          z = 1;
      }
      else 
        if (len!=1) {
          x/=len;
          y/=len;
          z/=len;
      }
      var mat=new Matrix4();
      if (x==1&&y==0&&z==0) {
          mat.$matrix.m11 = 1;
          mat.$matrix.m12 = 0;
          mat.$matrix.m13 = 0;
          mat.$matrix.m21 = 0;
          mat.$matrix.m22 = 1-2*sinA2;
          mat.$matrix.m23 = 2*sinA*cosA;
          mat.$matrix.m31 = 0;
          mat.$matrix.m32 = -2*sinA*cosA;
          mat.$matrix.m33 = 1-2*sinA2;
          mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
          mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
          mat.$matrix.m44 = 1;
      }
      else 
        if (x==0&&y==1&&z==0) {
          mat.$matrix.m11 = 1-2*sinA2;
          mat.$matrix.m12 = 0;
          mat.$matrix.m13 = -2*sinA*cosA;
          mat.$matrix.m21 = 0;
          mat.$matrix.m22 = 1;
          mat.$matrix.m23 = 0;
          mat.$matrix.m31 = 2*sinA*cosA;
          mat.$matrix.m32 = 0;
          mat.$matrix.m33 = 1-2*sinA2;
          mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
          mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
          mat.$matrix.m44 = 1;
      }
      else 
        if (x==0&&y==0&&z==1) {
          mat.$matrix.m11 = 1-2*sinA2;
          mat.$matrix.m12 = 2*sinA*cosA;
          mat.$matrix.m13 = 0;
          mat.$matrix.m21 = -2*sinA*cosA;
          mat.$matrix.m22 = 1-2*sinA2;
          mat.$matrix.m23 = 0;
          mat.$matrix.m31 = 0;
          mat.$matrix.m32 = 0;
          mat.$matrix.m33 = 1;
          mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
          mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
          mat.$matrix.m44 = 1;
      }
      else {
        var x2=x*x;
        var y2=y*y;
        var z2=z*z;
        mat.$matrix.m11 = 1-2*(y2+z2)*sinA2;
        mat.$matrix.m12 = 2*(x*y*sinA2+z*sinA*cosA);
        mat.$matrix.m13 = 2*(x*z*sinA2-y*sinA*cosA);
        mat.$matrix.m21 = 2*(y*x*sinA2-z*sinA*cosA);
        mat.$matrix.m22 = 1-2*(z2+x2)*sinA2;
        mat.$matrix.m23 = 2*(y*z*sinA2+x*sinA*cosA);
        mat.$matrix.m31 = 2*(z*x*sinA2+y*sinA*cosA);
        mat.$matrix.m32 = 2*(z*y*sinA2-x*sinA*cosA);
        mat.$matrix.m33 = 1-2*(x2+y2)*sinA2;
        mat.$matrix.m14 = mat.$matrix.m24 = mat.$matrix.m34 = 0;
        mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
        mat.$matrix.m44 = 1;
      }
      this.multiply(mat);
    },

    multiply : function(mat) {
      if (HasCSSMatrix) {
          this.$matrix = this.$matrix.multiply(mat.$matrix);
          return ;
      }
      var m11=(mat.$matrix.m11*this.$matrix.m11+mat.$matrix.m12*this.$matrix.m21+mat.$matrix.m13*this.$matrix.m31+mat.$matrix.m14*this.$matrix.m41);
      var m12=(mat.$matrix.m11*this.$matrix.m12+mat.$matrix.m12*this.$matrix.m22+mat.$matrix.m13*this.$matrix.m32+mat.$matrix.m14*this.$matrix.m42);
      var m13=(mat.$matrix.m11*this.$matrix.m13+mat.$matrix.m12*this.$matrix.m23+mat.$matrix.m13*this.$matrix.m33+mat.$matrix.m14*this.$matrix.m43);
      var m14=(mat.$matrix.m11*this.$matrix.m14+mat.$matrix.m12*this.$matrix.m24+mat.$matrix.m13*this.$matrix.m34+mat.$matrix.m14*this.$matrix.m44);
      var m21=(mat.$matrix.m21*this.$matrix.m11+mat.$matrix.m22*this.$matrix.m21+mat.$matrix.m23*this.$matrix.m31+mat.$matrix.m24*this.$matrix.m41);
      var m22=(mat.$matrix.m21*this.$matrix.m12+mat.$matrix.m22*this.$matrix.m22+mat.$matrix.m23*this.$matrix.m32+mat.$matrix.m24*this.$matrix.m42);
      var m23=(mat.$matrix.m21*this.$matrix.m13+mat.$matrix.m22*this.$matrix.m23+mat.$matrix.m23*this.$matrix.m33+mat.$matrix.m24*this.$matrix.m43);
      var m24=(mat.$matrix.m21*this.$matrix.m14+mat.$matrix.m22*this.$matrix.m24+mat.$matrix.m23*this.$matrix.m34+mat.$matrix.m24*this.$matrix.m44);
      var m31=(mat.$matrix.m31*this.$matrix.m11+mat.$matrix.m32*this.$matrix.m21+mat.$matrix.m33*this.$matrix.m31+mat.$matrix.m34*this.$matrix.m41);
      var m32=(mat.$matrix.m31*this.$matrix.m12+mat.$matrix.m32*this.$matrix.m22+mat.$matrix.m33*this.$matrix.m32+mat.$matrix.m34*this.$matrix.m42);
      var m33=(mat.$matrix.m31*this.$matrix.m13+mat.$matrix.m32*this.$matrix.m23+mat.$matrix.m33*this.$matrix.m33+mat.$matrix.m34*this.$matrix.m43);
      var m34=(mat.$matrix.m31*this.$matrix.m14+mat.$matrix.m32*this.$matrix.m24+mat.$matrix.m33*this.$matrix.m34+mat.$matrix.m34*this.$matrix.m44);
      var m41=(mat.$matrix.m41*this.$matrix.m11+mat.$matrix.m42*this.$matrix.m21+mat.$matrix.m43*this.$matrix.m31+mat.$matrix.m44*this.$matrix.m41);
      var m42=(mat.$matrix.m41*this.$matrix.m12+mat.$matrix.m42*this.$matrix.m22+mat.$matrix.m43*this.$matrix.m32+mat.$matrix.m44*this.$matrix.m42);
      var m43=(mat.$matrix.m41*this.$matrix.m13+mat.$matrix.m42*this.$matrix.m23+mat.$matrix.m43*this.$matrix.m33+mat.$matrix.m44*this.$matrix.m43);
      var m44=(mat.$matrix.m41*this.$matrix.m14+mat.$matrix.m42*this.$matrix.m24+mat.$matrix.m43*this.$matrix.m34+mat.$matrix.m44*this.$matrix.m44);
      this.$matrix.m11 = m11;
      this.$matrix.m12 = m12;
      this.$matrix.m13 = m13;
      this.$matrix.m14 = m14;
      this.$matrix.m21 = m21;
      this.$matrix.m22 = m22;
      this.$matrix.m23 = m23;
      this.$matrix.m24 = m24;
      this.$matrix.m31 = m31;
      this.$matrix.m32 = m32;
      this.$matrix.m33 = m33;
      this.$matrix.m34 = m34;
      this.$matrix.m41 = m41;
      this.$matrix.m42 = m42;
      this.$matrix.m43 = m43;
      this.$matrix.m44 = m44;
    },

    divide : function(divisor) {
      this.$matrix.m11/=divisor;
      this.$matrix.m12/=divisor;
      this.$matrix.m13/=divisor;
      this.$matrix.m14/=divisor;
      this.$matrix.m21/=divisor;
      this.$matrix.m22/=divisor;
      this.$matrix.m23/=divisor;
      this.$matrix.m24/=divisor;
      this.$matrix.m31/=divisor;
      this.$matrix.m32/=divisor;
      this.$matrix.m33/=divisor;
      this.$matrix.m34/=divisor;
      this.$matrix.m41/=divisor;
      this.$matrix.m42/=divisor;
      this.$matrix.m43/=divisor;
      this.$matrix.m44/=divisor;
    },

    ortho : function(left, right, bottom, top, near, far) {
      var tx=(left+right)/(left-right);
      var ty=(top+bottom)/(top-bottom);
      var tz=(far+near)/(far-near);
      var matrix=new Matrix4();
      matrix.$matrix.m11 = 2/(left-right);
      matrix.$matrix.m12 = 0;
      matrix.$matrix.m13 = 0;
      matrix.$matrix.m14 = 0;
      matrix.$matrix.m21 = 0;
      matrix.$matrix.m22 = 2/(top-bottom);
      matrix.$matrix.m23 = 0;
      matrix.$matrix.m24 = 0;
      matrix.$matrix.m31 = 0;
      matrix.$matrix.m32 = 0;
      matrix.$matrix.m33 = -2/(far-near);
      matrix.$matrix.m34 = 0;
      matrix.$matrix.m41 = tx;
      matrix.$matrix.m42 = ty;
      matrix.$matrix.m43 = tz;
      matrix.$matrix.m44 = 1;
      this.multiply(matrix);
    },

    frustum : function(left, right, bottom, top, near, far) {
      var matrix=new Matrix4();
      var A=(right+left)/(right-left);
      var B=(top+bottom)/(top-bottom);
      var C=-(far+near)/(far-near);
      var D=-(2*far*near)/(far-near);
      matrix.$matrix.m11 = (2*near)/(right-left);
      matrix.$matrix.m12 = 0;
      matrix.$matrix.m13 = 0;
      matrix.$matrix.m14 = 0;
      matrix.$matrix.m21 = 0;
      matrix.$matrix.m22 = 2*near/(top-bottom);
      matrix.$matrix.m23 = 0;
      matrix.$matrix.m24 = 0;
      matrix.$matrix.m31 = A;
      matrix.$matrix.m32 = B;
      matrix.$matrix.m33 = C;
      matrix.$matrix.m34 = -1;
      matrix.$matrix.m41 = 0;
      matrix.$matrix.m42 = 0;
      matrix.$matrix.m43 = D;
      matrix.$matrix.m44 = 0;
      this.isPersp = true;
      this.multiply(matrix);
    },

    perspective : function(fovy, aspect, zNear, zFar) {
      var top=Math.tan(fovy*Math.PI/360)*zNear;
      var bottom=-top;
      var left=aspect*bottom;
      var right=aspect*top;
      this.frustum(left, right, bottom, top, zNear, zFar);
    },

    lookat : function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz) {
      if (typeof eyez=='object'&&"length" in eyez) {
          var t=eyez;
          upx = t[0];
          upy = t[1];
          upz = t[2];
          t = eyey;
          centerx = t[0];
          centery = t[1];
          centerz = t[2];
          t = eyex;
          eyex = t[0];
          eyey = t[1];
          eyez = t[2];
      }
      var matrix=new Matrix4();
      var zx=eyex-centerx;
      var zy=eyey-centery;
      var zz=eyez-centerz;
      var mag=Math.sqrt(zx*zx+zy*zy+zz*zz);
      if (mag) {
          zx/=mag;
          zy/=mag;
          zz/=mag;
      }
      var yx=upx;
      var yy=upy;
      var yz=upz;
      var xx, xy, xz;
      xx = yy*zz-yz*zy;
      xy = -yx*zz+yz*zx;
      xz = yx*zy-yy*zx;
      yx = zy*xz-zz*xy;
      yy = -zx*xz+zz*xx;
      yx = zx*xy-zy*xx;
      mag = Math.sqrt(xx*xx+xy*xy+xz*xz);
      if (mag) {
          xx/=mag;
          xy/=mag;
          xz/=mag;
      }
      mag = Math.sqrt(yx*yx+yy*yy+yz*yz);
      if (mag) {
          yx/=mag;
          yy/=mag;
          yz/=mag;
      }
      matrix.$matrix.m11 = xx;
      matrix.$matrix.m12 = xy;
      matrix.$matrix.m13 = xz;
      matrix.$matrix.m14 = 0;
      matrix.$matrix.m21 = yx;
      matrix.$matrix.m22 = yy;
      matrix.$matrix.m23 = yz;
      matrix.$matrix.m24 = 0;
      matrix.$matrix.m31 = zx;
      matrix.$matrix.m32 = zy;
      matrix.$matrix.m33 = zz;
      matrix.$matrix.m34 = 0;
      matrix.$matrix.m41 = 0;
      matrix.$matrix.m42 = 0;
      matrix.$matrix.m43 = 0;
      matrix.$matrix.m44 = 1;
      matrix.translate(-eyex, -eyey, -eyez);
      this.multiply(matrix);
    },

    decompose : function(_translate, _rotate, _scale, _skew, _perspective) {
      if (this.$matrix.m44==0)
        return false;
      var translate, rotate, scale, skew, perspective;
      var translate=(_translate==undefined||!("length" in _translate)) ? new Vector3 : _translate;
      var rotate=(_rotate==undefined||!("length" in _rotate)) ? new Vector3 : _rotate;
      var scale=(_scale==undefined||!("length" in _scale)) ? new Vector3 : _scale;
      var skew=(_skew==undefined||!("length" in _skew)) ? new Vector3 : _skew;
      var perspective=(_perspective==undefined||!("length" in _perspective)) ? new Array(4) : _perspective;
      var matrix=new Matrix4(this);
      matrix.divide(matrix.$matrix.m44);
      var perspectiveMatrix=new Matrix4(matrix);
      perspectiveMatrix.$matrix.m14 = 0;
      perspectiveMatrix.$matrix.m24 = 0;
      perspectiveMatrix.$matrix.m34 = 0;
      perspectiveMatrix.$matrix.m44 = 1;
      if (perspectiveMatrix._determinant4x4()==0)
        return false;
        
      if (matrix.$matrix.m14!=0||matrix.$matrix.m24!=0||matrix.$matrix.m34!=0) {
          var rightHandSide=[matrix.$matrix.m14, matrix.$matrix.m24, matrix.$matrix.m34, matrix.$matrix.m44];
          var inversePerspectiveMatrix=new Matrix4(perspectiveMatrix);
          inversePerspectiveMatrix.invert();
          var transposedInversePerspectiveMatrix=new Matrix4(inversePerspectiveMatrix);
          transposedInversePerspectiveMatrix.transpose();
          
          var v4 = new Vector3(rightHandSide);
          v4.multVecMatrix(transposedInversePerspectiveMatrix)
          
          perspective[0] = v4[0];
          perspective[1] = v4[1];
          perspective[2] = v4[2];
          perspective[3] = v4[3];
          
          matrix.$matrix.m14 = matrix.$matrix.m24 = matrix.$matrix.m34 = 0;
          matrix.$matrix.m44 = 1;
      }
      else {
        perspective[0] = perspective[1] = perspective[2] = 0;
        perspective[3] = 1;
      }
      translate[0] = matrix.$matrix.m41;
      matrix.$matrix.m41 = 0;
      translate[1] = matrix.$matrix.m42;
      matrix.$matrix.m42 = 0;
      translate[2] = matrix.$matrix.m43;
      matrix.$matrix.m43 = 0;
      var row0=new Vector3([matrix.$matrix.m11, matrix.$matrix.m12, matrix.$matrix.m13]);
      var row1=new Vector3([matrix.$matrix.m21, matrix.$matrix.m22, matrix.$matrix.m23]);
      var row2=new Vector3([matrix.$matrix.m31, matrix.$matrix.m32, matrix.$matrix.m33]);
      scale[0] = row0.vectorLength();
      row0.divide(scale[0]);
      skew[0] = row0.dot(row1);
      row1.combine(row0, 1.0, -skew[0]);
      scale[1] = row1.vectorLength();
      row1.divide(scale[1]);
      skew[0]/=scale[1];
      skew[1] = row1.dot(row2);
      row2.combine(row0, 1.0, -skew[1]);
      skew[2] = row1.dot(row2);
      row2.combine(row1, 1.0, -skew[2]);
      scale[2] = row2.vectorLength();
      row2.divide(scale[2]);
      skew[1]/=scale[2];
      skew[2]/=scale[2];
      var pdum3=new Vector3(row1);
      pdum3.cross(row2);
      if (row0.dot(pdum3)<0) {
          for (var i=0; i<3; i++) {
              scale[i]*=-1;
              row0[i]*=-1;
              row1[i]*=-1;
              row2[i]*=-1;
          }
      }
      rotate[1] = Math.asin(-row0[2]);
      if (Math.cos(rotate[1])!=0) {
          rotate[0] = Math.atan2(row1[2], row2[2]);
          rotate[2] = Math.atan2(row0[1], row0[0]);
      }
      else {
        rotate[0] = Math.atan2(-row2[0], row1[1]);
        rotate[2] = 0;
      }
      var rad2deg=180/Math.PI;
      rotate[0]*=rad2deg;
      rotate[1]*=rad2deg;
      rotate[2]*=rad2deg;
      return true;
    },

    _determinant2x2 : function(a, b, c, d) {
      return a*d-b*c;
    },

    _determinant3x3 : function(a1, a2, a3, b1, b2, b3, c1, c2, c3) {
      return a1*this._determinant2x2(b2, b3, c2, c3)-b1*this._determinant2x2(a2, a3, c2, c3)+c1*this._determinant2x2(a2, a3, b2, b3);
    },

    _determinant4x4 : function() {
      var a1=this.$matrix.m11;
      var b1=this.$matrix.m12;
      var c1=this.$matrix.m13;
      var d1=this.$matrix.m14;
      var a2=this.$matrix.m21;
      var b2=this.$matrix.m22;
      var c2=this.$matrix.m23;
      var d2=this.$matrix.m24;
      var a3=this.$matrix.m31;
      var b3=this.$matrix.m32;
      var c3=this.$matrix.m33;
      var d3=this.$matrix.m34;
      var a4=this.$matrix.m41;
      var b4=this.$matrix.m42;
      var c4=this.$matrix.m43;
      var d4=this.$matrix.m44;
      return a1*this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4)-b1*this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4)+c1*this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4)-d1*this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
    },

    _makeAdjoint : function() {
      var a1=this.$matrix.m11;
      var b1=this.$matrix.m12;
      var c1=this.$matrix.m13;
      var d1=this.$matrix.m14;
      var a2=this.$matrix.m21;
      var b2=this.$matrix.m22;
      var c2=this.$matrix.m23;
      var d2=this.$matrix.m24;
      var a3=this.$matrix.m31;
      var b3=this.$matrix.m32;
      var c3=this.$matrix.m33;
      var d3=this.$matrix.m34;
      var a4=this.$matrix.m41;
      var b4=this.$matrix.m42;
      var c4=this.$matrix.m43;
      var d4=this.$matrix.m44;
      this.$matrix.m11 = this._determinant3x3(b2, b3, b4, c2, c3, c4, d2, d3, d4);
      this.$matrix.m21 = -this._determinant3x3(a2, a3, a4, c2, c3, c4, d2, d3, d4);
      this.$matrix.m31 = this._determinant3x3(a2, a3, a4, b2, b3, b4, d2, d3, d4);
      this.$matrix.m41 = -this._determinant3x3(a2, a3, a4, b2, b3, b4, c2, c3, c4);
      this.$matrix.m12 = -this._determinant3x3(b1, b3, b4, c1, c3, c4, d1, d3, d4);
      this.$matrix.m22 = this._determinant3x3(a1, a3, a4, c1, c3, c4, d1, d3, d4);
      this.$matrix.m32 = -this._determinant3x3(a1, a3, a4, b1, b3, b4, d1, d3, d4);
      this.$matrix.m42 = this._determinant3x3(a1, a3, a4, b1, b3, b4, c1, c3, c4);
      this.$matrix.m13 = this._determinant3x3(b1, b2, b4, c1, c2, c4, d1, d2, d4);
      this.$matrix.m23 = -this._determinant3x3(a1, a2, a4, c1, c2, c4, d1, d2, d4);
      this.$matrix.m33 = this._determinant3x3(a1, a2, a4, b1, b2, b4, d1, d2, d4);
      this.$matrix.m43 = -this._determinant3x3(a1, a2, a4, b1, b2, b4, c1, c2, c4);
      this.$matrix.m14 = -this._determinant3x3(b1, b2, b3, c1, c2, c3, d1, d2, d3);
      this.$matrix.m24 = this._determinant3x3(a1, a2, a3, c1, c2, c3, d1, d2, d3);
      this.$matrix.m34 = -this._determinant3x3(a1, a2, a3, b1, b2, b3, d1, d2, d3);
      this.$matrix.m44 = this._determinant3x3(a1, a2, a3, b1, b2, b3, c1, c2, c3);
    }

  });
  var M_SQRT2=Math.sqrt(2.0);
  var FLT_EPSILON=2.22e-16;
  function bounded_acos(fac) {
    if (fac<=-1.0)
      return Math.pi;
    else 
      if (fac>=1.0)
      return 0.0;
    else 
      return Math.acos(fac);
  }
  function saasin(fac) {
    if (fac<=-1.0)
      return -Math.pi/2.0;
    else 
      if (fac>=1.0)
      return Math.pi/2.0;
    else 
      return Math.asin(fac);
  }
  var _temp_xyz_vecs=[];
  for (var i=0; i<32; i++) {
      _temp_xyz_vecs.push(null);
  }
  var _temp_xyz_cur=0;
  var $init_exports_Vector3=[0, 0, 0];
  var Vector3=exports.Vector3 = function(vec) {
    if ($init_exports_Vector3==undefined)
      $init_exports_Vector3 = [0, 0, 0];
    if (vec==undefined)
      vec = $init_exports_Vector3;
    if (vec[0]==undefined)
      vec[0] = 0;
    if (vec[1]==undefined)
      vec[1] = 0;
    if (vec[2]==undefined)
      vec[2] = 0;
    if (typeof (vec)=="number"||typeof (vec[0])!="number")
      throw new Error("Invalid argument to new Vector3(vec)");
    this.length = 3;
    this[0] = vec[0];
    this[1] = vec[1];
    this[2] = vec[2];
  };
  var $_tmp_cross=[0, 0, 0];
  var $vec_vectorDistance=new Vector3();
  var $vec_vectorDotDistance=new Vector3();
  var $add_static_add=new Vector3();
  var $_static_sub_static_sub=new Vector3();
  var $_static_mul_static_mul=new Vector3();
  var $_static_divide_static_divide=new Vector3();
  var $_static_addScalar_static_addScalar=new Vector3();
  var $_static_subScalar_static_subScalar=new Vector3();
  var $_static_mulScalar_static_mulScalar=new Vector3();
  var $_static_divideScalar__static_divideScalar=new Vector3();
  var $_v3nd_n1_normalizedDot=new Vector3();
  var $_v3nd4_n1_normalizedDot4=new Vector3();
  var $_v3nd_n2_normalizedDot=new Vector3();
  var $_v3nd4_n2_normalizedDot4=new Vector3();
  
  var cos = Math.cos;
  var sin = Math.sin;
  var pow = Math.pow;
  var abs = Math.abs;
  var sqrt = Math.sqrt;
  var log = Math.log;
  
  Vector3.prototype = util.inherit(Vector3, Array, {
    toJSON : function() {
      var arr=new Array(this.length);
      var i=0;
      for (var i=0; i<this.length; i++) {
          arr[i] = this[i];
      }
      return arr;
    },
    
    //axis is optional, 0
    rot2d : function(A, axis) {
      var x = this[0];
      var y = this[1];
      
      if (axis == 1) {
        this[0] = x * cos(A) + y*sin(A);
        this[1] = y * cos(A) - x*sin(A);
      } else {
        this[0] = x * cos(A) - y*sin(A);
        this[1] = y * cos(A) + x*sin(A);
      }
      
      return this;
    },
    
    clone : function() {
      return new Vector3(this);
    },
    
    concat_array : function(arr) {
      arr.push(this[0]);
      arr.push(this[1]);
      arr.push(this[2]);
    },
    
    zero : function() {
      this[0] = 0.0;
      this[1] = 0.0;
      this[2] = 0.0;
      return this;
    },

    floor : function() {
      this[0] = Math.floor(this[0]);
      this[1] = Math.floor(this[1]);
      this[2] = Math.floor(this[2]);
      return this;
    },

    ceil : function() {
      this[0] = Math.ceil(this[0]);
      this[1] = Math.ceil(this[1]);
      this[2] = Math.ceil(this[2]);
      return this;
    },

    //z is optional, 0
    loadxy : function(vec2, z) {
      if (z==undefined) {
          z = 0;
      }
      this[0] = vec2[0];
      this[1] = vec2[1];
      this[3] = z;
      return this;
    },

    load : function(vec3) {
      this[0] = vec3[0];
      this[1] = vec3[1];
      this[2] = vec3[2];
      return this;
    },

    loadXYZ : function(x, y, z) {
      this[0] = x;
      this[1] = y;
      this[2] = z;
      return this;
    },

    getAsArray : function() {
      return [this[0], this[1], this[2]];
    },
    
    toDebug : function() {
      var dec = 4;
      return "[" + this[0].toFixed(dec) + ", " + this[1].toFixed(dec) + ", " + this[2].toFixed(dec) + "]";
    },
    
    min : function(b) {
      this[0] = Math.min(this[0], b[0]);
      this[1] = Math.min(this[1], b[1]);
      this[2] = Math.min(this[2], b[2]);
      return this;
    },

    max : function(b) {
      this[0] = Math.max(this[0], b[0]);
      this[1] = Math.max(this[1], b[1]);
      this[2] = Math.max(this[2], b[2]);
      return this;
    },

    floor : function(b) {
      this[0] = Math.floor(this[0], b[0]);
      this[1] = Math.floor(this[1], b[1]);
      this[2] = Math.floor(this[2], b[2]);
      return this;
    },

    ceil : function(b) {
      this[0] = Math.ceil(this[0], b[0]);
      this[1] = Math.ceil(this[1], b[1]);
      this[2] = Math.ceil(this[2], b[2]);
      return this;
    },

    round : function(b) {
      this[0] = Math.round(this[0], b[0]);
      this[1] = Math.round(this[1], b[1]);
      this[2] = Math.round(this[2], b[2]);
      return this;
    },

    getAsFloat32Array : function() {
      return new Float32Array(this.getAsArray());
    },

    vectorLength : function() {
      return Math.sqrt(this[0]*this[0]+this[1]*this[1]+this[2]*this[2]);
    },

    normalize : function() {
      var len=this.vectorLength();
      if (len>FLT_EPSILON*2)
        this.mulScalar(1.0/len);
      return this;
    },

    negate : function() {
      this[0] = -this[0];
      this[1] = -this[1];
      this[2] = -this[2];
      return this;
    },

    fast_normalize : function() {
      var d=this[0]*this[0]+this[1]*this[1]+this[2]*this[2];
      var len=Math.sqrt(d);
      if (len>FLT_EPSILON)
        return this;
      this[0]/=len;
      this[1]/=len;
      this[2]/=len;
      return this;
    },

    divideVect : function(v) {
      this[0]/=v[0];
      this[1]/=v[1];
      this[2]/=v[2];
      return this;
    },

    divide : function(divisor) {
      this[0]/=divisor;
      this[1]/=divisor;
      this[2]/=divisor;
      return this;
    },

    divideScalar : function(divisor) {
      this[0]/=divisor;
      this[1]/=divisor;
      this[2]/=divisor;
      return this;
    },

    divScalar : function(divisor) {
      this[0]/=divisor;
      this[1]/=divisor;
      this[2]/=divisor;
      return this;
    },

    divVector : function(vec) {
      this[0]/=vec[0];
      this[1]/=vec[1];
      this[2]/=vec[2];
      return this;
    },

    subScalar : function(scalar) {
      this[0]-=scalar;
      this[1]-=scalar;
      this[2]-=scalar;
      return this;
    },

    addScalar : function(scalar) {
      this[0]+=scalar;
      this[1]+=scalar;
      this[2]+=scalar;
      return this;
    },

    mulScalar : function(scalar) {
      this[0]*=scalar;
      this[1]*=scalar;
      this[2]*=scalar;
      return this;
    },

    mul : function(v) {
      this[0] = this[0]*v[0];
      this[1] = this[1]*v[1];
      this[2] = this[2]*v[2];
      return this;
    },

    cross : function(v) {
      $_tmp_cross[0] = this[1]*v[2]-this[2]*v[1];
      $_tmp_cross[1] = this[2]*v[0]-this[0]*v[2];
      $_tmp_cross[2] = this[0]*v[1]-this[1]*v[0];
      this[0] = $_tmp_cross[0];
      this[1] = $_tmp_cross[1];
      this[2] = $_tmp_cross[2];
      return this;
    },

    vectorDistance : function(v2) {
      $vec_vectorDistance.load(this);
      $vec_vectorDistance.sub(v2);
      return $vec_vectorDistance.vectorLength();
    },

    vectorDotDistance : function(v2) {
      $vec_vectorDotDistance.load(this);
      $vec_vectorDotDistance.sub(v2);
      return $vec_vectorDotDistance.dot($vec_vectorDotDistance);
    },

    sub : function(v) {
      if (v==null||v==undefined)
        console.trace();
      this[0] = this[0]-v[0];
      this[1] = this[1]-v[1];
      this[2] = this[2]-v[2];
      return this;
    },

    add : function(v) {
      this[0] = this[0]+v[0];
      this[1] = this[1]+v[1];
      this[2] = this[2]+v[2];
      return this;
    },

    static_add : function(v) {
      $add_static_add[0] = this[0]+v[0];
      $add_static_add[1] = this[1]+v[1];
      $add_static_add[2] = this[2]+v[2];
      return $add_static_add;
    },

    static_sub : function(v) {
      $_static_sub_static_sub[0] = this[0]-v[0];
      $_static_sub_static_sub[1] = this[1]-v[1];
      $_static_sub_static_sub[2] = this[2]-v[2];
      return $_static_sub_static_sub;
    },

    static_mul : function(v) {
      $_static_mul_static_mul[0] = this[0]*v[0];
      $_static_mul_static_mul[1] = this[1]*v[1];
      $_static_mul_static_mul[2] = this[2]*v[2];
      return $_static_mul_static_mul;
    },

    static_divide : function(v) {
      $_static_divide_static_divide[0] = this[0]/v[0];
      $_static_divide_static_divide[1] = this[1]/v[1];
      $_static_divide_static_divide[2] = this[2]/v[2];
      return $_static_divide_static_divide;
    },

    static_addScalar : function(s) {
      $_static_addScalar_static_addScalar[0] = this[0]+s;
      $_static_addScalar_static_addScalar[1] = this[1]+s;
      $_static_addScalar_static_addScalar[2] = this[2]+s;
      return $_static_addScalar_static_addScalar;
    },

    static_subScalar : function(s) {
      $_static_subScalar_static_subScalar[0] = this[0]-s;
      $_static_subScalar_static_subScalar[1] = this[1]-s;
      $_static_subScalar_static_subScalar[2] = this[2]-s;
      return $_static_subScalar_static_subScalar;
    },

    static_mulScalar : function(s) {
      $_static_mulScalar_static_mulScalar[0] = this[0]*s;
      $_static_mulScalar_static_mulScalar[1] = this[1]*s;
      $_static_mulScalar_static_mulScalar[2] = this[2]*s;
      return $_static_mulScalar_static_mulScalar;
    },

    _static_divideScalar : function(s) {
      $_static_divideScalar__static_divideScalar[0] = this[0]/s;
      $_static_divideScalar__static_divideScalar[1] = this[1]/s;
      $_static_divideScalar__static_divideScalar[2] = this[2]/s;
      return $_static_divideScalar__static_divideScalar;
    },

    dot : function(v) {
      return this[0]*v[0]+this[1]*v[1]+this[2]*v[2];
    },

    normalizedDot : function(v) {
      $_v3nd_n1_normalizedDot.load(this);
      $_v3nd_n2_normalizedDot.load(v);
      $_v3nd_n1_normalizedDot.normalize();
      $_v3nd_n2_normalizedDot.normalize();
      return $_v3nd_n1_normalizedDot.dot($_v3nd_n2_normalizedDot);
    },

    preNormalizedAngle : function(v2) {
      if (this.dot(v2)<0.0) {
          var vec=new Vector3();
          vec[0] = -v2[0];
          vec[1] = -v2[1];
          vec[2] = -v2[2];
          return Math.pi-2.0*saasin(vec.vectorDistance(this)/2.0);
      }
      else 
        return 2.0*saasin(v2.vectorDistance(this)/2.0);
    },

    combine : function(v, ascl, bscl) {
      this[0] = (ascl*this[0])+(bscl*v[0]);
      this[1] = (ascl*this[1])+(bscl*v[1]);
      this[2] = (ascl*this[2])+(bscl*v[2]);
    },

    mulVecQuat : function(q) {
      var t0=-this[1]*this[0]-this[2]*this[1]-this[3]*this[2];
      var t1=this[0]*this[0]+this[2]*this[2]-this[3]*this[1];
      var t2=this[0]*this[1]+this[3]*this[0]-this[1]*this[2];
      this[2] = this[0]*this[2]+this[1]*this[1]-this[2]*this[0];
      this[0] = t1;
      this[1] = t2;
      t1 = t0*-this[1]+this[0]*this[0]-this[1]*this[3]+this[2]*this[2];
      t2 = t0*-this[2]+this[1]*this[0]-this[2]*this[1]+this[0]*this[3];
      this[2] = t0*-this[3]+this[2]*this[0]-this[0]*this[2]+this[1]*this[1];
      this[0] = t1;
      this[1] = t2;
    },

    multVecMatrix : function(matrix, ignore_w) {
      if (ignore_w==undefined) {
          ignore_w = false;
      }
      var x=this[0];
      var y=this[1];
      var z=this[2];
      this[0] = matrix.$matrix.m41+x*matrix.$matrix.m11+y*matrix.$matrix.m21+z*matrix.$matrix.m31;
      this[1] = matrix.$matrix.m42+x*matrix.$matrix.m12+y*matrix.$matrix.m22+z*matrix.$matrix.m32;
      this[2] = matrix.$matrix.m43+x*matrix.$matrix.m13+y*matrix.$matrix.m23+z*matrix.$matrix.m33;
      var w=matrix.$matrix.m44+x*matrix.$matrix.m14+y*matrix.$matrix.m24+z*matrix.$matrix.m34;
      if (!ignore_w&&w!=1&&w!=0&&matrix.isPersp) {
          this[0]/=w;
          this[1]/=w;
          this[2]/=w;
      }
      return w;
    },

    interp : function(b, t) {
      this[0]+=(b[0]-this[0])*t;
      this[1]+=(b[1]-this[1])*t;
      this[2]+=(b[2]-this[2])*t;
      
      return this;
    },

    toString : function(decimal) {
      if (decimal != undefined) {
        var ret = "["+this[0].toFixed(decimal)+",";
        ret += this[1].toFixed(decimal)+",";
        ret += this[2].toFixed(decimal)+"]";
        return ret;
      } else {
        return "["+this[0]+","+this[1]+","+this[2]+"]";
      }
    }

  });
  
  Vector3.normalizedDot3 = function(v1, v2, v3) {
    $_v3nd4_n1_normalizedDot4.load(v1).sub(v2).normalize();
    $_v3nd4_n2_normalizedDot4.load(v3).sub(v2).normalize();
    return $_v3nd4_n1_normalizedDot4.dot($_v3nd4_n2_normalizedDot4);
  };
  
  Vector3.normalizedDot4 = function(v1, v2, v3, v4) {
    $_v3nd4_n1_normalizedDot4.load(v2).sub(v1).normalize();
    $_v3nd4_n2_normalizedDot4.load(v4).sub(v3).normalize();
    return $_v3nd4_n1_normalizedDot4.dot($_v3nd4_n2_normalizedDot4);
  };

  var _vec2_init=[0, 0];
  var _v2_static_mvm_co=new Vector3();
  var Vector2 = exports.Vector2 = function(vec) {
    Array.call(this, 2);
    if (vec==undefined)
      vec = _vec2_init;
    if (vec[0]==undefined)
      vec[0] = 0;
    if (vec[1]==undefined)
      vec[1] = 0;
    if (typeof (vec)=="number"||typeof (vec[0])!="number")
      throw new Error("Invalid argument to new Vector2(vec): "+JSON.stringify(vec));
    this[0] = vec[0];
    this[1] = vec[1];
    this.length = 2;
  }
  
  Vector2.prototype.clone = function() {
      return new Vector2(this);
  };
  
  Vector2.prototype.toDebug = function() {
    var dec = 4;
    return "[" + this[0].toFixed(dec) + ", " + this[1].toFixed(dec) + "]";
  };
  
  Vector2.prototype = util.inherit(Vector2, Array, {});
  Vector2.prototype.toJSON = function() {
    var arr=new Array(this.length);
    var i=0;
    for (var i=0; i<this.length; i++) {
        arr[i] = this[i];
    }
    return arr;
  };
  Vector2.prototype.dot = function(b) {
    return this[0]*b[0]+this[1]*b[1];
  };
  Vector2.prototype.load = function(b) {
    this[0] = b[0];
    this[1] = b[1];
    return this;
  };
  Vector2.prototype.zero = function() {
    this[0] = this[1] = 0.0;
    return this;
  };
  Vector2.prototype.floor = function() {
    this[0] = Math.floor(this[0]);
    this[1] = Math.floor(this[1]);
    return this;
  };
  Vector2.prototype.ceil = function() {
    this[0] = Math.ceil(this[0]);
    this[1] = Math.ceil(this[1]);
    return this;
  };
  Vector2.prototype.vectorDistance = function(b) {
    var x, y;
    x = this[0]-b[0];
    y = this[1]-b[1];
    
    return Math.sqrt(x*x+y*y);
  };
  Vector2.prototype.vectorLength = function() {
    return Math.sqrt(this[0]*this[0]+this[1]*this[1]);
  };
  Vector2.prototype.sub = function(b) {
    this[0]-=b[0];
    this[1]-=b[1];
    return this;
  };
  Vector2.prototype.add = function(b) {
    this[0]+=b[0];
    this[1]+=b[1];
    return this;
  };
  Vector2.prototype.mul = function(b) {
    this[0]*=b[0];
    this[1]*=b[1];
    return this;
  };
  Vector2.prototype.divide = function(b) {
    this[0]/=b[0];
    this[1]/=b[1];
    return this;
  };
  Vector2.prototype.divideScalar = function(b) {
    this[0]/=b;
    this[1]/=b;
    return this;
  };
  Vector2.prototype.negate = function() {
    this[0] = -this[0];
    this[1] = -this[1];
    return this;
  };
  Vector2.prototype.mulScalar = function(b) {
    this[0]*=b;
    this[1]*=b;
    return this;
  };
  Vector2.prototype.addScalar = function(b) {
    this[0]+=b;
    this[1]+=b;
    return this;
  };
  Vector2.prototype.subScalar = function(b) {
    this[0]-=b;
    this[1]-=b;
    return this;
  };
  Vector2.prototype.multVecMatrix = function(mat) {
    var v3=_v2_static_mvm_co;
    v3.load(self);
    v3[2] = 0.0;
    v3.multVecMatrix(mat);
    this[0] = v3[0];
    this[1] = v3[1];
    return this;
  };
  Vector2.prototype.normalize = function() {
    var vlen=this.vectorLength();
    if (vlen<FLT_EPSILON) {
        this[0] = this[1] = 0.0;
        return this;
    }
    
    this[0]/=vlen;
    this[1]/=vlen;
    
    return this;
  };
  Vector2.prototype.toSource = function() {
    return "new Vector2(["+this[0]+", "+this[1]+"])";
  };
  Vector2.prototype.toString = function() {
    return "["+this[0]+", "+this[1]+"]";
  };
  Vector2.prototype.interp = function(b, t) {
    this[0]+=(b[0]-this[0])*t;
    this[1]+=(b[1]-this[1])*t;
    
    return this;
  };
  function Color(color) {
    var c=new Array();
    c[0] = color[0];
    c[1] = color[1];
    c[2] = color[2];
    c[3] = color[3];
    return c;
  }
  var Vector4=exports.Vector4 = function(x, y, z, w) {
    Array.call(this, 4);
    this.length = 4;
    this.load(x, y, z, w);
  };
  Vector4.prototype = util.inherit(Vector4, Array, {
    toJSON : function() {
      var arr=new Array(this.length);
      var i=0;
      for (var i=0; i<this.length; i++) {
          arr[i] = this[i];
      }
      return arr;
    },
    
    clone : function() {
      return new Vector4(this);
    },

    toDebug : function() {
      var dec = 4;
      var ret = "[" + this[0].toFixed(dec) + ", " + this[1].toFixed(dec) + ", " + this[2].toFixed(dec);
      ret += ", " + this[3].toFixed(dec) + "]";
    },
    
    load : function(x, y, z, w) {
      if (typeof x=='object'&&"length" in x) {
          this[0] = x[0];
          this[1] = x[1];
          this[2] = x[2];
          this[3] = x[3];
      }
      else 
        if (typeof x=='number') {
          this[0] = x;
          this[1] = y;
          this[2] = z;
          this[3] = w;
      }
      else {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;
      }
      return this;
    },

    floor : function() {
      this[0] = Math.floor(this[0]);
      this[1] = Math.floor(this[1]);
      this[2] = Math.floor(this[2]);
      this[3] = Math.floor(this[3]);
      return this;
    },

    ceil : function() {
      this[0] = Math.ceil(this[0]);
      this[1] = Math.ceil(this[1]);
      this[2] = Math.ceil(this[2]);
      this[3] = Math.ceil(this[3]);
      return this;
    },

    getAsArray : function() {
      return [this[0], this[1], this[2], this[3]];
    },

    getAsFloat32Array : function() {
      return new Float32Array(this.getAsArray());
    },

    vectorLength : function() {
      return Math.sqrt(this[0]*this[0]+this[1]*this[1]+this[2]*this[2]+this[3]*this[3]);
    },

    normalize : function() {
      var len=this.vectorLength();
      if (len>FLT_EPSILON)
        this.mulScalar(1.0/len);
      return len;
    },

    divide : function(divisor) {
      this[0]/=divisor;
      this[1]/=divisor;
      this[2]/=divisor;
      this[3]/=divisor;
    },

    negate : function() {
      this[0] = -this[0];
      this[1] = -this[1];
      this[2] = -this[2];
      this[3] = -this[3];
      return this;
    },

    mulScalar : function(scalar) {
      this[0]*=scalar;
      this[1]*=scalar;
      this[2]*=scalar;
      this[3]*=scalar;
      return this;
    },

    mul : function(scalar) {
      this[0] = this[0]*v[0];
      this[1] = this[1]*v[1];
      this[2] = this[2]*v[2];
      this[3] = this[3]*v[3];
      
      return this;
    },

    cross : function(v) {
      $_tmp_cross[0] = this[1]*v[2]-this[2]*v[1];
      $_tmp_cross[1] = this[2]*v[0]-this[0]*v[2];
      $_tmp_cross[2] = this[0]*v[1]-this[1]*v[0];
      this[0] = $_tmp_cross[0];
      this[1] = $_tmp_cross[1];
      this[2] = $_tmp_cross[2];
      return this;
    },
    /*cross : function(v) {
      this[0] = this[1]*v[2]-this[2]*v[1];
      this[1] = -this[0]*v[2]+this[2]*v[0];
      this[2] = this[0]*v[1]-this[1]*v[0];
      
      return this;
    },*/

    sub : function(v) {
      this[0] = this[0]-v[0];
      this[1] = this[1]-v[1];
      this[2] = this[2]-v[2];
      this[3] = this[3]-v[3];
      
      return this;
    },

    add : function(v) {
      this[0] = this[0]+v[0];
      this[1] = this[1]+v[1];
      this[2] = this[2]+v[2];
      this[3] = this[3]+v[3];
      
      return this;
    },

    dot : function(v) {
      return this[0]*v[0]+this[1]*v[1]+this[2]*v[2]+this[3]*v[3];
    },

    combine : function(v, ascl, bscl) {
      this[0] = (ascl*this[0])+(bscl*v[0]);
      this[1] = (ascl*this[1])+(bscl*v[1]);
      this[2] = (ascl*this[2])+(bscl*v[2]);
      this[3] = (ascl*this[3])+(bscl*v[3]);
      
      return this;
    },

    multVecMatrix : function(matrix) {
      var x=this[0];
      var y=this[1];
      var z=this[2];
      var w=this[3];
      this[0] = matrix.$matrix.m41+x*matrix.$matrix.m11+y*matrix.$matrix.m21+z*matrix.$matrix.m31+w*matrix.$matrix.m41;
      this[1] = matrix.$matrix.m42+x*matrix.$matrix.m12+y*matrix.$matrix.m22+z*matrix.$matrix.m32+w*matrix.$matrix.m42;
      this[2] = matrix.$matrix.m43+x*matrix.$matrix.m13+y*matrix.$matrix.m23+z*matrix.$matrix.m33+w*matrix.$matrix.m43;
      this[3] = w*matrix.$matrix.m44+x*matrix.$matrix.m14+y*matrix.$matrix.m24+z*matrix.$matrix.m34;
      return w;
    },

    interp : function(b, t) {
      this[0]+=(b[0]-this[0])*t;
      this[1]+=(b[1]-this[1])*t;
      this[2]+=(b[2]-this[2])*t;
      this[3]+=(b[3]-this[3])*t;
      
      return this;
    },

    toString : function() {
      return "["+this[0]+","+this[1]+","+this[2]+","+this[3]+"]";
    }

  });
  var $v4init_exports_Quat=[0, 0, 0, 0];
  var Quat=exports.Quat = function(x, y, z, w) {
    var vec=$v4init_exports_Quat;
    if (typeof (x)=="number") {
        $v4init_exports_Quat[0] = x;
        $v4init_exports_Quat[1] = y;
        $v4init_exports_Quat[2] = z;
        $v4init_exports_Quat[3] = w;
    }
    else {
      vec = x;
    }
    Vector4.call(this, vec);
  };
  Quat.prototype = util.inherit(Quat, Vector4, {
    load : function(x, y, z, w) {
      if (typeof x=='object'&&"length" in x) {
          this[0] = x[0];
          this[1] = x[1];
          this[2] = x[2];
          this[3] = x[3];
      }
      else 
        if (typeof x=='number') {
          this[0] = x;
          this[1] = y;
          this[2] = z;
          this[3] = w;
      }
      else {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;
      }
    },

    clone : function() {
      return new Quat(this);
    },
    
    makeUnitQuat : function() {
      this[0] = 1.0;
      this[1] = this[2] = this[3] = 0.0;
    },

    isZero : function() {
      return (this[0]==0&&this[1]==0&&this[2]==0&&this[3]==0);
    },

    mulQuat : function(qt) {
      var a=this[0]*qt[0]-this[1]*qt[1]-this[2]*qt[2]-this[3]*qt[3];
      var b=this[0]*qt[1]+this[1]*qt[0]+this[2]*qt[3]-this[3]*qt[2];
      var c=this[0]*qt[2]+this[2]*qt[0]+this[3]*qt[1]-this[1]*qt[3];
      this[3] = this[0]*qt[3]+this[3]*qt[0]+this[1]*qt[2]-this[2]*qt[1];
      this[0] = a;
      this[1] = b;
      this[2] = c;
    },

    conjugate : function() {
      this[1] = -this[1];
      this[2] = -this[2];
      this[3] = -this[3];
    },

    dotWithQuat : function(q2) {
      return this[0]*q2[0]+this[1]*q2[1]+this[2]*q2[2]+this[3]*q2[3];
    },

    invert : function() {
      var f=this.dot();
      if (f==0.0)
        return;
        
      conjugate_qt(q);
      this.mulscalar(1.0/f);
    },

    sub : function(q2) {
      var nq2=new Quat();
      nq2[0] = -q2[0];
      nq2[1] = q2[1];
      nq2[2] = q2[2];
      nq2[3] = q2[3];
      this.mul(nq2);
    },

    mulScalarWithFactor : function(fac) {
      var angle=fac*bounded_acos(this[0]);
      var co=Math.cos(angle);
      var si=Math.sin(angle);
      
      this[0] = co;
      
      var last3=Vector3([this[1], this[2], this[3]]);
      last3.normalize();
      last3.mulScalar(si);
      this[1] = last3[0];
      this[2] = last3[1];
      this[3] = last3[2];
      return this;
    },

    toMatrix : function() {
      var m=new Matrix4();
      var q0=M_SQRT2*this[0];
      var q1=M_SQRT2*this[1];
      var q2=M_SQRT2*this[2];
      var q3=M_SQRT2*this[3];
      var qda=q0*q1;
      var qdb=q0*q2;
      var qdc=q0*q3;
      var qaa=q1*q1;
      var qab=q1*q2;
      var qac=q1*q3;
      var qbb=q2*q2;
      var qbc=q2*q3;
      var qcc=q3*q3;
      m.$matrix.m11 = (1.0-qbb-qcc);
      m.$matrix.m12 = (qdc+qab);
      m.$matrix.m13 = (-qdb+qac);
      m.$matrix.m14 = 0.0;
      m.$matrix.m21 = (-qdc+qab);
      m.$matrix.m22 = (1.0-qaa-qcc);
      m.$matrix.m23 = (qda+qbc);
      m.$matrix.m24 = 0.0;
      m.$matrix.m31 = (qdb+qac);
      m.$matrix.m32 = (-qda+qbc);
      m.$matrix.m33 = (1.0-qaa-qbb);
      m.$matrix.m34 = 0.0;
      m.$matrix.m41 = m.$matrix.m42 = m.$matrix.m43 = 0.0;
      m.$matrix.m44 = 1.0;
      return m;
    },

    matrixToQuat : function(wmat) {
      var mat=new Matrix4(wmat);
      mat.$matrix.m41 = mat.$matrix.m42 = mat.$matrix.m43 = 0;
      mat.$matrix.m44 = 1.0;
      var r1=new Vector3([mat.$matrix.m11, mat.$matrix.m12, mat.$matrix.m13]);
      var r2=new Vector3([mat.$matrix.m21, mat.$matrix.m22, mat.$matrix.m23]);
      var r3=new Vector3([mat.$matrix.m31, mat.$matrix.m32, mat.$matrix.m33]);
      
      r1.normalize();
      r2.normalize();
      r3.normalize();
      
      mat.$matrix.m11 = r1[0];
      mat.$matrix.m12 = r1[1];
      mat.$matrix.m13 = r1[2];
      mat.$matrix.m21 = r2[0];
      mat.$matrix.m22 = r2[1];
      mat.$matrix.m23 = r2[2];
      mat.$matrix.m31 = r3[0];
      mat.$matrix.m32 = r3[1];
      mat.$matrix.m33 = r3[2];
      var tr=0.25*(1.0+mat.$matrix.m11+mat.$matrix.m22+mat.$matrix.m33);
      var s=0;
      if (tr>FLT_EPSILON) {
          s = Math.sqrt(tr);
          this[0] = s;
          s = 1.0/(4.0*s);
          this[1] = ((mat.$matrix.m23-mat.$matrix.m32)*s);
          this[2] = ((mat.$matrix.m31-mat.$matrix.m13)*s);
          this[3] = ((mat.$matrix.m12-mat.$matrix.m21)*s);
      }
      else {
        if (mat.$matrix.m11>mat.$matrix.m22&&mat.$matrix.m11>mat.$matrix.m33) {
            s = 2.0*Math.sqrt(1.0+mat.$matrix.m11-mat.$matrix.m22-mat.$matrix.m33);
            this[1] = (0.25*s);
            s = 1.0/s;
            this[0] = ((mat.$matrix.m32-mat.$matrix.m23)*s);
            this[2] = ((mat.$matrix.m21+mat.$matrix.m12)*s);
            this[3] = ((mat.$matrix.m31+mat.$matrix.m13)*s);
        }
        else 
          if (mat.$matrix.m22>mat.$matrix.m33) {
            s = 2.0*Math.sqrt(1.0+mat.$matrix.m22-mat.$matrix.m11-mat.$matrix.m33);
            this[2] = (0.25*s);
            s = 1.0/s;
            this[0] = ((mat.$matrix.m31-mat.$matrix.m13)*s);
            this[1] = ((mat.$matrix.m21+mat.$matrix.m12)*s);
            this[3] = ((mat.$matrix.m32+mat.$matrix.m23)*s);
        }
        else {
          s = 2.0*Math.sqrt(1.0+mat.$matrix.m33-mat.$matrix.m11-mat.$matrix.m22);
          this[3] = (0.25*s);
          s = 1.0/s;
          this[0] = ((mat.$matrix.m21-mat.$matrix.m12)*s);
          this[1] = ((mat.$matrix.m31+mat.$matrix.m13)*s);
          this[2] = ((mat.$matrix.m32+mat.$matrix.m23)*s);
        }
      }
      this.normalize();
    },

    normalize : function() {
      var len=Math.sqrt(this.dot(this));
      if (len!=0.0) {
          this.mulScalar(1.0/len);
      }
      else {
        this[1] = 1.0;
        this[0] = this[2] = this[3] = 0.0;
      }
      return this;
    },

    axisAngleToQuat : function(axis, angle) {
      var nor=new Vector3(axis);
      if (nor.normalize()!=0.0) {
          var phi=angle/2.0;
          var si=Math.sin(phi);
          this[0] = Math.cos(phi);
          this[1] = nor[0]*si;
          this[2] = nor[1]*si;
          this[3] = nor[2]*si;
      }
      else {
        this.makeUnitQuat();
      }
    },

    rotationBetweenVecs : function(v1, v2) {
      v1 = new Vector3(v1);
      v2 = new Vector3(v2);
      v1.normalize();
      v2.normalize();
      var axis=new Vector3(v1);
      axis.cross(v2);
      var angle=v1.preNormalizedAngle(v2);
      this.axisAngleToQuat(axis, angle);
    },

    quatInterp : function(quat2, t) {
      var quat=new Quat();
      var cosom=this[0]*quat2[0]+this[1]*quat2[1]+this[2]*quat2[2]+this[3]*quat2[3];
      if (cosom<0.0) {
          cosom = -cosom;
          quat[0] = -this[0];
          quat[1] = -this[1];
          quat[2] = -this[2];
          quat[3] = -this[3];
      }
      else {
        quat[0] = this[0];
        quat[1] = this[1];
        quat[2] = this[2];
        quat[3] = this[3];
      }
      var omega, sinom, sc1, sc2;
      if ((1.0-cosom)>0.0001) {
          omega = Math.acos(cosom);
          sinom = Math.sin(omega);
          sc1 = Math.sin((1.0-t)*omega)/sinom;
          sc2 = Math.sin(t*omega)/sinom;
      }
      else {
        sc1 = 1.0-t;
        sc2 = t;
      }
      this[0] = sc1*quat[0]+sc2*quat2[0];
      this[1] = sc1*quat[1]+sc2*quat2[1];
      this[2] = sc1*quat[2]+sc2*quat2[2];
      this[3] = sc1*quat[3]+sc2*quat2[3];
      
      return this;
    }

  });
  
  //de-init statics with proper proptotype
  $vec_vectorDistance=new Vector3();
  $vec_vectorDotDistance=new Vector3();
  $add_static_add=new Vector3();
  $_static_sub_static_sub=new Vector3();
  $_static_mul_static_mul=new Vector3();
  $_static_divide_static_divide=new Vector3();
  $_static_addScalar_static_addScalar=new Vector3();
  $_static_subScalar_static_subScalar=new Vector3();
  $_static_mulScalar_static_mulScalar=new Vector3();
  $_static_divideScalar__static_divideScalar=new Vector3();
  $_v3nd_n1_normalizedDot=new Vector3();
  $_v3nd4_n1_normalizedDot4=new Vector3();
  $_v3nd_n2_normalizedDot=new Vector3();
  $_v3nd4_n2_normalizedDot4=new Vector3();
  
  //debug globals, for debug console use only
  _vectormath = exports;
  _Vector3 = Vector3;
  _Matrix4 = undefined;

  return exports;
});
