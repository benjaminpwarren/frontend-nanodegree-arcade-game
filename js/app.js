'use strict';

/* global Resources, resources, tile, ctx, init */ //for JSHint

var Entity = function(options) {

    this.sprite = options.sprite;
    this.img = Resources.get(this.sprite);
    this.resource = resources[this.sprite];
    this.spriteOffsetY = Math.round(this.resource.feetCenterY - (tile.height / 2 + tile.topOffset));
    this.startTile = options.startTile;
    this.spawn();
};

// Set the entity start position based on startTile param or option.
Entity.prototype.spawn = function(startTile) {

    startTile = startTile || this.startTile;

    this.x = (startTile.col - 1) * tile.width;
    this.y = (startTile.row - 1) * tile.height - this.spriteOffsetY;
};

// Draw the entity on the screen
Entity.prototype.render = function() {
    ctx.drawImage(this.img, this.x, this.y);
};

// Helper methods

Entity.prototype.left = function() {
    return this.x;
};

Entity.prototype.right = function() {
    return this.x + this.img.width;
};

Entity.prototype.top = function() {
    return this.y;
};

Entity.prototype.bottom = function() {
    return this.y + this.img.height;
};

/* Get the resource's bounding box and apply to current position */
Entity.prototype.boundingBox = function() {

    var box = Object.assign({}, this.resource.boundingBox);

    box.left += this.x;
    box.top += this.y;
    box.right = box.left + box.width;
    box.bottom = box.top + box.height;

    return box;
};

// Enemies our player must avoid
var Enemy = function(options) {

    //set up a default options object so it's easy to create a player.
    var defaults = {
        sprite: 'images/enemy-bug.png',
        startTile: {
            col: -3 + getRandomInt(1, 3) / 2, //start the enemy on tile column -2, -1, or 0
            row: getRandomInt(2, 4) //start the enemy on a random tile row 2, 3, or 4
        }
    };

    //allow passed options parameters to be used, merging with and overwriting defaults
    options = Object.assign({}, defaults, options);

    //give the enemy one of three speeds: 1/2 base speed, base speed, or 1 1/2 base speed.
    var baseSpeed = 200;
    var speedFactor = getRandomInt(1, 3) / 2 - 1;
    this.speed = baseSpeed + baseSpeed * speedFactor;

    Entity.call(this, options);
};

Enemy.prototype = Object.create(Entity.prototype);

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.x = this.x + (this.speed * dt);

    /*When an enemy moves off the canvas, kill and recreate.

      Another way of doing this would be to just change the .x property but our
      constructor also generates a random speed and row (.y).
    */
    if (this.x > ctx.canvas.width) {
        allEnemies.splice(allEnemies.indexOf(this), 1);
        allEnemies.push(new Enemy());
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function(options) {

    //set up a default options object so it's easy to create a player.
    var defaults = {
        sprite: 'images/char-boy.png',
        lives: 5,
        points: 0,
        maxPoints: 10,
        startTile: {
            col: 3,
            row: 6
        }
    };

    //allow passed options parameters to be used, merging with and overwriting defaults
    options = Object.assign({}, defaults, options);

    this.lives = options.lives;
    this.points = options.points;
    this.maxPoints = options.maxPoints;

    Entity.call(this, options);
};

Player.prototype = Object.create(Entity.prototype);

// Update the player's position
Player.prototype.update = function() {

    if (this.dx) {
        this.x += this.dx;
        this.dx = 0;
    } else if (this.dy) {
        this.y += this.dy;
        this.dy = 0;
    }

};

//handles player input to move character, and reset.
Player.prototype.handleInput = function(key) {

    var xDistance = tile.width;
    var yDistance = tile.height;

    switch (key) {
        case 'left':
            this.dx = -xDistance;
            break;
        case 'up':
            this.dy = -yDistance;
            break;
        case 'right':
            this.dx = xDistance;
            break;
        case 'down':
            this.dy = yDistance;
            break;
        case 'y':
            /*pressing Y will reset the game, but we only want this to happen when the
              player has won or lost (game over).*/
            if (player.lives === 0 || player.points >= player.maxPoints) {
                init();
            }
            break;
    }
};

/* hud = Heads Up Display. This is for overlaying information and messages on the game
   canvas e.g. points, lives remaining, and win/game over messages.

   The internal drawLives and drawPoints functions use the associated player properties.

   The drawText method is a way of drawing generic text messages. Push your message
   objects to the exported textElements array and they'll be rendered. See the drawText
   function def defaults obj below for an example off how to define a message object.
*/
var hud = (function() {

    var canvas = document.createElement('canvas');
    canvas.width = window.ctx.canvas.width;
    canvas.height = window.ctx.canvas.height;
    canvas.style.backgroundColor = 'transparent';

    var ctx = canvas.getContext('2d');

    document.getElementById('wall').appendChild(canvas);

    var textElements = [];

    /* Draw text on the screen with the options provided by the caller or using the
       defaults. Desired position is specified using 'top center' or 'center right', etc.
       Text will be 'top center' unless specified. */
    function drawText(options) {

        var defaults = {
            text: '',
            lineWidth: 1,
            fillStyle: 'white',
            strokeStyle: 'black',
            font: '24pt \'Arial\'',
            position: 'top center',
            padding: '3'
        };

        var opts = Object.assign({}, defaults, options);
        opts.position = opts.position.toLowerCase();

        ctx.font = opts.font;
        ctx.lineWidth = opts.lineWidth;
        ctx.fillStyle = opts.fillStyle;
        ctx.strokeStyle = opts.strokeStyle;

        var positionMatches = /(top|center|bottom)?\s?(left|center|right)?/.exec(opts.position);

        //assume center if horizontal or vertical not provided.
        positionMatches[1] = positionMatches[1] ? positionMatches[1] : 'center';
        positionMatches[2] = positionMatches[2] ? positionMatches[2] : 'center';

        var position = {
            x: opts.padding,
            y: opts.padding
        };

        ctx.textBaseline = positionMatches[1];

        switch (positionMatches[1]) {
            case 'top':
                position.y += tile.topOffset + opts.padding;
                break;
            case 'center':
                position.y = ctx.canvas.height / 2 + tile.topOffset + opts.padding;
                break;
            case 'bottom':
                position.y = ctx.canvas.height - opts.padding;
                break;
        }

        ctx.textAlign = positionMatches[2];

        switch (positionMatches[2]) {
            case 'left':
                position.x = opts.padding;
                break;
            case 'center':
                position.x = ctx.canvas.width / 2;
                break;
            case 'right':
                position.x = ctx.canvas.width;
                break;
        }

        ctx.fillText(opts.text, position.x, position.y);
        ctx.strokeText(opts.text, position.x, position.y);
    }

    // Draws the player's remaining lives
    var drawLives = function() {
        var lifeImage = Resources.get('images/Heart-small.png');

        for (var i = 0; i < player.lives; i++) {
            ctx.drawImage(lifeImage, ctx.canvas.width - (lifeImage.width + 5) * (i + 1), 5);
        }
    };

    // Draws the maximum possible points and the player's current score
    var drawPoints = function() {
        var pointSpaceImage = Resources.get('images/Gem Orange outline-small.png');

        for (var i = 0; i < player.maxPoints; i++) {
            ctx.drawImage(pointSpaceImage, (pointSpaceImage.width + 5) * i, 2);
        }

        var pointImage = Resources.get('images/Gem Orange-small.png');

        for (i = 0; i < player.points; i++) {
            ctx.drawImage(pointImage, (pointImage.width + 5) * i, 2);
        }
    };

    function render() {

        //clear hud
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawLives();
        drawPoints();

        textElements.forEach(function(options) {
            drawText(options);
        });
    }

    return {
        render: render,
        textElements: textElements
    };
})();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

/*
   Doing it this way as we need to wait for the resources to load before instantiating
   our objects as our objects use properties such as the width and height of the
   sprites.
*/
var allEnemies = [];
var player = [];

//DEV - draw bounding box border //TODO remove.
/*
function drawBoxBorder(box, borderColor) {
    borderColor = borderColor || '#000';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.left, box.top, box.width, box.height);
}
*/

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*The below is a polyfill for the Object.assign function.

  Object.assign allows us to merge two objects. It's like the jQuery .extend function.

  It's used here to override default options objects with options objects that might be
  passed to a constructor or method.

  For a full explanation of Object.assign, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
*/
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}