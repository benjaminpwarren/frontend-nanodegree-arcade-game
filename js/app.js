'use strict';
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.img = Resources.get(this.sprite);
    this.resource = resources[this.sprite];

    var baseSpeed = 200;
    //give the enemy one of three speeds: 1/2 base speed, base speed, or 1 1/2 base speed.
    var speedFactor = getRandomInt(1, 3) / 2 - 1;
    this.speed = baseSpeed + baseSpeed * speedFactor;

    this.enemyNum = allEnemies.length + 1;

    var startTile = {
        col: -3 + getRandomInt(1, 3) / 2, //start the enemy on tile -2, -1, or 0
        row: this.enemyNum + 1
    };

    var spriteOffsetY = this.resource.feetCenterY - (tile.height / 2 + tile.topOffset);
    this.x = (startTile.col - 1) * tile.width;
    this.y = (startTile.row - 1) * tile.height - spriteOffsetY;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    this.x = this.x + (this.speed * dt);
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {

    ctx.drawImage(this.img, this.x, this.y);

    //border for testing
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.img.width, this.img.height);

};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

/* TODO: refactor Player and Enemy to use same parent class? Their constructors are
   virtually identical. As are their render functions.*/
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.img = Resources.get(this.sprite);
    this.resource = resources[this.sprite];

    var startTile = {
        col: 3,
        row: 6
    };

    var spriteOffsetY = this.resource.feetCenterY - (tile.height / 2 + tile.topOffset);
    this.x = (startTile.col - 1) * tile.width;
    this.y = (startTile.row - 1) * tile.height - spriteOffsetY;

};

Player.prototype.update = function(dt) {

    if (this.dx) {
        this.x += this.dx;
        this.dx = 0;
    } else if (this.dy) {
        this.y += this.dy;
        this.dy = 0;
    }

};

Player.prototype.render = function() {

    ctx.drawImage(this.img, this.x, this.y);

    //border for testing
    ctx.strokeStyle = '#00f';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.img.width, this.img.height);

};

Player.prototype.handleInput = function(key) {
    //handles player input to move character etc.

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

var hud = function() {

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
                break;
            case 'center':
                position.y = ctx.canvas.height / 2;
                break;
            case 'bottom':
                position.y = ctx.canvas.height - opts.padding;

                break;
        }

        ctx.fillText(opts.text, position.x, position.y);
        ctx.strokeText(opts.text, position.x, position.y);

    }

    drawText({
        text: 'Lives: *****',
        position: 'right top'
    });
};

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

function isEven(n) {
    return isNumber(n) && (n % 2 === 0);
}

function isOdd(n) {
    return isNumber(n) && (Math.abs(n) % 2 === 1);
}

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


//polyfills

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
