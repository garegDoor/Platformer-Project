class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 300;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 30;
        this.SCALE = 2.55;
        this.MAXVEL = 200;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 16, 16, 100, 20);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("Platformer Tiles", "tilemap_tiles");

        // Create layers
        this.groundLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.detailLayer = this.map.createLayer("Details", this.tileset, 0, 0);
        // no longer need spike layer as they are now objects
        //this.spikeLayer = this.map.createLayer("Spikes", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // add jump sound from load
        this.jumpSound = this.sound.add("audio_jump");
        
        // add death audio from load
        this.deathSound = this.sound.add("audio_death");

        // add coin audio from load
        this.coinSound = this.sound.add("audio_coin");

        // add win audio from load
        this.winSound = this.sound.add("audio_win");

        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Coins", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 2
        });
        
        this.spikes = this.map.createFromObjects("Spikes", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 183
        });

        this.ends = this.map.createFromObjects("End", {
            name: "end",
            key: "tilemap_sheet",
            frame: 0
        });

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.ends, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.spikeGroup = this.add.group(this.spikes);
        this.endGroup = this.add.group(this.ends);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 150, "tilemap_sheet", 300);
        //TODO: figure out how to replace character
        //my.sprite.player = this.physics.add.sprite(30, 150, "tilemap_tiles", "tile_0281.png");
        my.sprite.player.setCollideWorldBounds(true);

        // TODO: use this physics.add.collider to manage whether or not soft platforms should have collision based on whether or not the player is below them or not
        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // create bool to manage the game ending
        my.sprite.player.dead = false;
        this.gameWon = false;
        this.gameOver = false;

        // setup the ability to stop moving the player
        my.sprite.player.moves = true;

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.coinSound.play();
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            my.sprite.player.dead = true;
            this.gameOver = true;
            this.deathSound.play();
            obj2.destroy();
        });

        this.physics.add.overlap(my.sprite.player, this.endGroup, (obj1, obj2) => {
            this.gameWon = true;
            this.gameOver = true;
            this.winSound.play();
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);


        this.physics.world.drawDebug = false;

        // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['dirt_01.png', 'dirt_03.png'],
            random: true,
            scale: {start: 0.02, end: 0.04},
            maxAliveParticles: 8,
            lifespan: 300,
            gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();
        

        // camera code
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(25, 25);
        this.cameras.main.setZoom(this.SCALE);

        // Set an upper limit on how fast the player can move
        my.sprite.player.setMaxVelocity(this.MAXVEL, 10000);

        this.textDisplayed = false;
    }

    update() {
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        if (my.sprite.player.dead)
        {
            my.sprite.player.anims.play('dead');
            my.sprite.player.moves = false;
        }

        if (this.gameWon)
        {
            my.sprite.player.moves = false;
        }

        if (this.gameOver)
        {
            if (my.sprite.player.dead && !this.textDisplayed)
            {
                // the player has died
                this.deathText = this.add.text(my.sprite.player.x - 150, 100, 'You Died, Press R to Restart', { fontSize: '18px', color: '#FFF' });
                this.textDisplayed = true;
                
            }

            if (this.gameWon && !this.textDisplayed)
            {
                // the player made it to the end
                this.winText = this.add.text(my.sprite.player.x - 350, 100, 'You Won! Press R to Restart', { fontSize: '18px', color: '#FFF' });
                this.textDisplayed = true;
            }
        }
        
        if(cursors.left.isDown && my.sprite.player.moves) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            
            // particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();
                //my.sprite.player.setDragX(this.DRAG);

            }
            else {
                my.vfx.walking.stop();
            }

            

        } else if(cursors.right.isDown && my.sprite.player.moves) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            // particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-15, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();
                //my.sprite.player.setDragX(this.DRAG);

            }
            else {
                my.vfx.walking.stop();
            }
            

            // TODO: add another else if case for when the player pushes down arrow to fall through soft platforms
        } else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            if (!my.sprite.player.dead)
            {
                my.sprite.player.anims.play('idle');
            }
           
            // vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down && my.sprite.player.moves) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up) && my.sprite.player.moves) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();
        }

    }

}