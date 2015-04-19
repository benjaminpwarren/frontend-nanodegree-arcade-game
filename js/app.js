'use strict';
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.spriteWidth    = 101;  //TODO: make dynamic.
    this.spriteHeight   = 171; //TODO: make dynamic.

    var baseSpeed = 200;
    var speedFactor = getRandomInt(1,3) / 2 - 1;
    this.speed = baseSpeed + baseSpeed * speedFactor;

    this.enemyNum = allEnemies.length;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x) {
        this.x = this.x + (this.speed * dt);
    } else {
        this.x = -200 + (getRandomInt(1, 3) - 1) * 100;
        this.y = this.enemyNum * this.spriteHeight / 2 + this.spriteHeight / 3;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';
    this.spriteWidth    = 101;  //TODO: make dynamic.
    this.spriteHeight   = 171; //TODO: make dynamic.
    this.x = ctx.canvas.width / 2 - this.spriteWidth / 2;
    this.y = ctx.canvas.height - this.spriteHeight - this.spriteHeight / 3;
};

Player.prototype.update = function(dt) {
    //this.x = 50;
    //this.y = 50;
};

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(){
    //handles player input to move character etc.
};

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
