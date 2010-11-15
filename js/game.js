window.loadGame = function() {
  var factory = new game.ResourceFactory(),
      canvas = document.getElementById('canvas'),
      scene = new Scene(canvas),
      renderer = new game.Renderer(canvas, scene),
      kb;

  game.events.addEventListener('resourcesLoaded', function() {
    game.loop();
  });

  var HERO_STAND = factory.require('sprites/stand.png'),
      BG = factory.require('sprites/sky.gif'),
      GROUND_TILE_MIDDLE = factory.require('sprites/tiles/ground_middle.gif'),
      GROUND_TILE_TOP = factory.require('sprites/tiles/ground_top.gif'),
      gfx = game.gfx;

  var sprite = gfx.Sprite({
    'forever': gfx.Moving(HERO_STAND, gfx.loop, {'duration':2000, 'frames':2}),
  });

  var ground_top = gfx.Sprite({
    'forever': gfx.Moving(GROUND_TILE_TOP, gfx.loop, {duration:Infinity})
  });

  var ground_middle = gfx.Sprite({
    'forever': gfx.Moving(GROUND_TILE_MIDDLE, gfx.loop, {duration:Infinity})
  });

  var background = gfx.Sprite({
      'forever': gfx.Moving(BG, gfx.loop, {'duration':100, 'frames':1})
  });

  background.start('forever');
  sprite.start('forever');
  ground_top.start('forever');
  ground_middle.start('forever');

  var sceneObject = new SceneObject(sprite);
  sceneObject.h = 64;
  sceneObject.w = 64;
  sceneObject.x = 0;
  sceneObject.y = 300;
  sceneObject.freefall = 1;
  sceneObject.gravity = 60;
  sceneObject.collisions = game.COLLIDES.ALL;
  scene.add(sceneObject);

  kb = new game.KeyboardController(sceneObject);
  scene.viewport.focus(sceneObject);

  for(var i = 0, len = 20; i < len; ++i) {
    var tile = new SceneObject(ground_top);
    tile.h = 64;
    tile.w = 64;
    tile.x = i * 64 - 1;
    tile.y = -16;
    tile.collisions = game.COLLIDES.TOP;
    tile.static = true;
    tile.zIndex = 1;
    scene.add(tile);
  }

  for(var i = 0, len = 20; i < len; ++i) {
    var tile = new SceneObject(ground_middle);
    tile.h = 64;
    tile.w = 64;
    tile.x = i * 64;
    tile.y = -64;
    tile.zIndex = 1;
    tile.collisions = game.COLLIDES.NONE;
    tile.static = true;
    scene.add(tile);
  }

  for(var i = 0, len=5; i < len; ++i) {
    var tile = new SceneObject(ground_top);
    tile.h = 64;
    tile.w = 64;
    tile.x = (400) + i * 64 - 1;
    tile.y = 128;
    tile.collisions = game.COLLIDES.TOP;
    tile.static = true;
    tile.zIndex = 0;
    scene.add(tile);

    var base = new SceneObject(ground_middle);
    base.h = 64;
    base.w = 64;
    base.x = (400) + i * 64 - 1;
    base.y = 96;
    base.collisions = game.COLLIDES.NONE;
    base.static = true;
    base.zIndex = 3;
    scene.add(base);

    var base2 = new SceneObject(ground_middle);
    base2.h = 64;
    base2.w = 64;
    base2.x = (400) + i * 64 - 1;
    base2.y = 32;
    base2.collisions = game.COLLIDES.NONE;
    base2.static = true;
    base2.zIndex = 3;
    scene.add(base2);

  }

  for(var i = 0, len=3; i < len; ++i) {
    var tile = new SceneObject(ground_top);
    tile.h = 64;
    tile.w = 64;
    tile.x = (1000) + i * 64 - 1;
    tile.y = 196;
    tile.collisions = game.COLLIDES.ALL;
    tile.static = true;
    tile.zIndex = 0;
    scene.add(tile);

    var base = new SceneObject(ground_middle);
    base.h = 64;
    base.w = 64;
    base.x = (1000) + i * 64 - 1;
    base.y = 196 - 64;
    base.collisions = game.COLLIDES.ALL;
    base.static = true;
    base.zIndex = 0;
    scene.add(base);

    var base2 = new SceneObject(ground_middle);
    base2.h = 64;
    base2.w = 64;
    base2.x = (1000) + i * 64 - 1;
    base2.y = 196 - 64 * 2;
    base2.collisions = game.COLLIDES.ALL;
    base2.static = true;
    base2.zIndex = 0;
    scene.add(base2);

  }

  var backgroundObj = new SceneObject(background);
  backgroundObj.attachment = 1;
  backgroundObj.h = 480;
  backgroundObj.w = 640;
  backgroundObj.y = 0;
  backgroundObj.x = 0;
  backgroundObj.dx = -0.01;
  backgroundObj.dy = -0.01;
  backgroundObj.zIndex = -1;
  backgroundObj.static = true;
  backgroundObj.collisions = game.COLLIDES.NONE;
  scene.add(backgroundObj);


  factory.setFrozen();
};
