// Hi! This script handles starting up the creature demo! Unlike the other files,
// this one doesn't do a very good job explaining what it's doing because it was
// kind of tacked on at the end. 🙈

// The growth stage of the creature! We're only making just-hatched creatures.
const STAGE = 'stage-0';


// These constants say how fast the program runs.
const MILLISECONDS_PER_SECOND = 1000.0;
const FRAMES_PER_SECOND = MILLISECONDS_PER_SECOND / 30.0;
const TICKS_PER_SECOND = MILLISECONDS_PER_SECOND / 4.0;


// the program starts here.
async function init() {
    // load how the creature looks
    let stage0Sprite = await loadSpriteSheet('stage-0');

    // create the loops that bring the creature to life
    const renderLoop = yieldingLoop(render, FRAMES_PER_SECOND);
    const simLoop = yieldingLoop(simulate, TICKS_PER_SECOND);

    // hook up the screen
    const canvas = document.getElementById('play-pen-canvas');
    const context = canvas.getContext('2d');
    context.fillStyle = '#5c4e3d'
    context.fillRect(0, 0, canvas.width, canvas.height);

    // hook up player input
    const input = initializeInput();

    renderLoop(true, context, stage0Sprite);
    simLoop(true, input);
}


// Adds player inputs.
function initializeInput() {
    const input = {
        value: null,

        // checks whether there's a player action to run.
        isPlayerAction() {
            if(!this.value) return false;

            const normalized = this.value.replace(/\W/, '');
            return typeof window[normalized] === typeof Function;
        },

        // runs the player action and resets the input
        doPlayerAction(creature) {
            if(!this.value) return false;

            const normalized = this.value.replace(/\W/, '');
            this.value = null;

            window[normalized](creature);
        }
    };

    const actions = document.getElementsByClassName('action');
    for(let action of actions) {
        action.addEventListener('click', e => input.value = e.target.innerText);
    }

    return input;
}

// Loads a creature that we can draw on the screen
//
// See also:
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
// https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push
async function loadSpriteSheet(spriteSheetName) {

    // A sprite sheet holds all of the pictures we need to draw the creature at once.
    // It's easier to draw the creature off of 1 sprite sheet than a lot of them, but
    // we need to know more math to make it work.
    const sprite = {
        // sheet is the sprite sheet we draw the creature from
        sheet: new OffscreenCanvas(300, 300),

        // animations saves where each frame is in the sprite sheet
        animations: {}
    }


    // gather all of the paths to our images in `paths`...
    const paths = [];
    for(let animationName in SPRITE_INFO[spriteSheetName]) {
        paths.push(SPRITE_INFO[spriteSheetName][animationName].colorSprite);
    }
    // ...then load the images all at once into `images`!
    const images = await loadImages(paths);


    // `context` is used to add sprites to the sprite sheet
    const context = sprite.sheet.getContext('2d');
    // spritePosition tracks where we're saving the sprite into the sprite sheet.
    let spritePosition = [0,0];
    // Add all of the animation images into the sprite sheet
    for(let animationName in SPRITE_INFO[spriteSheetName]) {
        const animation = SPRITE_INFO[spriteSheetName][animationName];
        const image = images[animation.colorSprite];

        // add the picture to the sprite sheet
        let [x, y] = spritePosition;
        context.drawImage(image, x, y);

        // calculate where the frames are in the sprite sheet...
        const frames = [];
        for(let [frame_x, frame_y] of animation.frames) {
            const [frame_w, frame_h] = animation.size;
            const frame = [x + frame_x, y + frame_y, frame_w, frame_h];
            frames.push(frame);
        }
        // ...then save the new frames and times in the sprite.
        sprite.animations[animationName] = { 
            frames, 
            time: animation.time,
            totalTime: animation.time.reduce((a, v) => a + v, 0)
        };

        // update the sprite position to the bottom of the image we just added,
        // so that way the next image is added below this one.
        spritePosition = [0, y + image.naturalHeight];
    }

    return sprite;
}


// Promise wrapper for loading images.
// from https://stackoverflow.com/questions/37854355/wait-for-image-loading-to-complete-in-javascript
async function loadImages(imageUrlArray) {
    const promiseArray = []; // create an array for promises
    const images = {}; // image lookup

    for (let imageUrl of imageUrlArray) {
        promiseArray.push(new Promise(resolve => {
            // create the object that stores the image
            images[imageUrl] = new Image();

            // resolve the promise when the image loads
            images[imageUrl].onload = () => resolve();

            // begin loading the image. Always do this after setting up `onload`!
            images[imageUrl].src = imageUrl;
        }));
    }

    // wait for all the images to load
    await Promise.all(promiseArray); 
    return images;
}


// Return a function that calls `body` function repeatedly passing in a variable 
// that tracks the number of times it was called. After 4 billion calls, the counter 
// variable resets to 0. Calling the function with the `false` value exits the loop.
//
// See also: https://developer.mozilla.org/en-US/docs/Web/API/setInterval
function yieldingLoop(body, delay) {
    // tracks how many times `body` was called.
    let counter = 0;

    // `null` is a special value that means 'this variable is empty'.
    let timerId = null;

    return (play = true, ...args) => {
        if(play === false){
            // stop the loop by cancelling the setInterval call.
            clearInterval(timerId);
        }
        else if (timerId === null && play === true){
            // start the loop by calling a function every `delay` seconds.
            timerId = setInterval(
                () => {
                    // increment the counter; after 4 billion calls reset it to 0.
                    if (counter++ > 4000000000) counter = 0;

                    // call the function to loop over
                    body(counter, ...args);
                }, 
                delay);
        }
    };
}
