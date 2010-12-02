*PLAY IF YOU DARE:*

                                             
    _/_/_/_/_/  _/_/_/  _/      _/  _/      _/   
       _/        _/    _/_/    _/    _/  _/      
      _/        _/    _/  _/  _/      _/         
     _/        _/    _/    _/_/      _/          
    _/      _/_/_/  _/      _/      _/           
                                                 
                                                 
                                                   
        _/_/_/      _/_/    _/_/_/    _/      _/   
       _/    _/  _/    _/  _/    _/    _/  _/      
      _/_/_/    _/_/_/_/  _/_/_/        _/         
     _/    _/  _/    _/  _/    _/      _/          
    _/_/_/    _/    _/  _/_/_/        _/           
                                                   
                                                   
                                                  
         _/_/_/    _/_/    _/      _/  _/_/_/_/   
      _/        _/    _/  _/_/  _/_/  _/          
     _/  _/_/  _/_/_/_/  _/  _/  _/  _/_/_/       
    _/    _/  _/    _/  _/      _/  _/            
     _/_/_/  _/    _/  _/      _/  _/_/_/_/       
                                                 


Installing and Playing
----------------------
Clone the repository, `cd` into it, run `python -m SimpleHTTPServer`. Open `http://localhost:8000/` in Chrome or Safari to be astounded by hyper realistic graphics,
and possibly blast processing. "WASD" moves you around, space jumps, and holding shift while moving makes the game impossible to play (by design, I assure you.)

![Tiny Baby Game The Game The Movie](http://neversaw.us/media/game.png)

An Exploration in Javascript, Canvas, and Teenaged Hopes & Dreams
================================================================

A few weekends ago, a [coworker and all around cool dude](http://charlesleifer.com/) started working on a platformer
in Javascript using canvas; I sort of jumped on the bandwagon and started building my own in a sort of pseudosprintish
fashion. This is what I've got so far. 

It's a simple game engine based around static tiles and animated sprites -- really, there are only about [two](https://github.com/chrisdickinson/tinybabygame/blob/master/js/renderer.js#L4)
[lines](https://github.com/chrisdickinson/tinybabygame/blob/master/js/renderer.js#L32) that actually touch the canvas API.
But man! It's all sorts of fun to hack on -- and sentimentally, this is the sort of code I first cut my teeth on as a wide-eyed
high schooler way back when. Of course, at that point I was using OpenGL, Win32, and C++ -- and I never got close to the point
that I'd actually want to show anyone what *that* looked like. But anyway, this is the sort of thing I always wanted to write,
but never had time for / never wanted to really delve into the lovely mess that is platform API code.

SENTIMENTALITY OVER
-------------------
Javascript is a wonderfully goopy language -- those lovely variadic first class functions make it equal parts hilariously fun
to write and treachorously easy to build an unmaintainable quagmire. Giving credit where credit's due: I would never have had
quite such a sterling opinion of the language were it not for Node.js finally shoving the wonderful EventEmitter pattern in my
face and saying, "LOOK! Look. This is how you Javascript." That, and it finally got me to sit down (in a nice, safe, REPL) and
work with the prototypical inheritance until it *made sense* to me.

With that in mind, this game engine makes heavy use of event emitters and listeners -- the most important lines of code in this
repository are, without a doubt, [the ones in events.js](https://github.com/chrisdickinson/tinybabygame/blob/master/js/events.js).
They give the entire program structure: both allowing me to dispatch global game events as well as the ability to turn any object
instance into an event emitter (by calling `game.events.emitter(MyGreatClass)`, all instances of `MyGreatClass` become individual
event emitters). This is super great, as the game is simply a consumer of various events (whether they be `tick` events or input events).

**Sidenote**: working this way finally made me realize how nice [NSTimer](http://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/NSTimer_Class/Reference/NSTimer.html)
is versus the way out of date tight infinite loops I used to cobble together in C++.

As a result, the main game logic loop can be summed up in the [following pittance of lines](https://github.com/chrisdickinson/tinybabygame/blob/master/js/loop.js):

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

Neat! Note that `Date.now` is not-at-all supported in IE, but whatever. I'm also being weird and sticking the last known time onto the
function object itself (the `arguments.callee._dt` bit). And I could probably replace the code entirely with a much nicer, more succinct
use of `setInterval`. Hindsight is 20/20, of course -- the important bit is that it works and that it's 8 fairly easy-to-understand lines
of code.

Now that we know how it spins, let's take a look at what's watching it spin:

The Renderer
------------
The `Renderer` object takes a canvas element and an instance of `Scene`, nabs the '2d' context off of the canvas, and sets itself up to listen
to `tick` events coming from the game loop. Otherwise, it [just does this](https://github.com/chrisdickinson/tinybabygame/blob/master/js/renderer.js):

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
        accum = 0;
      }
      try {
        for(var i = 0, len = items.length; i < len; ++i) {
          // item -> [img, sx, sy, sw, sh; dx, dy, dw, dh]
          this.context.drawImage.apply(this.context, items[i]);
        }
      }catch(err) { console.log(err); game.loop.quit = 1; }
    }; 

Counting the frames per second, grabbing "ready-to-be-rendered" array data from the scene, and calling drawImage as fast as it can. If it fails drawing
something, the game quits (and conveniently, this means that we'll see whatever half-baked thing it tried to render that killed it). That's it, that's
all, lock-stock-and-barrel. I somewhat foolishly declare that clearing the screen will be too expensive; it's really probably not, but when you get down to
it, it's wasted cycles (especially if you are just going to take your nice, blank screen and draw a potentially animated sky over the top of it). It would
only really matter in terms of fill-rate which I am fairly sure is not the bottleneck at the moment. Still, a speed hack. Part of the fun of game programming
is the fact that minor speed hacks like the aforementioned feel obvious and clever at the same time. Anyway.

The ResourceFactory also hangs out in this file. I had probably had too many beers when I wrote it -- I'll admit -- and I plopped it down someplace that it
makes no sense for it to be in. OH WELL. Believe me, I am making a mental grocery list of things which need "picked up" after I write this README.

The Scene
---------
The tragically hip part of the program. The Scene is our keeper-of-the-objects, the panopticon of the game. On initialization, it uses the canvas object
to construct a Viewport for itself (REFACTOR ME PLZ) which will represent, well, what we can see. It keeps any given object in several lists -- some explanations
follow:

<left|right|top|bottom>Collisions: In an earlier version, I used to use these lists to cull out the sheer number of other objects a given object could collide with.
This turned out not to be a great idea.

objects: The general-case list of objects. It's not strictly a must-have, but it's nice to have one place to go look when you absolutely *must* find something.

fpObjects: Fixed position objects. Objects can have one of two `position` attribute values: ABSOLUTE or FIXED -- similar to CSS. Fixed means that no matter where
the Viewport is located in space, the object will be drawn exactly x pixels by y pixels away from it. We can pretty much assume objects of this class will always
be visible.

dynObjects: Dynamic objects. Objects can also either be static or not. This tells us whether or not we should run collision detection on the object -- if it will
ever move over the space of a tick -- and if it happens to be static, we can shove it into our next lovely data structure...

quadtree: A QuadTree. It recursively subdivides space by four quadrants. The parameters `new game.QuadTree(43690, 32768, 8)` mean that the game world is 43690 pixels wide by
32768 tall, and that the box formed by the tree should subdivide eight times (giving us a leaf node size of 170x128). When we add static objects they are shoved as deeply
into the tree as they will go -- if an object does not fit in any a Node's four children, it will be added to that Node's potentially visible set.

For every call to [getFrameData](https://github.com/chrisdickinson/tinybabygame/blob/master/js/scene.js#L310) we go through these steps:

1. Grab the fixed position objects first.
2. Traverse the QuadTree with the Viewport -- tree traversal works by comparing radii of circumscribed boxes (quick, easy to code, no muss no fuss -- even if it does
require a `sqrt` call per box. *gulp*.) We pop back out of the traversal with a list of potentially visible objects.
3. Concatenate any and all dynamic objects (this is kind of dumb to do at this point and could be filtered more, but hey.)
4. Sort them (DOUBLE GULP, this should be removed.) Objects are given a zIndex by which they are sorted. Objects drawn first will be overlapped by objects drawn second;
so keeping things in the right order turns out to be very very important.
5. For each item, ask the scene object's Representation for the frame data comprising the [image, offsetIntoTheImageX, offsetIntoTheImageY, width, height]. Transform the item's
coordinates by the viewport, and return the resultant array to our loving Renderer instance.

So when I said "we're probably not limited by fill rate", I really meant it! We are iterating this list *three times* for each render call -- once with a potentially expensive
call to `sort`, and with a lot of extra overhead in the form of mathematical operations (`sqrt` is a killer.) This is a definite candidate for refactoring.

However, it works.

GFX / Sprite and Tiles
----------------------
TODO: Write something.

Controllers
-----------
TODO: Write Something.

The Resource Factory and Setting the Top Spinning
-------------------------------------------------
TODO: Write something really awesome hopefully.

LICENSE
-------
Licensed New BSD -- 

Please feel free to incorporate this code 
into your CMS, banking institution, social 
network, or attempt installing it on an 
Arduino board somehow. Nothing would make me happier. 
 
