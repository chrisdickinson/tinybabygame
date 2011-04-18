window.game = window.game || {};

var dt = null,
    now,
    change;

var timeouts = [];
window.addEventListener('message', function(ev) {
  if(ev.source === window && ev.data === 'zero-interval') {
    ev.stopPropagation();
    for(var i = 0, len = timeouts.length; i < len; ++i)
      timeouts[i]();
    window.postMessage('zero-interval', '*');
  }
}, true);
window.postMessage('zero-interval', '*');

var setZeroInterval = function(fn) {
  return timeouts.push(fn);
};

var clearZeroInterval = function(i) {
  return timeouts.splice(i, 1);
};

game.loop = function() {
  dt = Date.now();
  setZeroInterval(function() {
      now = Date.now();
      change = now - dt;
      game.events.dispatchEvent('tick', change);
      dt = now;
  }, 1);

  /*
  var now = Date.now();
  arguments.callee._dt = arguments.callee._dt || Date.now();
  dt = now - arguments.callee._dt;
  game.events.dispatchEvent('tick', dt+1);
  arguments.callee._dt = now;
  if(!arguments.callee.quit) {
    setTimeout(arguments.callee, 0);
  }*/
};
