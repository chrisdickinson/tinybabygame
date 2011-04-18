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

    if(mode === 'setZeroInterval')
      window.postMessage('zero-interval', '*');
  }
}, true);

//window.postMessage('zero-interval', '*');

var setZeroInterval = function(fn) {
  return timeouts.push(fn);
};

var clearZeroInterval = function(i) {
  return timeouts.splice(i, 1);
};

mode = 'setInterval';
skips = 0;
var interval;

document.addEventListener('keydown', function(ev) {
  if(ev.keyCode === 192) {
    if(mode === 'setInterval') mode = 'setZeroInterval';
    else mode = 'setInterval';
  }
}, true);

game.loop = function() {
  dt = Date.now();
  var lastMode = mode;
  interval = window[mode](function it() {
      if(mode !== lastMode) {
        lastMode === 'setZeroInterval' ? clearZeroInterval(interval) : clearInterval(interval);
        lastMode = mode;

        interval = window[mode](it);
        mode === 'setZeroInterval' && window.postMessage('zero-interval', '*');
        return;
      }
      lastMode = mode;
      now = Date.now();
      change = now - dt;
      if(change < 15) {
        ++skips;
        return; 
      }
      game.events.dispatchEvent('tick', change);

      skips = 0;
      dt = now;
  });

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
