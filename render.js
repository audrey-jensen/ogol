var lastCreaturePosition = [0,0,0,0];

// renders the game
function render(time, screen, meters, sprite) {
    var creature = getCreature();

    // updates the meters showing the creature's needs
    updateMeters(meters, creature.stats)

    // clear where the creature was located last render
    screen.fillRect(...lastCreaturePosition);

    // draw the creature at their new position
    lastCreaturePosition = drawCreature(screen, time, creature, sprite);
}

// update meters from creature statistics
function updateMeters(meters, stats) {
    meters.energy.value = stats.energy;
    meters.stomach.value = stats.stomach;
}

// draws a creature into the context
function drawCreature(screen, time, creature, sprite) {
    const { position: [x, y], animation } = creature;

    // look up the frame to draw
    const animationFrame = getAnimationFrame(time, sprite.animations[animation]);
    const [,, sprite_w, sprite_h] = animationFrame;
    const creaturePosition = [x,  y, sprite_w * 2, sprite_h * 2];

    // draw the frame
    screen.drawImage(sprite.sheet, ...animationFrame, ...creaturePosition);

    return creaturePosition;
}

// `gameFrame` is a number saying how many times we've animated before.
// `animation` contains pixel coordinatess into the sprite sheet in [x, y] pairs.
function getAnimationFrame(gameFrame, animation) {
    // identifies the frame we're trying to render in the animation loop
    const animationFrame = gameFrame % animation.totalTime;
    
    // index into the animation frame & time arrays
    let index = 0;

    // total time accumulated by the frame scan
    let frameTime = 0;
    
    // the frame to render
    let frame = null;

    // scan the frames to find the one to render
    do {
        frame = animation.frames[index];
        frameTime += animation.time[index];
        index++;
    } while(frameTime < animationFrame);

    return frame || animation.frames[0];
}