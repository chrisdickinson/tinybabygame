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

  var layer0 = new TileLayer(GROUND_TILE_MIDDLE, 64, [
    "    00000",
    "000000000",
    "000000000",
    "000000000",
  ].join('\n'),[
    "    54446",
    "544400000",
    "000000000",
    "000000000",
  ].join('\n'));

  var layer1 = new TileLayer(GROUND_TILE_TOP, 64, [
    "000000",
    "000   ",
    "00    ",
    "00    ",
    "00    ",
  ].join('\n'),[
    "444FFF",
    "000   ",
    "00    ",
    "00    ",
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
