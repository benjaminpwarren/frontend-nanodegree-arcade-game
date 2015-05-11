/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

'use strict';

//TODO: refactor so not polluting global namespace
/* global player, allEnemies, hud, Resources, Enemy, Player */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    // Set our tile properties for use below. Also exported.
    var tile = {
        width: 101,
        height: 83, //83 is effective height as a result of overlap placement
        topOffset: 50
    };

    canvas.width = 505;
    canvas.height = 606;
    doc.getElementById('wall').appendChild(canvas);

    var border = {
        x: 0,
        y: tile.topOffset + 1,
        width: canvas.width,
        height: tile.height * 6 - 5
    };

    //add these for convenience when doing player boundary check.
    //these don't have to be methods, they could just be values, but this is easier to
    //understand when they actually get used.
    border.left = function() {
        return border.x;
    };
    border.top = function() {
        return border.y;
    };
    border.right = function() {
        return border.x + border.width;
    };
    border.bottom = function() {
        return border.y + border.height;
    };

    var running = true;

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        if (running) {
            /* Use the browser's requestAnimationFrame function to call this
             * function again as soon as the browser is able to draw another frame.
             */
            win.requestAnimationFrame(main);
        } else {

            hud.textElements.push({
                text: 'Press \'Y\' to play again.',
                lineWidth: 2,
                fillStyle: 'white',
                strokeStyle: 'black',
                font: '26pt \'IMPACT\'',
                position: 'center center',
                padding: 83
            });

            render();
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();

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
                40: 'down',
                89: 'y'
            };

            player.handleInput(allowedKeys[e.keyCode]);
        });

        running = true;

        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        checkCollisions();
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update();
    }

    function checkCollisions() {

        //if player hasn't been fully constructed yet, exit
        if (!player.resource || !('x' in player)) {
            return;
        }

        var playerBox = player.boundingBox();

        allEnemies.forEach(function(enemy) {

            //if there's an overlap, reduce lives, and respawn the player or terminate player.
            if (overlap(playerBox, enemy.boundingBox())) {
                player.lives -= 1;

                if (player.lives === 0) {

                    running = false;

                    /* Trigger render so "intentional" collisions (where player
                       moves into enemy rather than enemy running into player)
                       actually get rendered (as checkCollisions is called after
                       update but before render).*/
                    render();

                    hud.textElements.push({
                        text: 'GAME OVER!',
                        lineWidth: 3,
                        fillStyle: 'red',
                        strokeStyle: 'black',
                        font: '80pt \'IMPACT\'',
                        position: 'center center',
                        padding: 0
                    });

                } else {
                    player.spawn();
                }

            }

            //loop through all enemies and reduce speed to same if enemy hits
            //another enemy

            /* NOTE: first reviewer mentioned that the game 'looks a little
               jittery' but I can't see any jitter and Chrome tells me that it
               runs at 59.9/60 FPS so I can't test without more info about the
               reviewer's system.

               However, I've added some more 'exit early' conditions to reduce
               the number of calculations so perhaps this will improve things on
               the reviewer's machine.
             */
            allEnemies.forEach(function(enemy2) {

                //if they're not in the same row, skip further checks as
                //enemies only move along x axis
                if (enemy2.y !== enemy.y) return;

                //if enemy2 is behind and going slower, skip full overlap check
                if (enemy2.speed <= enemy.speed && enemy2.x < enemy.x - enemy.img.width) return;

                if (enemy2 === enemy) return;

                // if the enemy bounding boxes overlap, set the second enemy to have
                // the same speed as the first enemy and position it behind.
                if (overlap(enemy2.boundingBox(), enemy.boundingBox())) {
                    enemy2.speed = enemy.speed;
                    enemy2.x = enemy.x - enemy.img.width;
                }
            });
        });

        // If player is attempting to move left off the board.
        if (player.left() < border.left()) {
            player.x = border.left();
        }
        // If player is attempting to move right off the board.
        if (player.right() > border.right()) {
            player.x = border.right() - player.img.width;
        }
        // If player is attempting to move down off the board.
        if (player.bottom() > border.bottom()) {
            player.y = player.y - tile.height;
        }
        // If player reaches the top, reward and win game or respawn.
        if (player.top() + player.spriteOffsetY + tile.topOffset < border.top()) {
            player.y = player.y + tile.height;

            player.points += 1;
            if (player.points >= player.maxPoints) {

                running = false;

                render();

                hud.textElements.push({
                    text: 'YOU WON!',
                    lineWidth: 3,
                    fillStyle: 'yellow',
                    strokeStyle: 'black',
                    font: '80pt \'IMPACT\'',
                    position: 'center center',
                    padding: 0
                });
            } else {
                player.spawn();
            }
        }
    }

    function overlap(box1, box2) {
        return !(
            (box1.bottom < box2.top) ||
            (box1.top > box2.bottom) ||
            (box1.left > box2.right) ||
            (box1.right < box2.left));
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */

        /* TODO map drawing to use an array instead of loops so maps can be specified
           like: ['wwwww',
                  'sssss',
                  'ggggg',
                  'ggggg',
                  'ggggg',
                  'ggggg']

           where w, s, and g refer to water-block, stone-block, and grass-block.

           This will allow new levels/maps to be defined quickly as they will be easy
           to visualise.
        */

        var rowImages = [
                'images/water-block.png', // Top row is water
                'images/stone-block.png', // Row 1 of 3 of stone
                'images/stone-block.png', // Row 2 of 3 of stone
                'images/stone-block.png', // Row 3 of 3 of stone
                'images/grass-block.png', // Row 1 of 2 of grass
                'images/grass-block.png' // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * tile.width, row * tile.height);
            }
        }

        renderEntities();

        hud.render();

    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {

        //clear enemies
        allEnemies.length = 0;
        //clear any text messages from the heads-up display.
        hud.textElements.length = 0;

    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */

    var resources = {};

    resources['images/stone-block.png'] = {};
    resources['images/water-block.png'] = {};
    resources['images/grass-block.png'] = {};
    resources['images/Heart-small.png'] = {};
    resources['images/Gem Orange-small.png'] = {};
    resources['images/Gem Orange outline-small.png'] = {};

    resources['images/enemy-bug.png'] = {
        boundingBox: {
            left: 1,
            top: 77,
            width: 98,
            height: 66
        },
        feetCenterY: 127
    };

    resources['images/char-boy.png'] = {
        boundingBox: {
            left: 24,
            top: 71,
            width: 54,
            height: 61
        },
        feetCenterY: 133
    };

    Resources.load(resources);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
    global.resources = resources;
    global.tile = tile;
    global.init = init;
})(window);