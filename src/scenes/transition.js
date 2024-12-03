import Pinga from "../gameobjects/pinga";
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
    // else if (this.number === 10)
    //   this.loadOutro();
    else{
      if(this.number > 0){
        if(this.number==1)
          this.addHowToPickups();

        if(this.number==3)
          this.addHowToSuperPinga();

        this.addScore();
      }
      else
        this.addHowToPlay();

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
      if(this.registry.get("desktop")){
        this.space = this.add.bitmapText(
          this.center_width,
          550,
          "pixelFont",
          "Press SPACE to continue",
          20
        ).setOrigin(0.5);
      }else{
        this.space = this.add.bitmapText(
          this.center_width,
          550,
          "pixelFont",
          "Touch to continue",
          20
        ).setOrigin(0.5);
    }

    this.tweens.add({
      targets: this.space,
      duration: 300,
      alpha: { from: 0, to: 1 },
      repeat: -1,
      yoyo: true,
    });
      
      this.input.keyboard.on("keydown-ENTER", () => this.loadNext(), this);
      this.input.keyboard.on("keydown-SPACE", () => this.loadNext(), this);
      this.input.on('pointerdown', () => this.loadNext(), this);
      
      //Automatically start next stage in 30 seconds
      this.time.delayedCall(
        30000,
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
    Helper function to show the score and how to play
    */
  addScore() {
    this.scoreCoins = this.add
      .bitmapText(
        this.center_width,
        this.center_height - 75,
        "pixelFont",
        "Score:" + this.registry.get("score"),
        30
      )
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0.5)
      .setScrollFactor(0);
  }
  addHowToPlay() {
    this.add.bitmapText(
      this.center_width,
      this.height - 160,
      "pixelFont",
      "-HOW TO PLAY-\n\nClear pingas from the screen by grabbing\nmatching colours and dropping them\nto create a chain of 3 or more\n"
      + "\nClearing extra pingas within 2 seconds\nbuilds your combo multiplier\nfor extra points\n"
      + "\nClear the quota amount of pingas\nto finish the stage or clear\nthe entire screen of pingas for a bonus",
      12,1
    )
    .setOrigin(0.5)
  }

  addHowToSuperPinga() {
    this.add.bitmapText(
      this.center_width,
      this.height - 160,
      "pixelFont",
      "-SUPER PINGAS-\n\nSuper pingas act like normal pingas\nuntil you pick one up, which gives"
      + "\nyou super pinga power and enables you to\nclear all of a colour on the screen\nwhen you drop it."
      + "\n\nBut make sure when you drop it that you\nmake a chain of at least 3, otherwise\nit will turn back into a normal pinga"
      + "\nand is lost forever.",
      12,1
    ).setOrigin(0.5);
    this.superPingas = [
      new Pinga(this, this.center_width-180, this.center_height+50, 0, "superpinga"),
      new Pinga(this, this.center_width-130, this.center_height+50, 1, "superpinga"),
      new Pinga(this, this.center_width+100, this.center_height+50, 2, "superpinga"),
      new Pinga(this, this.center_width+150, this.center_height+50, 3, "superpinga")
    ];
  }

  addHowToPickups() {
    this.add.bitmapText(
      this.center_width,
      this.height - 220,
      "pixelFont",
      "-PICKUPS-\n\nGrab pickups for an advantage.",
      12,1
    ).setOrigin(0.5);
    this.add.bitmapText(
      this.center_width,
      this.height - 160,
      "pixelFont",
      "\n\n\nCOOKIES: \nAdds 2 seconds to time\nbetween rows being added."
      + "\n\n\nVITAMIN WATER: \nDoubles the score\nof pingas removed.",
      12,0
    ).setOrigin(0.5);
    this.pickups = [
      new Pinga(this, 25, this.center_height+110, 21, "cookie"),
      new Pinga(this, 25, this.center_height+170, 22, "water")
    ];
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
