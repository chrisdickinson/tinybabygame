window.game = window.game || {};

var KeyboardController = function(obj) {
  this.obj = obj;
  this.jumpMax = 0.15;
  this.jumpCount = this.jumpMax;

  this.jumpDown = false;
  this.leftDown = false;
  this.rightDown = false;
  this.shiftDown = false;

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
    return function(withObj, side) {
      if(side & game.COLLIDES.TOP) {
        // reset the jump counter when we hit the ground
        kb.jumpCount = kb.jumpMax;
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

  if(this.jumpDown && this.jumpCount > 0) {
    this.obj.dy += 150;
    this.obj.freefall = true;
    this.jumpCount -= (dt/1000);
  }

  if(this.leftDown) {
    this.obj.dx = -400 * (this.shiftDown ? 2 : 1);
  } else if(this.rightDown) {
    this.obj.dx = 400 * (this.shiftDown ? 2 : 1);
  } else {
    this.obj.dx = 0;
  }
};

KeyboardController.prototype.jumpStart = function(ev) {
  this.jumpDown = true;
};

KeyboardController.prototype.jumpStop = function(ev) {
  // zero the jump counter.
  this.jumpCount = 0;
  this.jumpDown = false;
  ev.preventDefault();
};

KeyboardController.prototype.leftStart = function(ev) {
  this.leftDown = true;
  ev.preventDefault();
};

KeyboardController.prototype.rightStart = function(ev) {
  this.rightDown = true;
  ev.preventDefault();
};

KeyboardController.prototype.leftStop = function(ev) {
  this.leftDown = false;
  ev.preventDefault();
};

KeyboardController.prototype.rightStop = function(ev) {
  this.rightDown = false;
  ev.preventDefault();
};

KeyboardController.prototype.shiftStart = function(ev) {
  this.shiftDown = true;
  ev.preventDefault();
};

KeyboardController.prototype.shiftStop = function(ev) {
  this.shiftDown = false;
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
    case 16:
      this.shiftStart(ev);
    break;
  }
};

KeyboardController.prototype.keyUp = function(ev) {
  switch(ev.keyCode) {
    case 16:
        this.shiftStop(ev);
    break;
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
