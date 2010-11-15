window.game = window.game || {};

var ABSOLUTE = 0;
var FIXED = 1;

var COLLIDES = {};
COLLIDES.NONE = 0;
COLLIDES.LEFT = 0x0001;
COLLIDES.RIGHT = 0x0002;
COLLIDES.TOP = 0x0004;
COLLIDES.BOTTOM = 0x0008;
COLLIDES.ALL = 0x000F;
game.COLLIDES = COLLIDES;

var SceneObject = function(repr) {
  this.attachment = ABSOLUTE;
  this.zIndex = 0;
  this.x = 0;
  this.y = 0;
  this.h = 0;
  this.w = 0;
  this.dx = 0;
  this.dy = 0;
  this.freefall = 0;
  this.repr = repr;
  this.gravity = 1.0;
  this.collisions = COLLIDES.NONE;
  this.listeners = {};

  if(this.static) {
    this.update = function(dt) { this.repr.update(dt); };
  }
};

game.events.emitter(SceneObject);

SceneObject.prototype.collide = function(withObj, side) {
  game.events.dispatchEvent('collision', {from:this, to:withObj});
  this.dispatchEvent('collision', withObj, side);
};

SceneObject.prototype.update = function(scene, dt) {
  this.repr.update(dt);

  this.dy = this.dy-this.gravity;

  var vecX = this.dx*(dt/1000),
      vecY = this.dy*(dt/1000),
      tarX = this.x + vecX,
      tarY = this.y + vecY,
      tarX1 = this.w + tarX,
      tarY1 = this.h + tarY,
      innerLen = this.h*2 + this.w*2,
      potential = [];

  if(vecX > 0) {
    potential = potential.concat(scene.filter(this.collisionProfile, COLLIDES.LEFT)); // grab potential left collisions
  } else if(vecX < 0) {
    potential = potential.concat(scene.filter(this.collisionProfile, COLLIDES.RIGHT)); // grab potential right collisions
  }
  if(vecY > 0) {
    potential = potential.concat(scene.filter(this.collisionProfile, COLLIDES.BOTTOM));
  } else if(vecY < 0) {
    potential = potential.concat(scene.filter(this.collisionProfile, COLLIDES.TOP));
  }

  potential = potential.filter(function(item) {
    return item !== this;
  }, this);

  var hit = false;
  if(potential.length) {
    var extent = vecX*vecX + vecY*vecY; // leave off the sqrt, we don't reaaally care
    while(potential.length) {
      var obj = potential.shift(),
          distX = obj.x - this.x,
          distY = obj.y - this.y,
          dist = distX*distX + distY*distY;

    if(dist > (extent+innerLen) &&
       ((tarX1 > obj.x && tarX1 < (obj.x+obj.w)) ||  // leading X edge inside
       (tarX > obj.x && tarX < (obj.x+obj.w)))   &&    // preceding X edge inside
       ((tarY1 > obj.y && tarY1 < (obj.y+obj.h)) ||   // top in object
       (tarY > obj.y && tarY < (obj.y+obj.h)))) {   // bottom in object
        // the above has a side effect of setting grounded if it's a ground collision.
        // sorry, programming gods.
        hit = true;
        if(!this.freefall) { tarY = this.y; this.dy = 0; break; }
        var collision = 0;
        if((obj.y + obj.h) - tarY > 0 && (obj.y+obj.h) - tarY1 < 0 && vecY < 0.0) {
          this.freefall = false;
          this.y = obj.y + obj.h;
          this.dy = 0;
          collision = COLLIDES.TOP;
        }
        else if((tarY1 - obj.y) > 0 && (tarY - obj.y) < 0 && vecX > 0.0) {
          this.freefall = true;
          this.y = obj.y - this.h;
          this.dy = 0;
          collision = COLLIDES.BOTTOM;
        }
        else if((obj.x + obj.w) - tarX > 0 && (obj.x + obj.w) - tarX1 < 0) {
          this.dx = 0;
          //this.x = obj.x + obj.w;
          collision = COLLIDES.RIGHT;
        }
        else if((tarX1 - obj.x) > 0) {
          this.dx = 0;
          //this.x = obj.x - this.w;
          collision = COLLIDES.LEFT;
        }
        this.collide(obj, collision);
        return;
      }
    }
  }

  //this.freefall = hit;
  this.x = tarX;
  this.y = tarY;  
};

var Viewport = function(width, height) {
  this.x = 0;
  this.y = 0;
  this.outerWidth = width;
  this.outerHeight = height;
  this.focusObject = null;
  this.lockHeight = null;
  this.speed = 500;
};

Viewport.prototype.focus = function(obj) {
  this.focusObject = obj;
  game.events.addEventListener('tick', (function(vp) {
    return function(dt) {
      vp.update(dt);
    };
  })(this));

  obj.addEventListener('collision', (function(vp) {
    return function(withObj, side) {
      if(vp.focusObject && !vp.focusObject.freefall && side & COLLIDES.TOP) {
        vp.lock(withObj.y+withObj.h);
      }
    };
  })(this));
};

Viewport.prototype.lock = function(atHeight) {
  this.lockHeight = atHeight - (this.outerHeight-64)/2;
};

Viewport.prototype.unlock = function() {
  this.lockHeight = null;
};

Viewport.prototype.update = function(dt) {
  if(this.focusObject && Math.abs(this.focusObject.dy) > 8000) {
    this.unlock();
  }

  if(this.lockHeight !== null && this.y !== this.lockHeight) {
    var direction = this.lockHeight - this.y;
    direction = direction/Math.abs(direction);
    this.y += (dt/1000) * direction * this.speed;

    if(Math.abs(this.y - this.lockHeight) < (dt/1000)*this.speed) {
      this.y = this.lockHeight;
    }
  }
  var boundOffset = ((this.outerWidth-64) / 2.0),
      offsetLeft = (this.x + boundOffset),
      offsetRight = (this.x + this.outerWidth - boundOffset);
  if(this.focusObject) {
    if(this.focusObject.x > offsetRight) {
      this.x += this.focusObject.x - offsetRight;
    } else if(this.focusObject.x < offsetLeft) {
      this.x += this.focusObject.x - offsetLeft;
    }
    if(this.lockHeight === null) {
      var boundOffset = ((this.outerHeight-64) / 2.0),
          offsetTop = this.y+this.outerHeight-boundOffset,
          offsetBottom = this.y+boundOffset;
      if(this.focusObject.y > offsetTop) {
        this.y += this.focusObject.y - offsetTop;
      } else if(this.focusObject.y < offsetBottom) {
        this.y += this.focusObject.y - offsetBottom;
      }
    }
  }
  this.x = this.x < 0 ? 0 : this.x;
};

Viewport.prototype.transform = function(attachment, coords) {
  if(attachment === FIXED) {
    return [coords[0], this.outerHeight - coords[1] - coords[3], coords[2], coords[3]];
  } else {
    return [coords[0] - this.x, this.outerHeight - coords[1] - coords[3] + this.y, coords[2], coords[3]];
  }
};

var Scene = function(canvas) {
  this.viewport = new Viewport(canvas.width, canvas.height);
  this.objects = [];
  this.leftCollisions = [];
  this.rightCollisions = [];
  this.topCollisions = [];
  this.bottomCollisions = [];

  game.events.addEventListener('tick', (function(scene) {
    return function(dt) {
      scene.objects.forEach(function(obj) {
        if(!obj.static) {
          obj.update(scene, dt);
        } else {
          obj.repr.update(dt);
        }
      });
    };
  })(this));
};

Scene.prototype.add = function(obj) {
  for(var i = 0, len = this.objects.length; i < len && obj.zIndex < this.objects[i].zIndex; ++i) {
    // wait for the return. 
  }
  if(i === len) {
    this.objects.unshift(obj);
  } else {
    this.objects.splice(i, 0, obj);
  }

  if(obj.collisions) {
    if(obj.collisions & COLLIDES.LEFT) {
      this.leftCollisions.push(obj);
    }
    if(obj.collisions & COLLIDES.RIGHT) {
      this.rightCollisions.push(obj);
    }
    if(obj.collisions & COLLIDES.TOP) {
      this.topCollisions.push(obj);
    }
    if(obj.collisions & COLLIDES.BOTTOM) {
      this.bottomCollisions.push(obj);
    }
  }
};

Scene.prototype.remove = function(obj) {
  this.objects.splice(this.objects.indexOf(obj), 1);
  if(obj.collisions & COLLIDES.LEFT) {
    this.leftCollisions.splice(this.leftCollisions.indexOf(obj));
  }
  if(obj.collisions & COLLIDES.RIGHT) {
    this.rightCollisions.splice(this.rightCollisions.indexOf(obj));
  }
  if(obj.collisions & COLLIDES.TOP) {
    this.topCollisions.splice(this.topCollisions.indexOf(obj));
  }
  if(obj.collisions & COLLIDES.BOTTOM) {
    this.bottomCollisions.splice(this.bottomCollisions.indexOf(obj));
  }
};

Scene.prototype.filter = function(mask, type) {
  if(type & COLLIDES.LEFT) {
    return this.leftCollisions.slice();
  }
  if(type & COLLIDES.RIGHT) {
    return this.rightCollisions.slice();
  }
  if(type & COLLIDES.TOP) {
    return this.topCollisions.slice();
  }
  if(type & COLLIDES.BOTTOM) {
    return this.bottomCollisions.slice();
  }
};

Scene.prototype.getFrameData = function(dt) {
  return this.objects.map(function(item) {
    var output = item.repr.getFrameData();

    var position = this.viewport.transform(item.attachment, [item.x, item.y, item.w, item.h]);
    return output.concat(position);
  }, this);
};

window.game.Scene = Scene;
window.game.SceneObject = SceneObject;
