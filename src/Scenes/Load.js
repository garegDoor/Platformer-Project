class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        this.load.setPath("./assets/TileMap/");

        // Load tilemap information
        this.load.image("tilemap_tiles", "monochrome_tilemap_packed.png");                         // Packed tilemap

        this.load.setPath("./assets/");

        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        this.load.setPath("./assets/TileMap/");

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_transparent_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.setPath("./assets/");

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        // load the audio
        this.load.audio("audio_jump", ["jump.mp3"]);
        this.load.audio("audio_death", ["Trip.mp3"]);
        this.load.audio("audio_coin", ["pickupCoin.mp3"]);
        this.load.audio("audio_win", ["win.mp3"]);
    }

    create() {
        // this.anims.create({
        //     key: 'walk',
        //     frames: this.anims.generateFrameNames('platformer_characters', {
        //         prefix: "tile_",
        //         start: 0,
        //         end: 1,
        //         suffix: ".png",
        //         zeroPad: 4
        //     }),
        //     frameRate: 15,
        //     repeat: -1
        // });

        this.anims.create({
            key: 'walk',
            defaultTextureKey: "tilemap_sheet",
            frames: [
                { frame: 304 }, { frame: 303 }, { frame: 302 } 
            ],
            frameRate: 15,
            repeat: -1
        })

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "tilemap_sheet",
            frames: [
                { frame: 300 }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "tilemap_sheet",
            frames: [
                { frame: 305 }
            ],
        });

        this.anims.create({
            key: 'dead',
            defaultTextureKey: "tilemap_sheet",
            frames: [
                { frame: 306 }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}