window.game = window.game || {};
var gfx = {};

var Animation = function(sprite, name, resource, strategy, options) {
  this.sprite = sprite;
  this.name = name;
  this.resource = resource;
  this.strategy = strategy;
  this.frames = options.frames || 1;
  this.duration = options.duration || Infinity;
};

Animation.prototype.getFrameData = function(at) {
  var frameWidth = ~~(this.resource.img.width / this.frames);
  return [this.resource.img, at*frameWidth, 0, frameWidth, this.resource.img.height]; 
};

Animation.prototype.sliceFrames = function() {
  this.height = this.resource.img.height;
  this.width = ~~(this.resource.img.width / this.frames);
};

gfx.Static = gfx.Moving = function(resource, strategy, options) {
  return function(sprite, name) {
    var frame = new Animation(sprite, name, resource, strategy, options || {});
    resource.addEventListener('ready', function() {
      frame.sliceFrames();
    });
    return frame;
  };
};

gfx.loop = {};
gfx.loop.start = function() {
  this.state.counter = this.state.duration;
};
gfx.loop.update = function(dt) {
  this.state.counter -= dt;
  while(this.state.counter < 0) {
    ++this.state.frame;
    this.state.counter = this.state.duration + this.state.counter;
  }
};
gfx.loop.finish = function() {
  while(this.state.frame >= this.state.frames) {
    this.state.frame -= this.state.frames;
  }
};

gfx.nextKey = function(keyName) {
  var next = {};
  next.start = gfx.loop.start;
  next.update = gfx.loop.update; 
  next.finish = function() {
    this.start(keyName);
  };
  return next;
};

gfx.interrupt = {};
gfx.interrupt.start = function() {
  this._previousState = Object.create(this.state);
  this._previousAnim = this.currentAnimation;
};

gfx.interrupt.update = gfx.loop.update;
gfx.interrupt.finish = function() {
  this.start(this._previousAnim, Object.create(this._previousState));
  this._previousAnim = this._previousState = null;
};

gfx.SpriteObject = function() {
  this.state = {};
};

gfx.SpriteObject.prototype.getFrameData = function() {
  return this.animations[this.currentAnimation].getFrameData(this.state.frame);
};

gfx.SpriteObject.prototype.start = function(anim, atState) {
  this.currentAnimation = anim;
  this.state = atState || {
    frames:this.animations[anim].frames,
    duration:this.animations[anim].duration,
    frame:0,
    counter:this.animations[anim].duration
  };
  this.animations[this.currentAnimation].strategy.start.apply(this);
};

gfx.SpriteObject.prototype.update = function(dt) {
  this.animations[this.currentAnimation].strategy.update.apply(this, [dt]);
  if(this.state.frame >= this.state.frames) {
    this.animations[this.currentAnimation].strategy.finish.apply(this, [dt]);
  }
};

gfx.Sprite = function(options) {
  var obj = new gfx.SpriteObject(),
      animations = {};

  Object.keys(options).forEach(function(key) {
    animations[key] = options[key](obj, key); 
  });

  obj.animations = animations;

  return obj;
};

window.game.gfx = gfx;
