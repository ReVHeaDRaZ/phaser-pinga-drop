import { token } from "../token";
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
    this.totalScore = this.registry.get("score");
    this.text = [
      "Your a Champion!!",
      "Total Score",
      this.totalScore
    ];

    if(this.isDead){
      this.text = [
        "GAME OVER",
        "Total Score",
        this.totalScore
      ];
    }
    if(this.registry.get("desktop"))
      this.text.push("Press SPACE");
    else
      this.text.push("TOUCH to Continue");

    // Reset score and dead
    this.registry.set("dead", 0);
    this.registry.set("score", 0);

    // Check if score is within the top 10 of leaderboard, then prompt user for name and send highscore to database
    this.isTopTenScore(this.totalScore).then((isTopTen) => {
      if (isTopTen) {
        let playerName = prompt("Please enter your name for the highscore leaderboard.");
      
        if(playerName!=null){
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.open("POST", "http://localhost/pinga-drop-highscore.php", true);
          xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          
          const data = {
            name: playerName,
            score: this.totalScore,
            token: token
          };

          // Convert data to URL-encoded string
          const params = Object.keys(data)
          .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
          .join('&');
      
          xmlHttp.send(params);

          xmlHttp.onreadystatechange = function(){
            if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
              console.log("Highscore sent");
            }
          }
        }
        this.showText();
        this.playMusic();
      }else{
        this.showText();
        this.playMusic();    
      }
    });

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
  showText() {
    this.text.forEach((line, i) => {
      let size = 30;
      if(i == 1) size = 20;
      
      this.time.delayedCall(
        (i) * 500,
        () => {
          if(i==3){
            size = 25;
            this.showHighScores();

            let flashing = this.showLine(line, this.height - 50, size);
            this.tweens.add({
              targets: flashing,
              duration: 300,
              alpha: { from: 0, to: 1 },
              repeat: -1,
              yoyo: true,
            });
          }else
            this.showLine(line, (i + 1) * 50, size);
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
      duration: 1500,
      alpha: 1,
    });
    return line;
  }

  /*
    Helper functions for Highscores
  */  
  isTopTenScore(playerScore){
    return new Promise((resolve, reject) => {
      const xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", "http://localhost/pinga-drop-highscore.php", true);
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4){
          if(xmlHttp.status === 200) {
            const data = JSON.parse(xmlHttp.responseText);
            const lastScore = data[data.length-1].score;
            const isTopTen = playerScore > lastScore;
            resolve(isTopTen);
          }else{
              reject("Failed to load High Scores.");
          }
        }
      };  
      xmlHttp.send();
    });
  }
  
  showHighScores(){
    const scene = this;
    var xmlHttp = new XMLHttpRequest();
      xmlHttp.open("GET", "http://localhost/pinga-drop-highscore.php", true);
      xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            const data = JSON.parse(xmlHttp.responseText);
            // Display high scores
            scene.addHighScores(data);
        }
      };
    xmlHttp.send();
  }
  
  addHighScores(highscores) {
    let highscoreY = 215;
    let highScoreLayer = this.add.layer().setAlpha(0);
    highScoreLayer.add(this.add.bitmapText(this.center_width, highscoreY, "pixelFont", "-LEADERBOARD TOP 10-", 20).setOrigin(0.5));
    
    highscores.forEach((score, index) => {
      highScoreLayer.add(this.add.bitmapText(50, highscoreY  + (index+1) * 30, "pixelFont", score.name , 15,0).setOrigin(0));
      highScoreLayer.add(this.add.bitmapText(this.width - 50, highscoreY  + (index+1) * 30, "pixelFont", score.score, 15,0).setOrigin(1,0));
    });
    this.tweens.add({
      targets: highScoreLayer,
      duration: 1500,
      alpha: 1,
    });
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
