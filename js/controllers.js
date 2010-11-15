window.game = window.game || {};

var KeyboardController = function(obj) {
  this.obj = obj;
  this.jumpMax = 2;
  this.jumpCount = this.jumpMax;
  this.jumping = false;
  this.vector = [0, 0];

  document.addEventListener('keydown', (function(kb) {
    return function(ev) {
      kb.keyDown(ev);
    };
  })(this));

  document.addEventListener('keyup', (function(kb) {
    return function(ev) {
      kb.keyUp(ev);
    };
  })(this));

  this.obj.addEventListener('collision', (function(kb) {
    return function(withObj) {
      if(!kb.obj.freefall) {
        // reset the jump counter when we hit the ground
        kb.jumpStop({preventDefault:function(){}});
        kb.jumping = false;
        kb.jumpCount = kb.jumpMax;
        kb.landed = true;
      }
    };
  })(this));

  game.events.addEventListener('tick', (function(kb) {
    return function(dt) {
      kb.update(dt);
    };
  })(this));
};

KeyboardController.prototype.update = function(dt) {
  this._lastDY = this._lastDY || 0;
  if(this.jumping) {
    console.log('juuumping');
    this.obj.freefall = true;
    this.obj.y += 0.1;
    this.jumpCount -= (dt/1000) * 10;
  }
  if(this.obj.dy === this._lastDY && this._lastDY === 0) {
    this.jumpCount = this.jumpMax;
  }
  this._lastDY = this.obj.dy;
  this.obj.dx += (dt/1000) * this.vector[0];
  this.obj.dy += (dt/1000) * this.vector[1];

  this.obj.applyGravity = !(this.jumping && this.jumpCount > 0);

  this.vector[0] = this.vector[1] = 0;

};

KeyboardController.prototype.applyVector = function(vec) {
  this.vector[0] += vec[0];
  this.vector[1] += vec[1];
};

KeyboardController.prototype.jumpStart = function(ev) {
  console.log(this.jumpCount > 0.0);
  if(this.jumpCount > 0.0 || this.landed) {
    this.jumping = true;
    this.vector[1] = 20000;
  } else {
    console.log(this.jumpCount);
  }
  ev.preventDefault();
  this.landed = false;
};

KeyboardController.prototype.jumpStop = function(ev) {
  // zero the jump counter.
  this.jumpCount = 0;
  this.jumping = false;
  ev.preventDefault();
};

KeyboardController.prototype.leftStart = function(ev) {
  this.vector[0] = -30000;
  this.obj.dx = 0;
  ev.preventDefault();
};

KeyboardController.prototype.rightStart = function(ev) {
  this.vector[0] = 30000;
  this.obj.dx = 0;
  ev.preventDefault();
};

KeyboardController.prototype.leftStop = function(ev) {
  this.vector[0] = 0;
  this.obj.dx = 0;
  ev.preventDefault();
};

KeyboardController.prototype.rightStop = function(ev) {
  this.vector[0] = 0;
  this.obj.dx = 0;
  ev.preventDefault();
};

KeyboardController.prototype.keyDown = function(ev) {
  switch(ev.keyCode) {
    case 32:
      this.jumpStart(ev);
    break;
    case 65:
      this.leftStart(ev);
    break;
    case 68:
      this.rightStart(ev);
    break;
  }
};

KeyboardController.prototype.keyUp = function(ev) {
  switch(ev.keyCode) {
    case 32:
      this.jumpStop(ev);
    break;
    case 65:
      this.leftStop(ev);
    break;
    case 68:
      this.rightStop(ev);
    break;  
  }
};

game.KeyboardController = KeyboardController;
