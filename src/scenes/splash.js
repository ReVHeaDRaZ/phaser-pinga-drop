import { PingaDebris } from "../gameobjects/particle";
import { pingaColours } from "../pingacolours";

export default class Splash extends Phaser.Scene {
  constructor() {
    super({ key: "splash" });
  }

  create() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;

    this.cameras.main.setBackgroundColor(0x000000);
    this.add.tileSprite(0,0,this.width,this.height,"title").setOrigin(0).setTint(0x333333).postFX.addBloom(0xffffff,1,1,1,3);
    this.time.delayedCall(1000, () => this.showInstructions(), null, this);

    this.input.keyboard.on("keydown-SPACE", () => this.startGame(), this);
    this.input.keyboard.on("keydown-ENTER", () => this.startGame(), this);
    this.input.on('pointerdown', () => this.startGame(), this);
    this.showTitle();
    this.playMusic();
  }

  startGame() {
    if (this.theme) this.theme.stop();
    this.scene.start("transition", {
      next: "game",
      name: "STAGE",
      number: 1,
      time: 30,
    });
  }

  /*
    Helper function to show the title letter by letter
    */
  showTitle() {
    let lineOne = "PINGA".split("");
    lineOne.forEach((letter, i) => {
      this.time.delayedCall(
        50 * (i + 1),
        () => {
          let text = this.add
            .bitmapText((60 * (i + 1) + 70), 0, "titleFont", letter, 100)
            .setTint(0xffcc00)
            .setOrigin(0.5)
            .setDropShadow(2, 4, 0xf09937, 0.25);
          text.postFX.addBloom(0xffffff,0.25,0.25,1,3);
          this.add.tween({
            targets: [text],
            y: 70,
            duration: 100,
            repeat: 0
          });
          Array(Phaser.Math.Between(1, 2))
            .fill(0)
            .forEach((i) => new PingaDebris(this, text.x, text.y, 30,30, pingaColours[Phaser.Math.Between(0,2)]).postFX.addBloom(0xffffff,1,1,1,3));
        },
        null,
        this
      );
    });

    let lineTwo = "DROP".split("");
    lineTwo.forEach((letter, i) => {
      this.time.delayedCall(
        50 * (i + 1) + 300,
        () => {          
          let text = this.add
            .bitmapText((60 * (i + 1) + 100), 0, "titleFont", letter, 100)
            .setTint(0xffcc00)
            .setOrigin(0.5)
            .setDropShadow(2, 4, 0xf09937, 0.25);
          text.postFX.addBloom(0xffffff,0.25,0.25,1,3);
          this.add.tween({
            targets: [text],
            y: 170,
            duration: 100,
            repeat: 0
          });
          Array(Phaser.Math.Between(1, 2))
            .fill(0)
            .forEach((i) => new PingaDebris(this, text.x, text.y, 30,30, pingaColours[Phaser.Math.Between(0,2)]).postFX.addBloom(0xffffff,1,1,1,3));
        },
        null,
        this
      );
    });

  }

  /*
    Helper function to play audio randomly to add variety.
    */
  playAudioRandomly(key) {
    const volume = Phaser.Math.Between(0.9, 1);
    const rate = Phaser.Math.Between(0.9, 1);
    this.sound.add(key).play({ volume, rate });
  }

  playMusic(theme = "splash") {
    this.theme = this.sound.add(theme);
    this.theme.stop();
    this.theme.play({
      mute: false,
      volume: 0.8,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    });
  }

  /*
    Generates the instructions text for the player.
    */
  showInstructions() {
    const scene = this;
    var xmlHttp = new XMLHttpRequest();
      //xmlHttp.open("GET", "http://localhost/pinga-drop-highscore.php", true); // For testing
      xmlHttp.open("GET", "https://razstuff.com/pinga-drop/pinga-drop-highscore.php", true);
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            const data = JSON.parse(xmlHttp.responseText);
            // Display or process the high scores
            scene.displayHighScore(data);
        }
      };
    xmlHttp.send();
    
    if(this.registry.get("desktop")){
      this.add
        .bitmapText(this.center_width, 300, "pixelFont", "A-D/Arrows: move", 20)
        .setOrigin(0.5);
      this.add
        .bitmapText(this.center_width, 350, "pixelFont", "V: GRAB", 20)
        .setOrigin(0.5);
      this.add
        .bitmapText(this.center_width, 400, "pixelFont", "B: DROP", 20)
        .setOrigin(0.5);
      this.add
        .bitmapText(this.center_width, 480, "pixelFont", "By RaZ", 15)
        .setOrigin(0.5);
      this.space = this.add
        .bitmapText(
          this.center_width,
          530,
          "pixelFont",
          "Press SPACE to start",
          20
        )
        .setOrigin(0.5);
    }else{
      this.add
        .bitmapText(this.center_width, 480, "pixelFont", "By RaZ", 15)
        .setOrigin(0.5);
      this.space = this.add
        .bitmapText(
          this.center_width,
          530,
          "pixelFont",
          "Touch to start",
          20
        )
        .setOrigin(0.5);
    }


    this.tweens.add({
      targets: this.space,
      duration: 300,
      alpha: { from: 0, to: 1 },
      repeat: -1,
      yoyo: true,
    });
  }


  displayHighScore(highscores) {
    let highscore = highscores[0];
    this.add.bitmapText(this.center_width, 240, "pixelFont", "-HIGHSCORE-\n" + highscore.name + ": " + highscore.score, 15,1).setOrigin(0.5);
  }
  
}
