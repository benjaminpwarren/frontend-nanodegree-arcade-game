'use strict';

/* global Resources, resources, tile, ctx */

var Entity = function(options) {

    this.sprite = options.sprite;
    this.img = Resources.get(this.sprite);
    this.resource = resources[this.sprite];

    this.baseSpeed = 200;
};

Entity.prototype.spawn = function(startTile) {

    startTile = startTile || this.options.startTile;

    var spriteOffsetY = this.resource.feetCenterY - (tile.height / 2 + tile.topOffset);
    this.x = (startTile.col - 1) * tile.width;
    this.y = (startTile.row - 1) * tile.height - Math.round(spriteOffsetY);
};

// Draw the entity on the screen
Entity.prototype.render = function() {
    ctx.drawImage(this.img, this.x, this.y);
};

// Enemies our player must avoid
var Enemy = function(options) {

    var defaults = {
        sprite: 'images/enemy-bug.png',
        startTile: {
            col: -3 + getRandomInt(1, 3) / 2, //start the enemy on tile -2, -1, or 0
            row: getRandomInt(2, 4)
        }
    };

    this.options = Object.assign({}, defaults, options);

    Entity.call(this, this.options);

    //give the enemy one of three speeds: 1/2 base speed, base speed, or 1 1/2 base speed.
    var speedFactor = getRandomInt(1, 3) / 2 - 1;
    this.speed = this.baseSpeed + this.baseSpeed * speedFactor;

    this.startTile = this.options.startTile;

    this.spawn();
};

Enemy.prototype = Object.create(Entity.prototype);

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.x = this.x + (this.speed * dt);

    if (this.x > ctx.canvas.width) {
        allEnemies.splice(allEnemies.indexOf(this), 1);
        allEnemies.push(new Enemy());
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function(options) {

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

    this.options = Object.assign({}, defaults, options);

    Entity.call(this, this.options);

    this.lives = this.options.lives;
    this.points = this.options.points;
    this.maxPoints = this.options.maxPoints;
    this.startTile = this.options.startTile;

    this.spawn();
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

//handles player input to move character etc.
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
    }
};

/* hud = Heads Up Display. Allows information and messages to be overlayed on the game
   canvas e.g. points, lives remaining, and win/game over messages. */

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

        var positionMatches = /(left|center|right)?\s?(top|center|bottom)?/.exec(opts.position);

        //assume center if horizontal or vertical not provided.
        positionMatches[1] = positionMatches[1] ? positionMatches[1] : 'center';
        positionMatches[2] = positionMatches[2] ? positionMatches[2] : 'center';

        var position = {
            x: opts.padding,
            y: opts.padding
        };

        ctx.textAlign = positionMatches[1];

        switch (positionMatches[1]) {
            case 'left':
                break;
            case 'center':
                position.x = ctx.canvas.width / 2;
                break;
            case 'right':
                position.x = ctx.canvas.width - opts.padding;
                break;
        }

        ctx.textBaseline = positionMatches[2];

        switch (positionMatches[1]) {
            case 'top':
                position.y += tile.topOffset;
                break;
            case 'center':
                position.y = ctx.canvas.height / 2 + tile.topOffset;
                break;
            case 'bottom':
                position.y = ctx.canvas.height - opts.padding;

                break;
        }

        ctx.fillText(opts.text, position.x, position.y);
        ctx.strokeText(opts.text, position.x, position.y);
    }

    var drawLives = function() {
        var lifeImage = Resources.get('images/Heart-small.png');

        for (var i = 0; i < player.lives; i++) {
            ctx.drawImage(lifeImage, ctx.canvas.width - (lifeImage.width + 5) * (i + 1), 5);
        }
    };

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

// Shells and stubs so Engine Update and Render calls don't fail.
/* Doing it this way as we need to wait for the resources to load before instantiating
   our objects as our objects use properties such as the width and height of the sprites
*/
var allEnemies = [];
var player = [];
player.update = function() {};
player.render = function() {};

Resources.onReady(function() {

    allEnemies.push(new Enemy());
    allEnemies.push(new Enemy());
    allEnemies.push(new Enemy());
    allEnemies.push(new Enemy());

    player = new Player();

    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don't need to modify this.
    document.addEventListener('keyup', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        player.handleInput(allowedKeys[e.keyCode]);
    });
});

function isNumber(n) {
    return n === parseFloat(n);
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//assign polyfill so we can 'merge' ojects
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