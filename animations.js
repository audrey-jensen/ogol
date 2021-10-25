// This is a *data structure*. It tells the program where to find the pictures it
// draws on the screen. 
//
// A "sprite" is an image that moves. It works the way a movie
// camera does, showing a bunch of pictures (or "frames") quickly to make it look 
// like things are moving.
const SPRITE_INFO = {
    // there's sprites where the creature grows, but this program only uses stage-0.
    'stage-0':
        { 
            // "angry", "cheerful", "crying", "eating", "sleeping", and "moving"
            // are all ways the creature acts. 
            //
            // "sprite" says the name of the image, and "frames" says how many pixels 
            // into the image to look when drawing the creature. "time" says how
            // long to display each frame of the animation.
            //
            // Take a look at the size part of the crying animation, and you'll see 
            // it says `[32,32]`. Each pair of square brackets is a list, with items
            // separated by commas. `[32,32]` is a list that contains two `32` items. 
            // The first 32 is the width of the frame in pixels, and the second
            // 32 is the height in pixels.
            //
            // Now take a look at the frames part of the crying animation, and you'll
            // see `[[0,0]]`. This is a list whose only item is *another list*. 
            // The outer list contains the list `[0,0]`, which represents a single
            // frame of the animation. The first 0 is the number of pixels to count
            // across from the top-left hand corner of the image. The second 0 is 
            // the number of pixels to count down from that corner.
            // 
            // When an animation contains more than one frame, then the outer list
            // will contain more than one inner list. Check out the angry animation,
            // and you'll see an example of this. The first frame is [0, 0], so 
            // it's 0 pixels right and 0 pixels down from the top-left corner of 
            // the sprite. The second frame is 32 pixels right and 0 pixels down.
            // 
            // How many frames are in the moving animation? Where are they in the
            // sprite?
            crying: { 
                colorSprite: "img/stage-0/Color/1_cry.png", 
                size: [32, 32], 
                frames: [[0,0]], 
                time: [1] 
            },
            angry: { 
                colorSprite: "img/stage-0/Color/1_angry.png", 
                size: [32, 32], 
                frames: [[0,0], [32,0]], 
                time: [12, 24] 
            },
            cheerful: { 
                colorSprite: "img/stage-0/Color/1_cheer.png", 
                size: [32, 32], 
                frames: [[0,0], [32,0]],
                time: [8, 8] 
            }, 
            hyper: { 
                colorSprite: "img/stage-0/Color/1_cheer.png", 
                size: [32, 32], 
                frames: [[0,0], [32,0]],
                time: [2, 2] 
            }, 
            eating: { 
                colorSprite: "img/stage-0/Color/1_eating.png", 
                size: [32, 32], 
                frames: [[0,0], [32,0]], 
                time: [32, 32] 
            },
            sleeping: { 
                colorSprite: "img/stage-0/Color/1_sleep.png", 
                size: [32, 32], 
                frames: [[0,0], [32,0]], 
                time: [40, 56] 
            },
            moving: { 
                colorSprite: "img/stage-0/Color/1_walk.png", 
                size: [32, 32], 
                frames: [[0,0], [32,0], [64,0], [96,0], [128,0]],
                time: [2, 3, 5, 4, 3]
            }
        }
};
