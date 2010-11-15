window.loadGame = function() {
  var factory = new game.ResourceFactory(),
      canvas = document.getElementById('canvas'),
      scene = new Scene(canvas),
      renderer = new game.Renderer(canvas, scene),
      kb;

  game.events.addEventListener('resourcesLoaded', function() {
    game.loop();
  });

  var BASIC = factory.require('http://www.google.com/images/srpr/nav_logo25.png'),
      CHARLIE = factory.require('http://i.imgur.com/u06ex.jpg'),
      BG = factory.require('http://i.imgur.com/u06ex.jpg'),
      gfx = game.gfx;

  var sprite = gfx.Sprite({
    'forever': gfx.Moving(BASIC, gfx.nextKey('test'), {'duration':200, 'frames':1}),
    'test': gfx.Moving(CHARLIE, gfx.nextKey('forever'), {'duration':50, 'frames':10})
  });

  var background = gfx.Sprite({
      'forever': gfx.Moving(BG, gfx.loop, {'duration':100, 'frames':1})
  });

  background.start('forever');
  sprite.start('forever');

  var sceneObject = new SceneObject(sprite);
  sceneObject.h = 70;
  sceneObject.w = 30;
  sceneObject.x = 0;
  sceneObject.y = 300;
  sceneObject.freefall = 1;
  sceneObject.gravity = 98;
  sceneObject.collisions = game.COLLIDES.ALL;
  scene.add(sceneObject);

  kb = new game.KeyboardController(sceneObject);
  scene.viewport.focus(sceneObject);

  var sceneObject2 = new SceneObject(sprite);
  sceneObject2.h = 100;
  sceneObject2.w = 600;
  sceneObject2.x = 0;
  sceneObject2.y = 100;
  sceneObject2.collisions = game.COLLIDES.ALL;
  scene.add(sceneObject2);

  var sceneObject3 = new SceneObject(background);
  sceneObject3.attachment = 1;
  sceneObject3.h = 1000;
  sceneObject3.w = 1000;
  sceneObject3.y = 80;
  sceneObject3.dx = -0.01;
  sceneObject3.dy = -0.01;
  sceneObject3.zIndex = -1;
  sceneObject3.collisions = game.COLLIDES.NONE;
  scene.add(sceneObject3);

  factory.setFrozen();
};
