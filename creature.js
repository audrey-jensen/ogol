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

const GOTO_SPEED = 6;

// How the creature is if you don't change them.
const DEFAULT_NAME = "OGOL";
const DEFAULT_PRONOUNS = ["they", "them", "their"];
const DEFAULT_X_POSITION = 200;
const DEFAULT_Y_POSITION = 200;
const DEFAULT_ANIMATION = 'sleeping';
const DEFAULT_BEHAVIOR = 'wander';
const DEFAULT_STOMACH = 75;
const DEFAULT_ENERGY = 800;

// these contstants are the directions the creature can move.
const UP = 'UP';
const DOWN = 'DOWN';
const LEFT = 'LEFT';
const RIGHT = 'RIGHT';


////////////////////////////////////////////////////////////////////////////////
// The Creature class defines how individual creatures (aka "instances" or "objects")
// all share similar features. The shared features are the 'class' or 'type' of the
// instance. You can  create an instance of a class using `new`:
//
//      let dakota = new Creature("");
//
// When you're programming the creature's insides, use `this` to refer to it.
//
//      this.animation = 'sleeping';
//      this.busy = 5;
class Creature {
    // The creature's name!
    myName = DEFAULT_NAME;

    // The creature's pronouns!
    myPronouns = DEFAULT_PRONOUNS;

    // animation controls what the creature is doing. The following animations are
    // supported: 'crying', 'angry', 'cheerful', 'eating', 'sleeping', 'hyper' and 
    // 'moving'.
    animation = DEFAULT_ANIMATION;

    // x_position and y_position control where the creature is
    x_position = DEFAULT_X_POSITION;
    y_position = DEFAULT_Y_POSITION;

    // behavior says what the creature is doing. The creature has a short memory; if 
    // it changes behavior (for example, falls asleep), it forgets what it was doing 
    // before that.
    behavior = DEFAULT_BEHAVIOR;

    // stomach tracks how much food the creature has eaten. If the creature's stomach
    // is empty it will cry until it is fed.
    stomach = DEFAULT_STOMACH;

    // energy tracks how long the creature can act before it gets tired. If the creature
    // runs out of energy it will fall alseep.
    energy = DEFAULT_ENERGY;

    // Creatures eat words! Food tracks what word they last ate.
    food = ''

    // busy says how long the creature will do its present behavior before it changes.
    busy = 0;

    // the creature moves towards goto_x.
    goto_x = null;

    // the creature moves towards goto_y.
    goto_y = null;

    // whether or not the simulator is running.
    running = true;


    // new Creature("Whitney") - creates a new creature named "Whitney".
    constructor(name, pronouns){
        this.myName = name || DEFAULT_NAME;
        this.myPronouns = pronouns || ["they", "them", "their"];
        this.reset();
    }

    //   creature.sim()      - Start the creature simulator
    //   creature.sim(true)  - Start the creature simulator
    //   creature.sim(false) - Pause the creature simulator
    sim(play) {
        running = play === undefined ? true : !!play;
    }

    // creature.reset() - changes the creature's variables to their starting values.
    //                    Does not change the creature's name.
    reset() {
        this.busy = 0;
        this.food = '';
        this.stomach = 75;
        this.energy = 800;
        this.x_position = 200;
        this.y_position = 200;
        this.animation = 'sleeping';
    }

    // creature.name("Dakota") - changes the creature's name to "Dakota".
    // creature.name() - gets the creature's name.
    name(newName) {
        let oldName = this.myName;
        this.myName = newName || this.myName;

        if(oldName !== this.myName){
            this.cheer(21);
            console.info('Yay! A new name!');
        }
        else {
            console.warn(`${this.myName} only cheers when their name changes.`);
        }
    }

    // creature.stop() - ask the creature to stop what they're doing. You should
    //                   ask them to do something new after asking them to stop!
    stop() { 
        this.busy = 0;
        this.food = '';
        this.goto_x = null;
        this.goto_y = null;
    }

    // creature.sleep(4) - ask the creature to go to sleep for 4 turns
    sleep(turns) { 
        this.stop();
        this.behavior = 'sleep'; 
        this.busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    }

    // creature.rest(4) - ask the creature to rest for 4 turns.
    rest(turns) {
        this.stop();
        this.behavior = 'rest';
        this.busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    }

    // creature.wander(5) - ask the creature to wander for 5 turns
    wander(turns) { 
        this.stop();
        this.behavior = 'wander';  
        this.busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    }

    // creature.teleport(125, 225) - ask the creature to teleport to X = 125, Y = 225
    teleport(x, y) {
        if(this.isStarving()) {
            console.error(`${this.myName} is too hungry to teleport!`);
            return;
        }

        this.stop();
        this.busy = 6;
        this.behavior = 'digest';
        this.x_position = clamp(x, MIN_X_POSITION, MAX_X_POSITION);
        this.y_position = clamp(y, MIN_Y_POSITION, MAX_Y_POSITION);
    }

    // creature.go(UP, 20) - ask the creature to walk up 20
    // creature.go(DOWN, 10) - ask the creature to walk down 10
    // creature.go(LEFT, 15) - ask the creature to walk left 15
    // creature.go(RIGHT, 30) - ask the creature to walk right 30
    go(direction, distance) {
        let x = this.x_position;
        let y = this.y_position;

        if(direction === UP) {
            y = clamp(this.y_position - distance, MIN_Y_POSITION, MAX_Y_POSITION);
        }
        else if(direction === DOWN) {
            y = clamp(this.y_position + distance, MIN_Y_POSITION, MAX_Y_POSITION);
        }
        else if(direction === LEFT) {
            x = clamp(this.x_position - distance, MIN_X_POSITION, MAX_X_POSITION);
        }
        else if(direction === RIGHT) {
            x = clamp(this.x_position + distance, MIN_X_POSITION, MAX_X_POSITION);
        }
        else {
            console.error(`Unknown direction ${direction}`);
        }

        this.goto(x,y);
    }

    // creature.goto(225, 125) - ask the creature to walk to X = 225, Y = 125
    goto(x, y) { 
        this.stop();
        this.behavior = 'goto'; 
        // set busy to a very high number; the goto behavior resets it to 0 when 
        // the creature arrives at [goto_x, goto_y].
        this.busy = 1000;
        this.goto_x = clamp(x, MIN_X_POSITION, MAX_X_POSITION); 
        this.goto_y = clamp(y, MIN_Y_POSITION, MAX_Y_POSITION); 
    }

    // creature.eat("dinner") - Ask the creature to eat "dinner". The creature likes
    //                          dinner because it has 6 letters.
    // creature.eat("cake") - Ask the creature to eat "cake". The creature does
    //                        not like fish because it has 4 letters.
    // creature.eat("chocolate cake") - Ask the creature to eat "chocolate cake".
    //                                  The creature likes chocolate cake because
    //                                  it has 14 letters. The space counts as a
    //                                  letter!
    eat(word) {
        this.stop();

        if(word.length === 4) {
            this.angry(word.length * 6);
            console.error(`Please don't feed ${this.myName} 4-letter words!`);
            return;
        }

        this.behavior = 'eat';
        this.food = word;
        this.busy = word.length * 4; 
    }

    // creature.digest(4) - ask the creature to digest its food for 4 turns. Digesting 
    //                      food gives the creature energy.
    digest(turns) {
        this.behavior = 'digest';
        this.busy = turns;
    }

    // creature.angry(5) - ask the creature to be angry for 5 turns.
    angry(turns) {
        this.stop();
        this.behavior = 'angry';
        this.busy = clamp(turns, MIN_TURNS, MAX_TURNS);
    }

    // creature.cry(2) - ask the creature to cry for 2 turns.
    cry(turns) { 
        this.stop();
        this.behavior = 'cry'; 
        this.busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    }

    // creature.cheer(4) - ask the creature to cheer for 4 turns.
    cheer(turns) { 
        this.stop();
        this.behavior = 'cheer'; 
        this.busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    }

    // creature.hyper(8) - ask the creature to be hyper for 8 turns.
    hyper(turns) { 
        this.stop();
        this.behavior = 'hyper'; 
        this.busy = clamp(turns, MIN_TURNS, MAX_TURNS); 
    }

    // Checks whether the creature is starving. 
    isStarving() {
        return this.stomach <= 0;
    }

    // Checkws whether the creature is eating.
    isEating() {
        return this.isBusy() && this.behavior === 'eat';
    }

    // Checks whether the creature is exhausted.
    isExhausted() {
        return this.energy <= 0;
    }

    // Checks whether the creature is hyper.
    isHyper() {
        return this.energy >= ENERGY_CAPACITY;
    }

    // Checks whether the creature has a full stomach.
    isFull() {
        return this.stomach >= STOMACH_CAPACITY;
    }

    // checks whether the creature is running.
    isRunning(){
        return this.running;
    }

    // Checks whether the creature is doing something.
    isBusy() {
        return this.busy > 0;
    }

    // the creature's brain -- this is where it decides what it's going to do.
    // You can use `turn` to change the creature's behavior based on how long it's
    // been running.
    planMyThing(turn)
    {
        // Enforce the creature's basic needs. Basic needs override random behavior.
        if(this.isEating()){
            return;
        }
        else if(this.isStarving()){
            this.cry(1);
        }
        else if(this.isExhausted()) {
            this.sleep(30);
        }
        else if (this.isHyper()){
            this.hyper(1);
        }
        else if (OGOL.isFull()) {
            this.digest(1);
        }

        // If the creature is busy, then they keep doing what they were doing instead
        // of choosing something new.
        if (this.isBusy()){
            return;
        }

        // otherwise the creature does something random
        const chance = wholeNumberBetween(1, 100);
        
        let sleepChance = 10;
        if(this.energy < 250) sleepChance = 20;
        if(this.energy < 200) sleepChance = 30;
        if(this.energy < 150) sleepChance = 40;
        if(this.energy < 100) sleepChance = 50;
        
        let wanderChance = 60;
        if(this.energy > 500) wanderChance = 70;
        if(this.energy > 700) wanderChance = 80;
        if(this.energy > 900) wanderChance = 90;

        if(chance < sleepChance) {
            this.sleep(8);
        }
        else if(chance < wanderChance)
        {
            this.wander(10);
        }
        else {
            this.rest(5)
        }
    }

    // the creature's body -- this is where the creature does the thing the player asked
    // it to do or that it thought of.
    doMyThing()
    {
        // the creature is a little less busy each update.
        this.busy--;

        switch (this.behavior) {
            case 'sleep':
                this.animation = 'sleeping';
                this.energy += 8;
                this.stomach -= 1;
                break;

            case 'wander':
                this.animation = 'moving';
                this.energy -= 4;
                
                if (this.goto_x === null || this.goto_y === null) {
                    this.goto_x = wholeNumberBetween(MIN_X_POSITION, MAX_X_POSITION);
                    this.goto_y = wholeNumberBetween(MIN_Y_POSITION, MAX_Y_POSITION);
                }

                const x_speed = wholeNumberBetween(0, 8);
                const y_speed = wholeNumberBetween(0, 8);
                this.x_position = walk(this.x_position, this.goto_x, x_speed);
                this.y_position = walk(this.y_position, this.goto_y, y_speed);

                if (this.busy == 0) {
                    this.goto_x = null;
                    this.goto_y = null;
                }
                break;

            case 'goto':
                this.animation = 'moving';
                this.energy -= 6;

                this.x_position = walk(this.x_position, this.goto_x, GOTO_SPEED);
                this.y_position = walk(this.y_position, this.goto_y, GOTO_SPEED);

                if (this.x_position === this.goto_x && this.y_position === this.goto_y) {
                    this.busy = 0;
                    this.goto_x = null;
                    this.goto_y = null;
                }
                break;

            case 'digest':
                this.animation = 'cheerful';
                this.energy += 10;
                this.stomach -= 2;
                break;

            case 'rest':
                this.animation = 'moving';
                this.energy += 4;
                this.stomach -= 1;
                break;

            case 'eat':
                this.animation = 'eating';
                // eats 1 letter of the thing every 2 ticks
                if(this.busy % 2 === 1) {
                    this.food = this.food.substring(1);
                }
                this.stomach += 3;
                break;

            case 'cry':
                this.animation = 'crying';
                break;

            case 'angry':
                this.animation = 'angry';
                break;

            case 'hyper':
                this.animation = 'hyper';
                this.energy -= 10;
                break;

            case 'cheer':
                this.animation = 'cheerful';
                this.energy -= 3;
                break;
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
// these functions simulate the creature's behavior

// this object is used to ask the creature do do things
const OGOL = new Creature('OGOL');

// simulates a single turn of the creature's behavior
function simulate(turn, player) {
    // The creature does what the player asks them to do without thinking so that
    // the simulation doesn't run into a problem where the creature is starving
    // but the player can't feed them.
    if(player.hasCommand()) {
        player.command(OGOL);
    }
    else {
        OGOL.planMyThing(turn);
    }

    // if the creature's simulation is running, then tell it to do it's thing.
    if(OGOL.isRunning()) {
        OGOL.doMyThing();
    }
}


////////////////////////////////////////////////////////////////////////////////
// utilities -- these functions implement helpful algorithms

// get a random number between min and max
function wholeNumberBetween(min, max) {
    const range = max - min;
    return min + Math.round(Math.random() * range);
}

// moves from startingAt towards destination at speed without passing destination.
function walk(startingAt, destination, speed) {
    if (destination > startingAt) {
        return startingAt + Math.min(destination - startingAt, speed);
    }
    else if (destination < startingAt) {
        return startingAt - Math.min(startingAt - destination, speed);
    }
    else {
        return destination;
    }
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
    const position = [OGOL.x_position, OGOL.y_position];
    return { 
        position, 
        animation: OGOL.animation, 
        stats: { 
            name: OGOL.myName,
            stomach: OGOL.stomach, 
            energy: OGOL.energy 
        } 
    };
}
