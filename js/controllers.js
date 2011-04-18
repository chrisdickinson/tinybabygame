window.game = window.game || {};

var KeyboardController = function(obj) {
  this.obj = obj;
  this.jumpMax = 0.4;
  this.jumpCount = this.jumpMax;

  this.jumpDown = false;
  this.leftDown = false;
  this.rightDown = false;
  this.shiftDown = false;

  document.addEventListener('keydown', (function(kb) {
    return function(ev) {
      kb.keyDown(ev);
    };
  })(this), true);

  document.addEventListener('keyup', (function(kb) {
    return function(ev) {
      kb.keyUp(ev);
    };
  })(this), true);

  this.obj.addEventListener('collision', (function(kb) {
    return function(withObj, side) {
      if(side & game.COLLIDES.TOP) {
        // reset the jump counter when we hit the ground
        kb.jumpCount = kb.jumpMax;
        if(kb.obj.repr.is('jump_left') || kb.obj.repr.is('jump_right')) {
          kb.obj.repr.start(kb.obj.dx < 0.0 ? 'forever_left' : 'forever'); 
        }
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

  if(this.leftDown) {
    this.obj.dx -= 10 * (this.shiftDown ? 2 : 1);
  } else if(this.rightDown) {
    this.obj.dx += 10 * (this.shiftDown ? 2 : 1);
  } else if(!this.obj.freefall) {
    this.obj.dx = 0;
  }

  if(this.jumpDown && this.jumpCount > 0) {
    this.obj.dy += 200 * this.jumpCount / 1.0;
    this.obj.freefall = true;
    this.jumpCount -= (dt/1000);
  }
};

KeyboardController.prototype.jumpStart = function(ev) {
  if(!this.obj.freefall) {
    this.dx *= 0.5;
    console.log('uhh');
    if(this.obj.repr.is('forever_left') || this.obj.repr.is('run_left')) {
      this.obj.repr.start('jump_start_left');
    } else {
      this.obj.repr.start('jump_start_right');
    }
  this.jumpDown = true;
  }
};

KeyboardController.prototype.jumpStop = function(ev) {
  // zero the jump counter.
  this.jumpCount = 0;
  this.jumpDown = false;
  ev.preventDefault();
};

KeyboardController.prototype.leftStart = function(ev) {
  if(!this.leftDown && !this.obj.freefall) {
    this.obj.repr.start('run_left');
  }
  this.leftDown = true;
  ev.preventDefault();
};

KeyboardController.prototype.rightStart = function(ev) {
  if(!this.rightDown && !this.obj.freefall) {
    this.obj.repr.start('run_right');
  }
  this.rightDown = true;
  ev.preventDefault();
};

KeyboardController.prototype.leftStop = function(ev) {
  if(!this.rightDown && !this.obj.freefall) {
    this.obj.repr.start('forever_left');
  }
  this.leftDown = false;
  ev.preventDefault();
};

KeyboardController.prototype.rightStop = function(ev) {
  if(!this.leftDown && !this.obj.freefall) {
    this.obj.repr.start('forever');
  }
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
