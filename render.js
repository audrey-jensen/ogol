var lastCreaturePosition = [0,0,0,0];

// renders the game
function render(time, context, sprite) {
    var creature = getCreature();

    // clear where the creature was located last render
    context.fillRect(...lastCreaturePosition);

    // draw the creature at their new position
    lastCreaturePosition = drawCreature(context, time, creature, sprite);
}

// draws a creature into the context
function drawCreature(context, time, creature, sprite) {
    const { position: [x, y], speed, animation } = creature;

    // look up the frame to draw
    const animationFrame = getAnimationFrame(time, sprite.animations[animation], speed);
    const [,, sprite_w, sprite_h] = animationFrame;
    const creaturePosition = [x,  y, sprite_w * 2, sprite_h * 2];

    // draw the frame
    context.drawImage(sprite.sheet, ...animationFrame, ...creaturePosition);

    return creaturePosition;
}

// `gameFrame` is a number saying how many times we've animated before.
// `animation` contains pixel coordinatess into the sprite sheet in [x, y] pairs.
function getAnimationFrame(gameFrame, animation) {
    // identifies the frame we're trying to render in the animation loop
    const animationFrame = gameFrame % animation.totalTime;
    
    // index into the animation frame & time arrays
    let i = 0;

    // total time accumulated by the frame scan
    let frameTime = 0;
    
    // the frame to render
    let frame = null;

    // scan the frames to find the one to render
    do {
        frame = animation.frames[i];
        frameTime += animation.time[i];
        i++;
    } while(frameTime < animationFrame);

    return frame || animation.frames[0];
}