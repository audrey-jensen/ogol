

// animation controls what the creature is doing. The following animations are
// supported: 'crying', 'angry', 'cheerful', 'eating', 'sleeping', 'hyper' and 
// 'moving'.
let animation = 'sleeping';

// x_position and y_position control where the creature is
let x_position = 200;
let y_position = 200;

// behavior says what the creature is doing. The creature has a short memory; if 
// it changes behavior (for example, falls asleep), it forgets what it was doing 
// before that.
let behavior = 'wander';


// stomach tracks how much food the creature has eaten. If the creature's stomach
// is empty it will cry until it is fed.
let stomach = 75;


// energy tracks how long the creature can act before it gets tired. If the creature
// runs out of energy it will fall alseep.
let energy = 800;


// Creatures eat words! Food tracks what word they last ate.
let food = ''


// busy says how long the creature will do its present behavior before it changes.
let busy = 0;


// the creature moves towards goto_x.
let goto_x = null;


// the creature moves towards goto_y.
let goto_y = null;


////////////////////////////////////////////////////////////////////////////////
// these constants set limits on what the creature can do.
const MIN_X_POSITION = 20;
const MIN_Y_POSITION = 20;
const MAX_X_POSITION = 460;
const MAX_Y_POSITION = 460;

const MIN_TURNS = 0;
const MAX_TURNS = 100;

const ENERGY_CAPACITY = 1000;
const STOMACH_CAPACITY = 100;


////////////////////////////////////////////////////////////////////////////////
// this object is used to ask the creature do do things

const creature = {
    // ask the creature to stop what they're doing
    stop() { 
        busy = 0;
        food = '';
        goto_x = null;
        goto_y = null;
    },

    // ask the creature to go to sleep for 4 turns
    sleep(turns) { 
        creature.stop();
        behavior = 'sleep'; 
        busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    },
    rest(turns) {
        creature.stop();
        behavior = 'rest';
        busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    },
    wander(turns) { 
        creature.stop();
        behavior = 'wander';  
        busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    },
    teleport(x, y) {
        creature.stop();
        busy = 8;
        behavior = 'rest';
        x_position = clamp(x, MIN_X_POSITION, MAX_X_POSITION);
        y_position = clamp(y, MIN_Y_POSITION, MAX_Y_POSITION);
    },
    goto(x, y) { 
        creature.stop();
        behavior = 'goto'; 
        // set busy to a very high number; the goto behavior resets it to 0 when 
        // the creature arrives at [goto_x, goto_y].
        busy = 1000;
        goto_x = clamp(x, MIN_X_POSITION, MAX_X_POSITION); 
        goto_y = clamp(y, MIN_Y_POSITION, MAX_Y_POSITION); 
    },
    eat(word) {
        creature.stop();

        if(word.length === 4) {
            creature.angry(word.length * 6);
            console.error("Please don't feed the creature 4-letter words!");
            return;
        }

        behavior = 'eat';
        food = word;
        busy = word.length * 4; 
    },
    digest(turns) {
        behavior = 'digest';
        busy = turns;
    },
    angry(turns) {
        creature.stop();
        behavior = 'angry';
        busy = clamp(turns, MIN_TURNS, MAX_TURNS);
    },
    cry(turns) { 
        creature.stop();
        behavior = 'cry'; 
        busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    },
    cheer(turns) { 
        creature.stop();
        behavior = 'cheer'; 
        busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    },
    hyper(turns) { 
        creature.stop();
        behavior = 'hyper'; 
        busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    },
    isStarving() {
        return stomach <= 0;
    },
    isExhausted() {
        return energy <= 0;
    },
    isHyper() {
        return energy >= ENERGY_CAPACITY;
    },
    isFull() {
        return stomach >= STOMACH_CAPACITY;
    },
    isBusy() {
        return busy > 0;
    }
}


////////////////////////////////////////////////////////////////////////////////
// these functions simulate the creature's behavior

// simulates a single turn of the creature's behavior
function simulate(turn, player) {
    // The creature does what the player asks them to do without thinking so that
    // the simulation doesn't run into a problem where the creature is starving
    // but the player can't feed them.
    if(player.hasCommand()) {
        player.command(creature);
    }
    else {
        thinkOfAction(creature);
    }

    // this step
    doAction();
}


// the creature's brain -- this is where it decides what it's going to do
function thinkOfAction(creature)
{
    // Enforce the creature's basic needs. Basic needs override random behavior.
    if(creature.isStarving()){
        creature.cry(1);
    }
    else if(creature.isExhausted()) {
        creature.sleep(30);
    }
    else if (creature.isHyper()){
        creature.hyper(1);
    }
    else if (creature.isFull()) {
        creature.digest(1);
    }

    // If the creature is busy, then they keep doing what they were doing instead
    // of choosing something new.
    if (creature.isBusy()){
        return;
    }

    // otherwise the creature does something random
    const chance = wholeNumberBetween(1, 100);
    
    let sleepChance = 10;
    if(energy < 250) sleepChance = 20;
    if(energy < 200) sleepChance = 30;
    if(energy < 150) sleepChance = 40;
    if(energy < 100) sleepChance = 50;
    
    let wanderChance = 60;
    if(energy > 500) wanderChance = 70;
    if(energy > 700) wanderChance = 80;
    if(energy > 900) wanderChance = 90;

    if(chance < sleepChance) {
        creature.sleep(8);
    }
    else if(chance < wanderChance)
    {
        creature.wander(10);
    }
    else {
        creature.rest(5)
    }
}

// the creature's body -- this is where the creature does the thing the player asked
// it to do or that it thought of.
function doAction()
{
    // the creature is a little less busy each update.
    busy--;

    // 
    switch (behavior) {
        case 'sleep':
            animation = 'sleeping';
            energy += 8;
            stomach -= 1;
            break;

        case 'wander':
            animation = 'moving';
            energy -= 4;
            
            x_position = randomWalk(x_position, 4, 12, MIN_X_POSITION, MAX_X_POSITION);
            y_position = randomWalk(y_position, 4, 12, MIN_Y_POSITION, MAX_Y_POSITION);
            break;

        case 'goto':
            animation = 'moving';
            energy -= 8;

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

        case 'digest':
            animation = 'cheerful';
            energy += 10;
            stomach -= 1;
            break;

        case 'rest':
            animation = 'moving';
            energy += 5;
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

        case 'angry':
            animation = 'angry';
            break;

        case 'hyper':
            animation = 'hyper';
            break;

        case 'cheer':
            animation = 'cheerful';
            energy -= 3;
            break;
    }
}

////////////////////////////////////////////////////////////////////////////////
// utilities -- these functions implement helpful algorithms

// get a random number between min and max
function wholeNumberBetween(min, max) {
    const range = max - min;
    return min + Math.round(Math.random() * range);
}

// get a random true or false (heads or tails)
function flipCoin(){
    return Math.random() >= .5;
}

// moves a random distance away from a position
function randomWalk(position, minDistance, maxDistance, minPosition, maxPosition){
    const distance = wholeNumberBetween(minDistance, maxDistance);
    const newPosition = flipCoin() ? position + distance : position - distance;

    return clamp(newPosition, minPosition, maxPosition);
}

// Ensures value falls within minimim and maximum. If value is outside of a bound,
// the closest bound is returned. Otherwise value is returned.
function clamp(value, minumum, maximum) {
    if (value < minumum) return minumum;
    else if (value > maximum) return maximum;
    else return value;
}


////////////////////////////////////////////////////////////////////////////////
// Functions called when rendering the creature

//  get the creature's position and animation
function getCreature() {
    const position = [x_position,y_position];
    return { position, animation, stats: { stomach, energy } };
}