window.game = window.game || {};

var Quad = function(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.centerY = h * 0.5 + y;
  this.centerX = w * 0.5 + x;
  this.radius = Math.sqrt(h*h + w*w);

  this.children = [];
  this.nodes = [null, null, null, null];
};

Quad.prototype.visible = function(x, y, r) {
  // oh jesus a sqrt per node.
  var vx = this.centerX-x,
      vy = this.centerY-y,
      dist = Math.sqrt(vx*vx+vy*vy);

  return (dist < (r+this.radius));
};

Quad.prototype.fit = function(obj) {
  return (obj.w < this.w && obj.h < this.h) && 
         (obj.x >= this.x && obj.y >= this.y) && 
         (obj.w+obj.x < this.x+this.w && obj.h+obj.y < this.y+this.h);
};

Quad.prototype.place = function(obj) {
  for(var i = 0; i < 4; ++i) {
    if(this.nodes[i] && this.nodes[i].fit(obj)) {
      this.nodes[i].place(obj);
      return;
    }
  }
  if(this.fit(obj)) {
    this.children.push(obj);
  }
};

Quad.prototype.divide = function(lvl) {
  if(lvl < 1) return;
  var hx = this.w*0.5,
      hy = this.h*0.5;

  this.nodes[0] = new Quad(this.x, this.y, hx, hy);
  this.nodes[1] = new Quad(this.x+hx, this.y, hx, hy);
  this.nodes[2] = new Quad(this.x+hx, this.y+hy, hx, hy);
  this.nodes[3] = new Quad(this.x, this.y+hy, hx, hy);

  this.nodes.forEach(function(node) {
    node.divide(lvl - 1);
  });
};

Quad.prototype.traverse = function(circle) {
  var pvs = [];
  for(var i = 0; i < 4; ++i) {
    if(this.nodes[i] && this.nodes[i].visible.apply(this.nodes[i], circle)) {
      pvs = pvs.concat(this.nodes[i].traverse(circle));
    } 
  }
  pvs = pvs.concat(this.children);
  return pvs;
};

var QuadTree = function(maxWidth, maxHeight, levels) {
  this.rootNode = new Quad(-64, -64, maxWidth, maxHeight);
  this.rootNode.divide(levels);
};

window.game.QuadTree = QuadTree;
