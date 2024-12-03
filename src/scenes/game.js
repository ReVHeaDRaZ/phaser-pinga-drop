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
    this.comboSeconds = 0;
    this.combo = 1;
    this.levelFinished = false;
    this.quota = 100;
    this.canAddRow = true; // Used to stop a row being added while chain reaction
    this.extraRowTime = 0; // Used to add time to row being added with cookie pickup
    this.extraScoreMultiplier = 1; // // Used to double points with water pickup
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

    // Reset game variables
    this.counterSeconds = 0;
    this.comboSeconds = 0;
    this.combo = 1;
    this.levelFinished = false;
    this.quota = 50 + (50*this.number);
    this.canAddRow = true; // Used to stop a row being added while chain reaction
    this.extraRowTime = 0; // Used to add time to row being added with cookie pickup
    this.extraScoreMultiplier = 1; // Used to double points with water pickup

    this.createLevel();
    this.addPlayer();
    
    this.loadAudios();
    this.playMusic();
    this.addHUD();

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.counterSeconds++
    });

    this.comboTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.comboSeconds--;
        if(this.comboSeconds < 0)
          this.comboSeconds = 0;
      }
    });
  }

  update(){
    // Draw player and pointers
    this.player.update();
    this.drawPointers(this.player.gridPos);

    // Adds a new row when counter seconds are greater than 10 - level number + extraRowTime (can't be less than 5 seconds)
    if(this.counterSeconds >= 10 - Phaser.Math.Clamp(this.number,0,5) + this.extraRowTime && !this.levelFinished && this.canAddRow){
      this.counterSeconds=0;
      this.gameGrid.addRow(this.number);
      this.drawPingas();
    }

    // Check for game lost/won
    if(!this.levelFinished && this.canAddRow && this.checkGameLost()){
      this.player.die();
      this.levelFinished = true;
      this.playAudio("lose");
    }

    if(!this.levelFinished && this.player.ballsInHand==0 && this.checkGameWon()){
      this.levelFinished = true;
      this.player.canMove = false;
      this.player.anims.play("win");
      this.playAudio("win");
      
      let stageCompletedText = this.add.bitmapText(
        sizes.width/2, sizes.height/2, "pixelFont", "STAGE COMPLETE", 5).setOrigin(0.5).setDepth(100).setAlpha(0);
      this.tweens.add({
        targets: [stageCompletedText],
        duration: 500,
        scale: 5,
        alpha: 1,
        ease: 'Back.easeInOut'
      });
      
      this.finishScene();
    }
  }

  //**********************METHODS*************************** */
  createLevel() {
    // Add a random background
    this.add.tileSprite(0, 0, sizes.width, sizes.height, "bg" + Phaser.Math.Between(1,8)).setOrigin(0)
      .setTint(0x666666).setTilePosition(0,10).setPipeline('Light2D');

    // Create and draw the gamegrid
    this.gameGrid.createGameGrid(this.number);
    this.drawPingas();  
  }

  // Adds the player to the game. The starting position of the player is the center/bottom of the grid.
  addPlayer() { 
    this.player = new Player(this, (Math.floor(sizes.columns/2) * sizes.cellSize) - 16, ((sizes.rows-1) * sizes.cellSize)-8, Math.floor(sizes.columns/2),this.gameGrid );
  }


  // Draws the pingas and pickups on the screen using the gameGrid
  drawPingas(){
    this.pingas.forEach((pinga)=>pinga.destroy());
    this.pingas = [];
    for(let row = 0; row < sizes.rows; row++){
      for(let col = 0; col < sizes.columns; col++){
        if(this.gameGrid.grid[row][col] != 0){
          
          if(this.gameGrid.grid[row][col] > 20){ // Pickups
            switch(this.gameGrid.grid[row][col]){
              case 21:
                this.pingas.push(new Pinga(this, col * sizes.cellSize, row * sizes.cellSize, this.gameGrid.grid[row][col], "cookie"));
                break;
              case 22:
                this.pingas.push(new Pinga(this, col * sizes.cellSize, row * sizes.cellSize, this.gameGrid.grid[row][col], "water"));
                break;
              default:
                break;
            }
          }
          else if(this.gameGrid.grid[row][col] > 10) // SuperPingas
            this.pingas.push(new Pinga(this, col * sizes.cellSize, row * sizes.cellSize, this.gameGrid.grid[row][col]-11,"superpinga"));
          else
            this.pingas.push(new Pinga(this, col * sizes.cellSize, row * sizes.cellSize, this.gameGrid.grid[row][col]-1));
        }
      }
    }
  }

  //Draws the pointers that help show where the pinga will fall/which pinga to take
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
      if (this.gameGrid.grid[sizes.rows - 1][i] > 0) 
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
    if(won==true){ // If board cleared give bonus(Initial Quota * 10)
      let bonusAmount = (50 + (50*this.number)) * 10; 
      this.updateScore(bonusAmount);
      let bonusText = this.add.bitmapText(
        sizes.width/2, (sizes.height/2)-100, "pixelFont", "BONUS-" + bonusAmount, 5).setOrigin(0.5).setDepth(100).setAlpha(0);
      this.tweens.add({
        targets: [bonusText],
        duration: 500,
        scale: 5,
        alpha: 1,
        ease: 'Back.easeInOut'
      });
    }
    if(this.quota <= 0)
      won = true;

    return won;
  }

    
  // Audio Functions
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

    this.pickupText = this.add
      .bitmapText(sizes.width - 140, 295, "pixelFont", "-Pickups-", 15,1)
      .setDropShadow(0, 4, 0x222222, 0.9)
      .setOrigin(0)
      .setScrollFactor(0);
    this.pickupText.postFX.addBloom(this.colour,1,1,1,2,4);

    this.pickupCookie = this.add
      .sprite(sizes.width - 100, 345, "cookie")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(0);
    this.pickupCookie.postFX.addBloom(this.colour,1,1,1,1,4);

    this.pickupWater = this.add
      .sprite(sizes.width - 45, 345, "water")
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(0);
    this.pickupWater.postFX.addBloom(this.colour,1,1,1,1,4);
    
  }

  /*
    This is called when the player finishes the level. 
    It stops the music and starts the transition scene increasing the stage number, so we will load the next stage.
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
      These are called when the player scores. It updates the quota, score from the registry, and combo.
      It also adds a little tween effect to the HUD text.
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

    updateCombo(scorePosition){
      if(this.comboSeconds > 0){
        this.comboTimer.reset({
          delay: 1000,
          loop: true,
          callback: () => {
            this.comboSeconds--;
            if(this.comboSeconds < 0)
              this.comboSeconds = 0;
          }
        });

        this.combo++;
        this.comboSeconds = 2;
        let comboText = this.add.bitmapText(
          scorePosition.x, scorePosition.y, "pixelFont", "X" + this.combo.toString(), 5).setOrigin(0).setDepth(100);
        this.tweens.add({
          targets: [comboText],
          duration: 800,
          scale: 8,
          alpha: 0,
          ease: 'Quad.easeIn',
          onComplete: () => comboText.destroy()
        });
      }else{
        this.combo = 1;
        this.comboSeconds = 2;
      }

    }

}