export default class Outro extends Phaser.Scene {
  constructor() {
    super({ key: "outro" });
  }

  init(data) {
    this.isDead = data.isDead;
  }
  create() {
    this.width = this.sys.game.config.width;
    this.height = this.sys.game.config.height;
    this.center_width = this.width / 2;
    this.center_height = this.height / 2;
    this.introLayer = this.add.layer();
    this.splashLayer = this.add.layer();
    this.totalCoins = this.registry.get("score");
    this.text = [
      "You did it!!",
      "Total Score",
      "",
    ];

    if(this.isDead){
      this.text = [
        "GAME OVER",
        "Total Score",
        "",
      ];
    }
    if(this.registry.get("desktop"))
      this.text.push("Press SPACE");
    else
      this.text.push("TOUCH to Continue");

    // Reset score and dead
    this.registry.set("dead", 0);
    this.registry.set("score", 0);
    
    this.showHistory();
    this.playMusic();
    
    this.input.keyboard.on("keydown-SPACE", this.startSplash, this);
    this.input.keyboard.on("keydown-ENTER", this.startSplash, this);
    this.input.on('pointerdown', this.startSplash, this);
  }

  startSplash() {
    if (this.theme) this.theme.stop();
    this.scene.start("splash");
  }

  /*
    Helper function to show the text line by line
    */
  showHistory() {
    this.text.forEach((line, i) => {
      let size = 30;
      if(i>0) size = 20;
      this.time.delayedCall(
        (i) * 800,
        () => {
          this.showLine(line, (i + 1) * 50 + 100, size);
          if(i==3)
            this.showScore();
        },
        null,
        this
      );
    });
  }

  showLine(text, y, size) {
    let line = this.introLayer.add(
      this.add
        .bitmapText(this.center_width, y, "pixelFont", text, size)
        .setOrigin(0.5)
        .setAlpha(0)
    );
    this.tweens.add({
      targets: line,
      duration: 2000,
      alpha: 1,
    });
  }

  /*
    Helper function to show the total score
  */
  showScore() {
    this.scoreText = this.add
      .bitmapText(
        this.center_width,
        this.center_height-60,
        "pixelFont",
        this.totalCoins,
        30
      )
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0.5)
      .setScrollFactor(0);
    
  }

    
  playMusic(theme = "outro") {
    let temp;
    if(this.isDead)
      temp = "Lose";
    else
      temp = "Win";

    this.theme = this.sound.add(theme + temp);
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
