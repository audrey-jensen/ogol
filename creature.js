const MIN_X_POSITION = 20;
const MIN_Y_POSITION = 20;
const MAX_X_POSITION = 460;
const MAX_Y_POSITION = 460;


// animation controls what the creature is doing. The following animations are
// supported: 'crying', 'angry', 'cheerful', 'eating', 'sleeping', and 'moving'.
let animation = 'sleeping';

// x_position and y_position control where the creature is
let x_position = 200;
let y_position = 200;

// behavior says what the creature is doing. The creature has a short memory; if 
// it changes behavior (for example, falls asleep), it forgets what it was doing 
// before that.
let behavior = 'sleep';


// stomach tracks how much food the creature has eaten. If the creature's stomach
// is empty it will cry until it is fed.
let stomach = 100;


// energy tracks how long the creature can act before it gets tired. If the creature
// runs out of energy it will fall alseep.
let energy = 100;


// Creatures eat words! Food tracks what word they last ate.
let food = ''


// busy says how long the creature is doing action.
let busy = 0;


// the creature moves towards goto_x.
let goto_x = null;


// the creature moves towards goto_y.
let goto_y = null;


// You can create a player action by creating a function named after the button.
// for example, if your button is named "Pet", then you can create a function like 
// this:
//
//     function Pet(creature) {
//        // tell the creature how to respond here.
//     }
//
// If your button has spaces, just remove them. So if your button is named "Feed Soup",
// then you can create a function like this:
// 
//     function FeedSoup(creature) {
//        // tell the creature how to respond here.
//     }
//
// The function can set the variables like x_position and y_position directly, or 
// it can use the creature helper to do it. You can call methods on the creature
// helper like so:
//
//   creature.sleep(5)
//   creature.wander(6)
//   creature.goto(15, 30)

// shorthand for actions the creature can perform
const creature = {
    reset() { 
        busy = 0;
        food = '';
        goto_x = null;
        goto_y = null;
    },
    sleep(t) { 
        creature.reset();
        behavior = 'sleep'; 
        busy = t; 
    },
    rest(t) {
        creature.reset();
        behavior = 'rest';
        busy = t;
    },
    wander(t) { 
        creature.reset();
        behavior = 'wander';  
        busy = t; 
    },
    teleport(x, y) {
        creature.reset();
        busy = 8;
        behavior = 'rest';
        x_position = clamp(x, MIN_X_POSITION, MAX_X_POSITION);
        y_position = clamp(y, MIN_Y_POSITION, MAX_Y_POSITION);
    },
    goto(x, y) { 
        creature.reset();
        behavior = 'goto'; 
        // set busy to a very high number; the goto behavior resets it to 0 when 
        // the creature arrives at [goto_x, goto_y].
        busy = 1000;
        goto_x = clamp(x, MIN_X_POSITION, MAX_X_POSITION); 
        goto_y = clamp(y, MIN_Y_POSITION, MAX_Y_POSITION); 
    },
    eat(thing) {
        creature.reset();
        behavior = 'eat'; 
        food = thing;
        busy = thing.length * 2; 

        if(stomach < 1) stomach = 1;
        if(energy < 1) energy = 1;
    },
    cry(t) { 
        creature.reset();
        behavior = 'cry'; 
        busy = t; 
    },
    cheer(t) { 
        creature.reset();
        behavior = 'cheer'; 
        busy = t; 
    },
    isStarving() {
        return stomach <= 0;
    },
    isExhausted() {
        return energy <= 0;
    }
}

// this function is called to determine what the creature is doing.
function simulate(time, input) {
    if(input.isPlayerAction()) {
        input.doPlayerAction(creature);
    }
    else if (creature.isStarving()) {
        creature.cry(1);
    }
    else if (creature.isExhausted()) {
        creature.sleep(1);
    }
    else {
        doCreatureAction(creature);
    }

    updateCreature();
}

function doCreatureAction(creature)
{
    // if the creature is busy, they keep doing what they're doing.
    if (busy){
        return;
    }

    // otherwise they address any needs they have
    if (energy <= 10) {
        creature.sleep(16);
        return;
    }
    else if (energy > 100) {
        creature.cheer(energy - 100);
        return;
    }
    else if (energy < 20) {
        creature.rest(5);
    }
    else {
        creature.wander(10);
    }
}

function updateCreature()
{
    // the creature is a little less busy each update.
    busy--;

    // 
    switch (behavior) {
        case 'sleep':
            animation = 'sleeping';
            energy += 6;
            stomach -= 1;
            break;

        case 'wander':
            animation = 'moving';
            energy -= 2;
            
            x_position = randomWalk(x_position, 4, 12, MIN_X_POSITION, MAX_X_POSITION);
            y_position = randomWalk(y_position, 4, 12, MIN_Y_POSITION, MAX_Y_POSITION);
            break;

        case 'goto':
            animation = 'moving';
            energy -= 1;

            if (goto_x > x_position) {
                x_position++;
            }
            else if (goto_x < x_position) {
                x_position--;
            }

            if(goto_y > y_position) {
                y_position++;
            }
            else if (goto_y < y_position) {
                y_position--;
            }

            if (x_position === goto_x && y_position === goto_y) {
                busy = 0;
            }
            break;

        case 'rest':
            animation = 'moving';
            energy += 3;
            stomach -= 1;
            break;

        case 'eat':
            animation = 'eating';
            // eats 1 letter of the thing every 2 ticks
            if(busy % 2 === 1) {
                food = food.substring(1);
            }
            stomach += 5;
            break;

        case 'cry':
            animation = 'crying';
            break;

        case 'cheer':
            animation = 'cheerful';
            energy -= 3;
            break;
    }
}

// moves a random distance away from a position
function randomWalk(position, minDistance, maxDistance, minPosition, maxPosition){
    const offset = maxDistance - minDistance;
    const distance = minDistance + Math.floor(Math.random() * offset);
    const newPosition = Math.random() > .5 ? position + distance : position - distance;

    return clamp(newPosition, minPosition, maxPosition);
}

// Ensures value falls within minimim and maximum. If value is outside of a bound,
// the closest bound is returned. Otherwise value is returned.
function clamp(value, minumum, maximum) {
    if (value < minumum) return minumum;
    else if (value > maximum) return maximum;
    else return value;
}

// gathers creature information from the simulator
function getCreature() {
    let position = [x_position,y_position];
    return { position, animation };
}