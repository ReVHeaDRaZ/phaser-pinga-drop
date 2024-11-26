export default class Bootloader extends Phaser.Scene {
  constructor() {
    super({ key: "bootloader" });
  }

  preload() {
    this.createBars();
    this.load.on(
      "progress",
      function (value) {
        this.progressBar.clear();
        this.progressBar.fillStyle(0xf09937, 1);
        this.progressBar.fillRect(
          this.cameras.main.width / 4,
          this.cameras.main.height / 2 - 16,
          (this.cameras.main.width / 2) * value,
          16
        );
      },
      this
    );

    this.load.on(
      "complete",
      () => {
        this.scene.start("splash");
        //this.scene.start("transition", {name: "STAGE", number: 4});  // Use for testing levels
      },
      this
    );

    // Load in music (Set array to amount of songs used and copy music files to /assets/sounds/music/music0.mp3)
    Array(4)
      .fill(0)
      .forEach((_, i) => {
        this.load.audio(`music${i}`, `assets/sounds/music/music${i}.mp3`);
      });

      // Load Static images
      this.load.image("title", "assets/images/title.png");
      this.load.image("bg1", "assets/images/street-3.png");
      this.load.image("bg2", "assets/images/street-6.png");
      this.load.image("bg3", "assets/images/street-7.png");
      this.load.image("bg4", "assets/images/street-8.png");
      this.load.image("bg5", "assets/images/street-11.png");
      this.load.image("bg6", "assets/images/alley-2.png");
      this.load.image("bg7", "assets/images/alley-3.png");
      this.load.image("bg8", "assets/images/balcony-3.png");

      this.load.image("leftButton", "assets/images/leftButton.png");
      this.load.image("rightButton", "assets/images/rightButton.png");
      this.load.image("grabButton", "assets/images/grabButton.png");
      this.load.image("dropButton", "assets/images/dropButton.png");

      // Load Audio
      this.load.audio("woosh", "assets/sounds/woosh.mp3");
      this.load.audio("footstep", "assets/sounds/footstep_concrete_003.mp3");
      this.load.audio("impact", "assets/sounds/impactWood_light_000.mp3");
      this.load.audio("pop", "assets/sounds/pop.mp3");
      this.load.audio("lose", "assets/sounds/lose.mp3");
      this.load.audio("win", "assets/sounds/win.mp3");

      this.load.audio("splash", "assets/sounds/music/splash.mp3");
      this.load.audio("transition", "assets/sounds/music/transition.mp3");
      this.load.audio("outroWin", "assets/sounds/music/outro.mp3");
      this.load.audio("outroLose", "assets/sounds/music/outro.mp3");


    
    // Load fonts
    this.load.bitmapFont(
      "pixelFont",
      "assets/fonts/mario.png",
      "assets/fonts/mario.xml"
    );
    this.load.bitmapFont(
      "titleFont",
      "assets/fonts/namaku_0.png",
      "assets/fonts/namaku.xml"
    );
    this.load.bitmapFont(
      "arcadefont",
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );

    this.load.spritesheet("player", "assets/images/Larry_SpriteSheet.png", {
      frameWidth: 64, frameHeight: 64
    });
    
    this.load.spritesheet("pinga", "assets/images/pinga.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("superpinga", "assets/images/super_pinga.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    if (this.sys.game.device.os.desktop)
      this.registry.set("desktop", 1);
    else
      this.registry.set("desktop", 0);

    this.registry.set("score", 0);
    this.registry.set("dead", 0);
  }

  createBars() {
    this.loadBar = this.add.graphics();
    this.loadBar.fillStyle(0xca6702, 1);
    this.loadBar.fillRect(
      this.cameras.main.width / 4 - 2,
      this.cameras.main.height / 2 - 18,
      this.cameras.main.width / 2 + 4,
      20
    );
    this.progressBar = this.add.graphics();
  }
}
