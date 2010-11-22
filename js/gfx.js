window.game = window.game || {};
var gfx = {};

var TileLayer = function(resource, hw, map, collisionMap) {
  this.resource = resource;
  this.tileWidth = hw;
  this.map = map.replace(/\n/g,'').split('');
  this.collisionMap = collisionMap.replace(/\n/g,'').split('');
  this.mapRowLength = map.split('\n')[0].length;
};

TileLayer.prototype.update = function() { /* noop */ };

TileLayer.prototype.getFrameData = function(tile) {
  if(tile.tileData) {
    return tile.tileData;
  }

  var tileNo = tile.tileNo,
      width = this.resource.img.width,
      tilesPerRow = width/this.tileWidth,
      offsetY = ~~((this.tileWidth * tileNo) / width),
      offsetX = tileNo - (offsetY * tilesPerRow);

  tile.tileData = [this.resource.img, offsetX*this.tileWidth, offsetY*this.tileWidth, this.tileWidth, this.tileWidth]; 
  return tile.tileData;
};

TileLayer.prototype.generateSceneObjects = function(zIndex, offsetX, offsetY) {
  offsetX = offsetX || 0;
  offsetY = offsetY || 0;

  var x = 0,
      y = this.map.length/this.mapRowLength * this.tileWidth,
      w = this.tileWidth,
      tile,
      obj,
      objects = [];
  for(var i = 0, len = this.map.length; i < len; ++i) {
    x += this.tileWidth;
    if(i % this.mapRowLength === 0) {
      y -= this.tileWidth;
      x = 0;
    }
    tile = this.map[i];

    if(tile === ' ') continue;

    tile = +tile;     // coerce to number.
    obj = new SceneObject(this);
    obj.h = obj.w = w;
    obj.x = x + offsetX;
    obj.y = y + offsetY;
    obj.collisions = parseInt(this.collisionMap[i], 16); 
    obj.static = true;
    obj.zIndex = zIndex;
    obj.attachment = game.ABSOLUTE;
    obj.tileNo = tile;

    objects.push(obj);
  }
  return objects;
};

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

gfx.SpriteObject.prototype.is = function(anim) {
  return this.currentAnimation === anim;
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

gfx.TileLayer = TileLayer;
window.game.gfx = gfx;
