'use strict';
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.spriteWidth        = 101; //TODO: make dynamic.
    this.spriteHeight       = 171; //TODO: make dynamic.
    this.spriteFeetCenterY  = 127; //manually identified by looking at shadow under character in sprite

    var baseSpeed = 200;
    var speedFactor = getRandomInt(1,3) / 2 - 1;
    this.speed = baseSpeed + baseSpeed * speedFactor;

    this.enemyNum = allEnemies.length + 1;

    var startTile = {col: -3 + getRandomInt(1, 3), row: this.enemyNum + 1};
    var tileWidth = 101;
    var tileHeight = 83;
    var tileTopOffset = 50;
    var spriteOffset = this.spriteFeetCenterY - (tileHeight / 2 + tileTopOffset);
    this.x = (startTile.col - 1) * tileWidth;
    this.y = (startTile.row - 1) * tileHeight - spriteOffset;

    //console.log('Enemy', this.enemyNum, this.y);
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
    var img = Resources.get(this.sprite);
    ctx.drawImage(img, this.x, this.y);
    //border for testing
    ctx.strokeStyle = '#f00';  // some color/style
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, img.width, img.height);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    //TODO: make dynamic.
    this.spriteWidth        = 101;
    this.spriteHeight       = 171;
    this.spriteFeetCenterY  = 133;

    //TODO: make dynamic.
    var startTile = {col: 3, row: 6};
    var tileWidth = 101;
    var tileHeight = 83;
    var tileTopOffset = 50;
    var spriteOffset = this.spriteFeetCenterY - (tileHeight / 2 + tileTopOffset);
    this.x = (startTile.col - 1) * tileWidth;
    this.y = (startTile.row - 1) * tileHeight - spriteOffset;

    //console.log('Player', this.y);
};

Player.prototype.update = function(dt) {

    if (this.dx) {
        this.x += this.dx;
        this.dx = 0;
    } else if (this.dy) {
        this.y += this.dy;
        this.dy = 0;
    }

    //TODO: check collisions

};

Player.prototype.render = function(){
    var img = Resources.get(this.sprite);
    ctx.drawImage(img, this.x, this.y);
    //border for testing
    ctx.strokeStyle = '#00f';  // some color/style
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, img.width, img.height);
};

Player.prototype.handleInput = function(key){
    //handles player input to move character etc.

    var xDistance = this.spriteWidth;
    var yDistance = 83;

    switch (key){
        case 'left':
            this.dx = - xDistance;
        break;
        case 'up':
            this.dy = - yDistance;
        break;
        case 'right':
            this.dx = xDistance;
        break;
        case 'down':
            this.dy = yDistance;
        break;

    }
};

var Border = function(){

}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [];
allEnemies.push(new Enemy());
allEnemies.push(new Enemy());
allEnemies.push(new Enemy());

var player = new Player();

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
