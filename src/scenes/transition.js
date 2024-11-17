import { sizes } from "../sizes";
export default class Transition extends Phaser.Scene {
  constructor() {
    super({ key: "transition" });
  }

  init(data) {
    this.name = data.name;
    this.number = data.number;
    this.next = data.next;
  }

  /*
    This creates the elements of the transition screen.
    */
  create() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;
    this.cameras.main.setBackgroundColor(0x181818); //(0x00b140)//(0x62a2bf)
    this.add.tileSprite(0, 0, sizes.width, sizes.height+sizes.controlsHeight, "bg1").setOrigin(0).setScale(2).setScrollFactor(0,0).setTint(0x333333);

    //Load outro scene if out of live or finished game
    if (this.registry.get("dead") == 1)
      this.loadOutro(true);
    else if (this.number === 10)
      this.loadOutro();
    else{
      if(this.number>0)
        this.addScore();

      this.add
        .bitmapText(
          this.center_width,
          120,
          "titleFont",
          "PINGA\nDROP",
          80
        )
        .setTint(0xffcc00)
        .setOrigin(0.5)
        .setDropShadow(2, 4, 0xf09937, 0.25).postFX.addBloom(0xffffff,0.25,0.25,1,3);

      this.add
        .bitmapText(
          this.center_width,
          this.center_height - 10,
          "pixelFont",
          "Stage " + (this.number+1),
          30
        )
        .setOrigin(0.5);
      this.add
        .bitmapText(
          this.center_width,
          this.center_height + 30,
          "pixelFont",
          "Ready?",
          20
        )
        .setOrigin(0.5);
      
      this.input.keyboard.on("keydown-ENTER", () => this.loadNext(), this);
      this.input.keyboard.on("keydown-SPACE", () => this.loadNext(), this);
      this.input.on('pointerdown', () => this.loadNext(), this);
      this.time.delayedCall(
        4000,
        () => {
          this.loadNext();
        },
        null,
        this
      );

      this.playMusic();
    }
  }

  /*
    These functions are used to load the next scene
    */
  loadNext() {
    if (this.theme) this.theme.stop();
    this.scene.start("game", { name: this.name, number: this.number });
  }

  loadOutro(isDead = false) {
    if (this.theme) this.theme.stop();
    this.scene.start("outro", { name: this.name, number: this.number, isDead: isDead });
  }

  /*
    Helper function to show the score and hearts
    */
  addScore() {
    this.scoreCoins = this.add
      .bitmapText(
        this.center_width + 32,
        this.center_height - 75,
        "pixelFont",
        "Score:" + this.registry.get("score"),
        30
      )
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0.5)
      .setScrollFactor(0);
  }

  playMusic(theme = "transition") {
    this.theme = this.sound.add(theme);
    this.theme.stop();
    this.theme.play({
      mute: false,
      volume: 0.9,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    });
  }
}
