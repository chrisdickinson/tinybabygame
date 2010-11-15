window.game = window.game || {};

game.loop = function() {
  var now = Date.now();
  arguments.callee._dt = arguments.callee._dt || Date.now();
  dt = now - arguments.callee._dt;
  game.events.dispatchEvent('tick', dt+1);
  arguments.callee._dt = now;
  if(!arguments.callee.quit) {
    setTimeout(arguments.callee, 0);
  }
};
