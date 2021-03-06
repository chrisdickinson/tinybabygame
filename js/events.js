window.game = window.game || {};

var EventEmitter = function() {
  this.listeners = {};
};

EventEmitter.prototype.dispatchEvent = function(name) {
  var args = Array.prototype.slice.call(arguments, 1);
  if(this.listeners[name]) {
    this.listeners[name].forEach(function(cb) {
      try {
        cb.apply(this, args);
      } catch(err) {console.log(err.stack); }
    });
  }
};

EventEmitter.prototype.addEventListener = function(name, callback) {
  this.listeners[name] = this.listeners[name] || [];
  this.listeners[name].push(callback);
};

EventEmitter.prototype.emitter = function(klass) {
  var F = function() {};
  F.prototype = EventEmitter.prototype;
  klass.prototype = new F();
};

window.game.events = new EventEmitter();
