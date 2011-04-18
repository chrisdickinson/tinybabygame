
var Renderer = function(canvas, scene) {
  this.canvas = canvas;
  this.scene = scene;
  this.context = this.canvas.getContext('2d');
  this.context.fillStyle = 'white';
  this.context.font         = 'bold 12px sans-serif';
  game.events.addEventListener('tick', (function(renderer) {
    return function(dt) {
      renderer.render(dt);
    };
  })(this));
};

var accum = 0,
    frames = 0;

window.fps = 0;

Renderer.prototype.render = function(dt) {
  var items = this.scene.getFrameData(dt);
  // number ONE thing to avoid: clearing the canvas
  // -- just draw the background over the top.
  ++frames;
  accum += dt;

  if(accum > 1000) {
    window.fps = frames;
    frames = 0;
    while(accum > 1000) accum -= 1000;
  }

  var drawImage = this.context.drawImage;
  try {
    for(var i = 0, len = items.length; i < len; ++i) {
      // item -> [img, sx, sy, sw, sh; dx, dy, dw, dh]
      var item = items[i];
      drawImage.call(this.context, item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8]);
    }
    this.context.fillText(''+fps+' : '+mode+' : '+skips+' skips', 20, 20);
  }catch(err) { console.log(err.stack); game.loop.quit = 1; }
}; 

var ResourceFactory = function() {
  var Resource = function(src) {
    this.img = new Image();
    this.listeners = {};
    this.img.src = src;
    this.img.onload = (function(resource) {
      return function() {
        game.events.dispatchEvent('resourceReady', resource);
        resource.dispatchEvent('ready', this);
      };
    })(this);
  };

  game.events.emitter(Resource);
  this.pending = [];
  this.require = function(src) {
    var resource = new Resource(src);
    this.pending.push(resource);
    return resource;
  };
  this.setFrozen = function(callback) {
    this.frozen = true;
  };
  game.events.addEventListener('resourceReady', (function(factory) {
    return function(resource) {
      factory.pending.splice(factory.pending.indexOf(resource), 1);
      if(factory.frozen && !factory.pending.length) {
        factory.frozen = false;
        game.events.dispatchEvent('resourcesLoaded', factory);
      }
    };
  })(this));
};

window.game.ResourceFactory = ResourceFactory;
window.game.Renderer = Renderer;

/*
HERO_WALK = factory.require('img/hero/walk.png');
HERO_STAND = factory.require('img/hero/stand.png');
HERO_START_JUMP = factory.require('img/hero/start_jump.png');
HERO_JUMP = factory.require('img/hero/jump.png');
HERO_FALL = factory.require('img/hero/fall.png');
HERO_LAND = factory.require('img/hero/land.png');

var HeroSprite = gfx.Sprite({
  'standing': gfx.Static(HERO_STAND, gfx.loop, {'duration':Infinity}),
  'walking':  gfx.Moving(HERO_WALK, gfx.loop, {'frames':6, 'duration':30}),
  'jumping':  gfx.Moving(HERO_START_JUMP, gfx.nextKey('jump'), {'frames':3, 'duration':10}),
  'jump':     gfx.Static(HERO_JUMP, gfx.nextKey('fall'), {'duration':300}),
  'fall':     gfx.Static(HERO_FALL, gfx.nextKey('land'), {'duration':Infinity}),
  'land':     gfx.Moving(HERO_LAND, gfx.nextKey('standing'), {'duration':30, 'frames':3}),
  'damage':   gfx.Moving(HERO_DAMAGE, gfx.interrupt, {'duration':30, 'frames':6}),
});

this.sprite.start('walking');*/
