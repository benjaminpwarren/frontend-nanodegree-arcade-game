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

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */

        if (running) {
            win.requestAnimationFrame(main);
        }
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
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
        if (!player.resource || !player.x) {
            return;
        }

        //var playerBox = getBoundingBox(player);
        var playerBox = getAdjBoundingBox(player);

        allEnemies.forEach(function(enemy) {
            var enemyBox = getBoundingBox(enemy);

            //if there's an overlap, reduce lives respawn the player or terminate player.
            if (overlap(playerBox, enemyBox)) {

                player.lives += -1;

                if (player.lives === 0) {

                    running = false;

                    /* Trigger render so "intentional" collisions (where player moves
                       into enemy rather than enemy running into player) actually get
                       rendered (as checkCollisions is called after update but before
                       render).                    */
                    render();

                    hud.textElements.push({
                        text: 'GAME OVER!',
                        lineWidth: 3,
                        fillStyle: 'red',
                        strokeStyle: 'black',
                        font: '80pt \'IMPACT\'',
                        position: 'center center',
                        padding: '1'
                    });

                } else {
                    player.spawn();
                }

            }

            //loop through all enemies and reduce speed to same if enemy hits another enemy
            allEnemies.forEach(function(enemy2) {

                if (enemy2 === enemy) return;

                var enemy2Box = getBoundingBox(enemy2);

                if (overlap(enemy2Box, enemyBox)) {
                    enemy2.speed = enemy.speed;
                    enemy2.x = enemy.x - enemy.img.width;
                }
            });
        });
    }

    /*
    had moved this here to clean up app.js code but it doesn't work when put with the
    collision stuff above, presumably because the tile repaint happens immediately
    after the collision stuff (so the borders are drawn, they're just painted over
    immediately).

    function dev_drawBoundingBoxBorder(boundingBox){
        //draw bounding box border //TODO remove.
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(boundingBox.left, boundingBox.top, boundingBox.width, boundingBox.height);
    }*/

    /* Get the resource's bounding box and update to current position */
    function getBoundingBox(entity) {

        var box = Object.assign({}, entity.resource.boundingBox);

        box.left += entity.x;
        box.top += entity.y;
        box.right = box.left + box.width;
        box.bottom = box.top + box.height;

        return box;
    }

    /* Get the resource's bounding box and adjust it based on a factor, and
       update to current position. When using bounding boxes, a factor of 0.8
       makes for more visually realistic collisions due to bounding boxes being
       a very approximate representation of the entity's shape.*/
    function getAdjBoundingBox(entity) {

        var adjFactor = 0.8;

        var box = entity.resource.boundingBox;
        var adjBox = Object.assign({}, box);

        adjBox.width = box.width * adjFactor;
        adjBox.left = adjBox.left + (box.width - adjBox.width) / 2;
        adjBox.width = Math.round(adjBox.width);
        adjBox.left = Math.round(adjBox.left);
        adjBox.height = box.height * adjFactor;
        adjBox.top = adjBox.top + (box.height - adjBox.height) / 2;
        adjBox.height = Math.round(adjBox.height);
        adjBox.top = Math.round(adjBox.top);

        adjBox.left = entity.x + adjBox.left;
        adjBox.top = entity.y + adjBox.top;
        adjBox.right = adjBox.left + adjBox.width;
        adjBox.bottom = adjBox.top + adjBox.height;

        return adjBox;
    }

    function overlap(box1, box2) {
        return !((box1.bottom < box2.top) ||
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
        // noop
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
            left: 17,
            top: 63,
            width: 67,
            height: 76
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
})(window);