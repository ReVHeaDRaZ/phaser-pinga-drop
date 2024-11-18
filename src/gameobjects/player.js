import Phaser from 'phaser'
import { sizes } from '../sizes';
import Pinga from './pinga';
import { pingaColours } from '../pingacolours';

class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, gridPos, gameGrid) {
    super(scene, x, y, "player");
    this.setOrigin(0);
    this.setScale(1);
    this.setDepth(10);
    this.scene.add.existing(this);
    
    this.gridPos = gridPos;
    this.gameGrid = gameGrid;
    this.ballsInHand = 0;
    this.ballsInHandType = 0;
    this.ballsStreak = 0;
    this.pingaSprites = [new Pinga(this.scene, this.x, this.y, 0).setScale(0.5).setDepth(11).setVisible(false), 
      new Pinga(this.scene, this.x, this.y, 0).setScale(0.5).setDepth(13).setVisible(false),
      new Pinga(this.scene, this.x, this.y, 0).setScale(0.5).setDepth(12).setVisible(false)
    ];
    this.pingaSprites.forEach((pinga)=>pinga.postFX.addBloom(0xffffff,1,1,1,3));

    // Keyboard Controls
    this.cursor = this.scene.input.keyboard.createCursorKeys();
    this.spaceBar = this.scene.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.SPACE );
    this.A = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.D = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.V = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.V);
    this.B = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);

    // Virtual Joystick and buttons for mobile
    this.scene.add.rectangle(0, sizes.height, sizes.width, sizes.controlsHeight, 0x181818).setOrigin(0).setScrollFactor(0).setDepth(4);

    this.leftButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.controlsOffset*0.75, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"leftButton")
      .setAlpha(0.25).setScrollFactor(0).setDepth(5), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
    });
    this.rightButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.controlsOffset*2, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"rightButton")
      .setAlpha(0.25).setScrollFactor(0).setDepth(5), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
    });
    this.grabButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.width-sizes.controlsOffset*2, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"grabButton")
      .setAlpha(0.25).setScrollFactor(0).setDepth(5), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
    });
    this.dropButton = scene.plugins.get('rexButton')
      .add(this.scene.add.sprite(sizes.width-sizes.controlsOffset*0.75, sizes.height + sizes.controlsHeight - sizes.controlsOffset,"dropButton")
      .setAlpha(0.25).setScrollFactor(0).setDepth(5), {
        // enable: true,
        mode: 0,              // 0|'press'|1|'release'
        // clickInterval: 100    // ms
    });
    this.scene.input.addPointer(1);
    
    this.leftButton.on('down', () => this.moveLeft());
    this.rightButton.on('down', () => this.moveRight());
    this.grabButton.on('down', () => this.grab());
    this.dropButton.on('down', () => this.drop());
  
 
    this.right = true;
    this.moving = false;
    this.grabbing = false;
    this.dead = false;

    this.init();
  }

  init() {
    //Animations
    if(!this.scene.anims.exists("idle")){
      this.scene.anims.create({
        key: "idle",
        frames: this.scene.anims.generateFrameNumbers('player', {start:0, end:1}),
        frameRate: 5,
        repeat: -1,
      });
      this.scene.anims.create({
        key: "run",
        frames: this.scene.anims.generateFrameNumbers("player", {start:4, end:7}),
        frameRate: 20,
        repeat: 0
      });
      this.scene.anims.create({
        key: "grab",
        frames: this.scene.anims.generateFrameNumbers("player", {start:8, end:9}),
        frameRate: 15,
        repeat: 0
      });
      this.scene.anims.create({
        key: "drop",
        frames: this.scene.anims.generateFrameNumbers("player", {start:8, end:9}),
        frameRate: 15,
        repeat: 0
      });
      
      this.scene.anims.create({
        key: "die",
        frames: this.scene.anims.generateFrameNumbers("player", {start:20, end:23}),
        frameRate: 10,
        repeat: 1
      });
      this.scene.anims.create({
        key: "win",
        frames: this.scene.anims.generateFrameNumbers("player", {start:24, end:31}),
        frameRate: 15,
        repeat: 0
      });
    }

    this.anims.play("idle", true);
    this.on("animationcomplete", this.animationComplete, this);

    // Add a light to follow player on update
    this.light = this.scene.lights.addLight(this.x, this.y, 350,0xffffff,0.35).setOrigin(0);
  }

  update() {
    // Constrain light and pingas to player
    this.light.x = this.x+16;
    this.light.y = this.y+32;

    this.pingaSprites.forEach((pinga,i) => {
      pinga.x = this.x + (i*1) + 35;
      pinga.y = this.y + (i*5) + 40;
      
      if(i>1){
        pinga.x = this.x + (i*1) + 28;
        pinga.y = this.y + (i*5) + 34;
      }

      pinga.setTint(pingaColours[this.ballsInHandType-1]);
      if(this.ballsInHand==0)
        pinga.setVisible(false);
      else if(this.ballsInHand > 0 && i==0)
        pinga.setVisible(true);
      else if(this.ballsInHand > 1 && i==1)
        pinga.setVisible(true);
      else if(this.ballsInHand > 2 && i==2)
        pinga.setVisible(true);
    });
    
    if (this.dead) return;
    
    if (Phaser.Input.Keyboard.JustDown(this.A)) this.moveLeft();
    if (Phaser.Input.Keyboard.JustDown(this.cursor.left)) this.moveLeft();
    
    if (Phaser.Input.Keyboard.JustDown(this.D)) this.moveRight();
    if (Phaser.Input.Keyboard.JustDown(this.cursor.right)) this.moveRight();

    if (Phaser.Input.Keyboard.JustDown(this.V)) this.grab();
    if (Phaser.Input.Keyboard.JustDown(this.B)) this.drop();

    if(!this.grabbing && !this.moving)
      this.anims.play("idle",true);
  }

  moveLeft(){
    if(!this.moving && !this.grabbing && this.gridPos > 0 && !this.dead){
      this.gridPos--;
      this.right = false;
      this.flipX = true;
      this.moving = true;
      this.anims.play("run",true);
      this.scene.playAudio("footstep");

      this.scene.tweens.add({
        targets: this,
        duration: 100,
        x: { from: this.x, to: this.x - sizes.cellSize },
        repeat: 0,
        onComplete: () => { this.moving=false }
      });
      
    }
  }
  moveRight(){
    if(!this.moving && !this.grabbing && this.gridPos < sizes.columns-1 && !this.dead){
      this.gridPos++;
      this.right = true;
      this.flipX = false;
      this.moving = true;
      this.anims.play("run",true);
      this.scene.playAudio("footstep");
      
      this.scene.tweens.add({
        targets: this,
        duration: 100,
        x: { from: this.x, to: this.x + sizes.cellSize },
        repeat: 0,
        onComplete: () => { this.moving=false }
      });
    }
  }

  grab() {
    if(!this.grabbing && !this.dead){
      this.grabbing = true;
      this.anims.play("grab", true);
      
      this.getBalls();
    }
  }

  drop() {
    if(!this.grabbing && !this.dead && this.ballsInHand>0){
      this.grabbing = true;
      this.anims.play("drop", true);
      this.scene.playAudio("dropwoosh");

      this.ballsStreak = this.ballsInHand >= 3;
      this.throwBalls();
      let ballX = this.gameGrid.getBallX(this.gridPos);
      this.gameGrid.markBalls(this.gridPos,ballX,this.ballsStreak);
      
    }
  }

  turn() {
    this.right = !this.right;
  }

  animationComplete(animation, frame) {
    if (animation.key === "grab" || animation.key === "drop") {
      this.grabbing = false;
    }
    if (animation.key === "run") {
      this.moving = false;
    }
    if (animation.key === "die"){
      this.scene.gameOver();
    }
  }

  
  die() {
    this.dead = true;
    this.anims.play("die", true);
  }

  //getting the balls from the game board
  getBalls(){
    let i = sizes.rows - 1;
    let exit = false;
    let ballGrabbed = false;
    while(i >= 0 && !exit)
    {
      if(this.gameGrid.grid[i][this.gridPos] != 0)
      {
        if (this.ballsInHandType == 0)
        {
          this.ballsInHandType = this.gameGrid.grid[i][this.gridPos];
          this.gameGrid.grid[i][this.gridPos] = 0;
          this.ballsInHand++;
          ballGrabbed=true;
          
          let tempPinga = new Pinga(this.scene, this.gridPos * sizes.cellSize, i * sizes.cellSize, this.ballsInHandType-1);
          this.scene.tweens.add({
            targets: tempPinga,
            y: sizes.height,
            duration: 100,
            onComplete: () => tempPinga.destroy()
          });
        }
        else
        {
          if(this.gameGrid.grid[i][this.gridPos] == this.ballsInHandType)
          {
            this.gameGrid.grid[i][this.gridPos] = 0;
            this.ballsInHand++;
            ballGrabbed=true;

            let tempPinga = new Pinga(this.scene, this.gridPos * sizes.cellSize, i * sizes.cellSize, this.ballsInHandType-1);
            this.scene.tweens.add({
              targets: tempPinga,
              y: sizes.height,
              duration: 100,
              onComplete: () => tempPinga.destroy()
            });
          }
          else 
          {
            exit = true;
          }
        }
      }
      i--;
    }
    if(ballGrabbed) this.scene.playAudio("getwoosh");
    this.scene.drawPingas();
  }

  //droping the balls from the character hands to the game board
  throwBalls() {
    let i = sizes.rows - 1;
    let found = false;
    while(i>=1 && !found)
    {
      if(this.gameGrid.grid[i - 1][this.gridPos] != 0)
      {
        found = true;
      }
      else
      {
        i--;
      }
    }
    if (found || i == 0)
    {
      let startLine = i;
      while(startLine < sizes.rows && this.ballsInHand > 0 && this.ballsInHandType != 0)
      {
        this.gameGrid.grid[startLine][this.gridPos] = this.ballsInHandType;
        startLine++;
        this.ballsInHand--;
        let tempPinga = new Pinga(this.scene, this.gridPos * sizes.cellSize, sizes.height, this.ballsInHandType-1);
          this.scene.tweens.add({
            targets: tempPinga,
            y: i * sizes.cellSize,
            duration: 100,
            onComplete: () => {
              tempPinga.destroy();
              this.scene.drawPingas();
              this.scene.playAudio("impact");
            }
          });
        if (this.ballsInHand == 0 || startLine == sizes.rows)
        {
          this.ballsInHandType = 0;
          this.ballsInHand = 0;
        }
      }
      if(this.ballsStreak)
      {
        this.ballsInHandType = 0;
        this.ballsInHand = 0;
      }
    }
    
  }

}

export default Player;