import Phaser from "phaser";
import Player from '../gameobjects/player';
import { sizes } from '../sizes';
import GameGrid from "../gameobjects/gamegrid";
import Pinga from "../gameobjects/pinga";
import { pingaColours } from "../pingacolours";

export default class GameScene extends Phaser.Scene{
  constructor(){
    super("game");
    this.player = null;
    this.gameGrid = new GameGrid(this);
    this.pingas = [];
    this.pointers = [];

    this.counterSeconds = 0;
    this.scoreText = null;
    this.levelFinished = false;
    this.quota = 100;
  }

  init(data) {
    this.name = data.name;
    this.number = data.number;
  }

  preload(){}

  create(){
    this.cameras.main.setBackgroundColor(0x181818);
    this.lights.enable().setAmbientColor(0x666666);
    this.cameras.main.setBounds(0, 0, 20920 * 2, 20080 * 2);
    this.physics.world.setBounds(0, 0, sizes.width, sizes.height);

    this.levelFinished = false;
    this.quota = 50 + (50*this.number);

    this.createLevel();
    this.addPlayer();
    
    this.loadAudios();
    this.playMusic();
    this.addHUD();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.counterSeconds++
    })
  }

  update(){
    this.player.update();
    this.drawPointers(this.player.gridPos);

    if(this.counterSeconds >= 10 - Phaser.Math.Clamp(this.number,0,5) && !this.levelFinished){
      this.counterSeconds=0;
      this.gameGrid.addRow(this.number);
      this.drawPingas();
    }

    if(this.checkGameLost() && !this.levelFinished){
      this.player.die();
      this.levelFinished = true;
      this.playAudio("lose");
    }

    if(this.checkGameWon() && !this.levelFinished && this.player.ballsInHand==0){
      this.levelFinished = true;
      this.player.anims.play("win");
      this.playAudio("win");
      this.finishScene();
    }
  }

  createLevel() {
    // Add a random background
    this.add.tileSprite(0, 0, sizes.width, sizes.height, "bg" + Phaser.Math.Between(1,8)).setOrigin(0)
      .setTint(0x666666).setTilePosition(0,10).setPipeline('Light2D');

    this.gameGrid.createGameGrid(this.number);
    this.drawPingas();  
  }

  // Draws the pingas on the screen using the gameGrid
  drawPingas(){
    this.pingas.forEach((pinga)=>pinga.destroy());
    this.pingas = [];
    for(let row = 0; row < sizes.rows; row++){
      for(let col = 0; col < sizes.columns; col++){
        if(this.gameGrid.grid[row][col] != 0){
          this.pingas.push(new Pinga(this, col * sizes.cellSize, row * sizes.cellSize, this.gameGrid.grid[row][col]-1));
        }
      }
    }
  }

  //Draws the pointers that help us to know where the pinga will fall/which pinga to take
  drawPointers(characterX){	
    this.pointers.forEach((pointer)=>pointer.destroy());
    this.pointer = [];
      
    let pointerColour = 0x333333;
    if(this.player.ballsInHand>0){
      //if we have pingas in hand we color the pointers with the pinga color
      pointerColour = pingaColours[this.player.ballsInHandType - 1];
    }
    
    for(let i = sizes.rows - 2; i>0; i--)
    {
      if (this.gameGrid.grid[i -1][characterX] != 0 && this.gameGrid.grid[i][characterX] == 0 || i == 0 && this.gameGrid.grid[i][characterX] == 0)
      {
        this.pointers.push(this.add.circle((characterX * sizes.cellSize)+16, sizes.cellSize*i, 2, pointerColour));
      }
      else if (this.gameGrid.grid[i][characterX] == 0)
      {
        this.pointers.push(this.add.circle((characterX * sizes.cellSize)+16, sizes.cellSize*i, 2, pointerColour));
      }
    }
  }

  //Checking if the game is lost - at least one pinga is on the last row
  checkGameLost(){
    let lost = false;
    let i = 0;
    while(!lost && i<sizes.columns) 
    {
      if (this.gameGrid.grid[sizes.rows - 1][i] != 0) 
      {
        lost = true;
      }
      i++;
    }
    return lost;
  }

  //Checking if the game is won - no pingas left on the grid or quota is meet
  checkGameWon(){
    let won = true;
    let i = 0;
    for(let row = 0; row < sizes.rows; row++){
      for(let col = 0; col < sizes.columns; col++){
        if(this.gameGrid.grid[row][col] != 0){
          won = false;
        }
      }
    }
    if(this.quota <= 0)
      won = true;

    return won;
  }

  /*
    Add the player to the game. The starting position of the player is the center/bottom of the grid.
    */
    addPlayer() { 
      this.player = new Player(this, (Math.floor(sizes.columns/2) * sizes.cellSize) - 16, ((sizes.rows-1) * sizes.cellSize)-8, Math.floor(sizes.columns/2),this.gameGrid );
    }
    
  
  loadAudios() {
    this.audios = {
      getwoosh: this.sound.add("woosh"),
      dropwoosh: this.sound.add("woosh"),
      footstep: this.sound.add("footstep"),
      impact: this.sound.add("impact"),
      pop: this.sound.add("pop"),
      lose: this.sound.add("lose"),
      win: this.sound.add("win")
    };
  }
  playAudio(key) {
    this.audios[key].play();
  }
  playAudioRandomly(key) {
    const volume = Phaser.Math.Between(0.8, 1);
    const rate = Phaser.Math.Between(0.8, 1);
    this.audios[key].play({ volume, rate },true);
  }
  playMusic(theme = "game") {
    this.theme = this.sound.add("music" + Phaser.Math.Between(0,3));
    this.theme.stop();
    this.theme.play({
    mute: false,
    volume: 0.6,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 0,
    });
  }

  addHUD() {
    this.add.rectangle(sizes.width-140,0,140,sizes.height, 0x333333,0.25).setOrigin(0);
    this.stageText = this.add
      .bitmapText(sizes.width - 130, 15, "pixelFont", "-Stage-\n" + (this.number+1), 15,1)
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0)
      .setScrollFactor(0);
    this.stageText.postFX.addBloom(this.colour,1,1,1,2,4);

    this.scoreText = this.add
      .bitmapText(sizes.width - 130, 75, "pixelFont", "-Score-\n" + this.registry.get("score"), 15,1)
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0)
      .setScrollFactor(0);
    this.scoreText.postFX.addBloom(this.colour,1,1,1,2,4);

    this.quotaText = this.add
      .bitmapText(sizes.width - 130, 130, "pixelFont", "-Quota-\n" + this.quota, 15,1)
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0)
      .setScrollFactor(0);
    this.quotaText.postFX.addBloom(this.colour,1,1,1,2,4);
    
  }

  /*
    This is called when the player finishes the level. It stops the music and it starts the transition scene increasing the stage number, so we will load the next stage.
    */
    finishScene() {
      this.time.delayedCall(
        1500,
        () => {
          if (this.theme) this.theme.stop();
          this.scene.start("transition", { name: "STAGE", number: this.number + 1 });
        },
        null,
        this
      );
    }
  
    /*
      This is called when the player dies. It flashes all the pingas, then
      It stops the music and it starts the transition scene without increasing the stage number and sets dead.
      */
    gameOver() {
      this.pingas.forEach((pinga)=>this.add.tween({
        targets: [pinga],
        tint: 0xffffff,
        duration: 1000,
        repeat: 0
      }));
      this.registry.set("dead",1);
      this.time.delayedCall(
        1000,
        () => {
          if (this.theme) this.theme.stop();
          this.scene.start("transition", { name: "STAGE", number: this.number });
        },
        null,
        this
      );
    }
  
    /*
      These are called when the player scores. It updates the quota and score from the registry and it adds a little tween effect to the score text.
      */
    updateScore(amount) {
      let newScore = +this.registry.get("score") + amount;
      this.registry.set("score", newScore);
      this.scoreText.setText("-Score-\n" + newScore);
      
      this.tweens.add({
        targets: [this.scoreText],
        scale: { from: 1.1, to: 1 },
        duration: 50,
        repeat: 1,
      });
    }

    updateQuota(amount) {
      this.quota = this.quota - amount;
      if(this.quota<0)
        this.quota=0;
      this.quotaText.setText("-Quota-\n" + this.quota);
      
      this.tweens.add({
        targets: [this.quotaText],
        scale: { from: 1.1, to: 1 },
        duration: 50,
        repeat: 1,
      });
    }

}