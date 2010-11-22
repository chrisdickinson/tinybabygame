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
      HERO_STAND_LEFT = factory.require('sprites/stand_left.png'),
      HERO_JUMP_START_LEFT = factory.require('sprites/jump_start_left.png'),
      HERO_JUMP_START_RIGHT = factory.require('sprites/jump_start_right.png'),
      HERO_JUMP_LEFT = factory.require('sprites/jump_left.png'),
      HERO_JUMP_RIGHT = factory.require('sprites/jump_right.png'),
      HERO_RUN_RIGHT = factory.require('sprites/run_right.png'),
      HERO_RUN_LEFT = factory.require('sprites/run_left.png'),
      BG = factory.require('sprites/sky.gif'),
      GRASS_TILES = factory.require('sprites/tiles/grass.gif'),
      gfx = game.gfx;

  var layer0 = new TileLayer(GRASS_TILES, 64, [
    "    00000",
    "000013333",
    "133344444",
    "444444444",
    "444444444",
  ].join('\n'),[
    "    00000",
    "000054446",
    "544400000",
    "000000000",
    "000000000",
  ].join('\n'));

  var layer1 = new TileLayer(GRASS_TILES, 64, [
    "000000",
    "333332",
    "44445 ",
    "4445  ",
    "445   ",
    "45    ",
  ].join('\n'),[
    "000000",
    "444FFF",
    "00000 ",
    "0000  ",
    "000   ",
    "00    ",
  ].join('\n'));

  layer0.generateSceneObjects(2, -2, -64).forEach(function(obj) {
    scene.add(obj);
  });

  layer0.generateSceneObjects(3, 64*9-2, 64).forEach(function(obj) {
    scene.add(obj);
  });

  layer1.generateSceneObjects(4, 0, 128).forEach(function(obj) {
    scene.add(obj);
  });

  var sprite = gfx.Sprite({
    'forever': gfx.Moving(HERO_STAND, gfx.loop, {'duration':2000, 'frames':2}),
    'forever_left': gfx.Moving(HERO_STAND_LEFT, gfx.loop, {'duration':2000, 'frames':2}),
    'run_left': gfx.Moving(HERO_RUN_LEFT, gfx.loop, {'duration':100, 'frames':5}),
    'run_right': gfx.Moving(HERO_RUN_RIGHT, gfx.loop, {'duration':100, 'frames':5}),
    'jump_start_left': gfx.Moving(HERO_JUMP_START_LEFT, gfx.nextKey('jump_left'), {'duration':100, 'frames':2}),
    'jump_left': gfx.Moving(HERO_JUMP_LEFT, gfx.loop, {'duration':100, 'frames':1}),
    'jump_start_right': gfx.Moving(HERO_JUMP_START_RIGHT, gfx.nextKey('jump_right'), {'duration':100, 'frames':2}),
    'jump_right': gfx.Moving(HERO_JUMP_RIGHT, gfx.loop, {'duration':100, 'frames':1}),
  });

  var background = gfx.Sprite({
      'forever': gfx.Moving(BG, gfx.loop, {'duration':100, 'frames':1})
  });

  background.start('forever');
  sprite.start('forever');

  var sceneObject = new SceneObject(sprite);
  sceneObject.h = 64;
  sceneObject.w = 64;
  sceneObject.x = 0;
  sceneObject.y = 300;
  sceneObject.freefall = 1;
  sceneObject.gravity = 30;
  sceneObject.zIndex = -1;
  sceneObject.collisions = game.COLLIDES.ALL;
  scene.add(sceneObject);

  kb = new game.KeyboardController(sceneObject);
  scene.viewport.focus(sceneObject);

  var backgroundObj = new SceneObject(background);
  backgroundObj.attachment = 1;
  backgroundObj.h = 480;
  backgroundObj.w = 640;
  backgroundObj.y = 0;
  backgroundObj.x = 0;
  backgroundObj.dx = -0.01;
  backgroundObj.dy = -0.01;
  backgroundObj.zIndex = 1000;
  backgroundObj.static = true;
  backgroundObj.collisions = game.COLLIDES.NONE;
  scene.add(backgroundObj);


  factory.setFrozen();
};
