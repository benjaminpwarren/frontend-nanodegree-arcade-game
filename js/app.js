'use strict';

/* global Resources, resources, tile, ctx, drawBoxBorder */

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
    //drawBoxBorder(this.boundingBox(), "#f00");
    //drawBoxBorder(this.box(), "#00f");
};

// Helper methods

Entity.prototype.left = function(){
    return this.x;
};

Entity.prototype.right = function(){
    return this.x + this.img.width;
};

Entity.prototype.top = function(){
    return this.y;
};

Entity.prototype.bottom = function(){
    return this.y + this.img.height;
};

/*Entity.prototype.box = function(){
    return {
        left: this.left(),
        right: this.right(),
        top: this.top(),
        bottom: this.bottom(),
        width: this.img.width,
        height: this.img.height
    };
};*/

/* Get the resource's bounding box and apply to current position */
Entity.prototype.boundingBox = function(){

    var box = Object.assign({}, this.resource.boundingBox);

    box.left += this.x;
    box.top += this.y;
    box.right = box.left + box.width;
    box.bottom = box.top + box.height;

    return box;
};

// Enemies our player must avoid
var Enemy = function(options) {

    var defaults = {
        sprite: 'images/enemy-bug.png',
        startTile: {
            col: -3 + getRandomInt(1, 3) / 2, //start the enemy on tile column -2, -1, or 0
            row: getRandomInt(2, 4) //start the enemy on a random tile row 2, 3, or 4
        }
    };

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
                position.y += tile.topOffset;
                break;
            case 'center':
                position.y = ctx.canvas.height / 2 + tile.topOffset;
                break;
            case 'bottom':
                position.y = ctx.canvas.height - opts.padding;
                break;
        }

        ctx.textAlign = positionMatches[2];

        switch (positionMatches[2]) {
            case 'left':
                break;
            case 'center':
                position.x = ctx.canvas.width / 2;
                break;
            case 'right':
                position.x = ctx.canvas.width - opts.padding;
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

/* Shells and stubs so Engine Update and Render calls don't fail.
   Doing it this way as we need to wait for the resources to load before instantiating
   our objects as our objects use properties such as the width and height of the
   sprites.
*/
var allEnemies = [];
var player = [];
player.update = function() {};
player.render = function() {};

// Once our resources have been loaded, create enemies and player and input events
Resources.onReady(function() {

    //create some enemies
    allEnemies.push(new Enemy());
    allEnemies.push(new Enemy());
    allEnemies.push(new Enemy());
    allEnemies.push(new Enemy());

    //create the player
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


//DEV - draw bounding box border //TODO remove.
function drawBoxBorder(box, borderColor){
    borderColor = borderColor || '#000';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.left, box.top, box.width, box.height);
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