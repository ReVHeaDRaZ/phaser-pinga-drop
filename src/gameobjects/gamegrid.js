import Phaser from "phaser";
import { sizes } from "../../src/sizes";
import Pinga from "./pinga";
import { pingaColours } from "../pingacolours";

export default class GameGrid{
  constructor(scene){
    this.grid = new Array(sizes.rows).fill(0).map(() => new Array(sizes.columns).fill(0));
    this.scene = scene;
  }

  createGameGrid(levelNumber){
    for(let row = 0; row < sizes.rows; row++){
      for(let col = 0; col < sizes.columns; col++){
        if (row < sizes.rows - 9){
          let randNo;
          do{
            randNo = Phaser.Math.Between(0,Phaser.Math.Clamp(levelNumber+1,3,pingaColours.length));
          } while (randNo == 0);

          //Chance to add a super pinga (1 in 20 - 5% chance) after level 3
          let chance = Phaser.Math.Between(0,21);
          if (chance == 10 && levelNumber > 2)
            this.grid[row][col] = randNo+10;
          else
            this.grid[row][col] = randNo;
        }
        else if (row < sizes.rows - 8){
          let chance = Phaser.Math.Between(0,5); // 16% chance
          if (chance == 0){
            this.grid[row][col] = 0;
          }
          else
          {
            this.grid[row][col] = Phaser.Math.Between(1,Phaser.Math.Clamp(levelNumber+1,3,pingaColours.length));
          }
        }
        else if (row < sizes.rows - 7){
          let chance = Phaser.Math.Between(0,4); // 20% chance
          if (this.grid[row-1][col] == 0 || chance == 0){
            this.grid[row][col] = 0;
          }
          else{
            this.grid[row][col] = Phaser.Math.Between(1,Phaser.Math.Clamp(levelNumber+1,3,pingaColours.length));
          }
        }
        else{
          //adding the empty spaces
          this.grid[row][col] = 0;
        }
      }
    }
    this.cookieSpawned = false;
    this.waterSpawned = false;
  }
  
  //method that adds a row of random pingas
  addRow(levelNumber){
    //moving the rows with one row below
    for(let i=sizes.rows - 1; i>0; i--){
      for(let j=0; j<sizes.columns; j++){
        this.grid[i][j] = this.grid[i - 1][j];
      }
    }
    
    //adding a new row
    for(let i=0; i<sizes.columns; i++){
      let randNo;
      do{
        randNo = Phaser.Math.Between(0,Phaser.Math.Clamp(levelNumber+1,3,pingaColours.length));
      } while (randNo == 0);
      
      //Chance to add a super pinga or pickup (1 in 20 - 5% chance)
      let chance = Phaser.Math.Between(0,21);
      if (chance == 10 && levelNumber > 2) // SuperPinga
        this.grid[0][i] = randNo+10;
      else if (chance == 5 && levelNumber > 0){ // Pickup
        let pickupType = Phaser.Math.Between(1,2) + 20;
        
        if(pickupType==21 && !this.cookieSpawned){
          this.grid[0][i] = pickupType;
          this.cookieSpawned = true;
        }
        else if(pickupType==22 && !this.waterSpawned){
          this.grid[0][i] = pickupType;
          this.waterSpawned = true;
        }
      }
      else
        this.grid[0][i] = randNo;
    }
  }

  //get the first row where it is a pinga and it's on the same column as the character
  getBallX(characterX){
    let i = sizes.rows;
    let found = false;
    while(i>=1 && !found)
    {
      if(this.grid[i - 1][characterX] > 0)
      {
        found = true;
      }
      i--;
    }
    return i;
  }

  //get the number of balls that are the same and are on the same column
  getSameBalls(ballY, ballX){
    let i = ballX;
    let ballsNo = 1;
    let ballType = this.grid[i][ballY];
    let stop = false;
    while(i>=1 && !stop) //changed from >=0
    {
      if(this.grid[i - 1][ballY] == ballType || this.grid[i - 1][ballY] == ballType+10){
        ballsNo++;
        i--;
      }else{
        stop = true;
      }
    }
    return ballsNo;
  }
  
  //get the number of balls that are the same
  isAStreak(column, row){
    let ballsNo = 1;
    let ballType = this.grid[row][column];
    let i = row - 1;
    while(i>0 && (this.grid[i][column] == ballType || this.grid[i][column] == ballType+10))
    {
      i--;
      ballsNo++;
    }
    i = row + 1;
    while(i<sizes.rows && (this.grid[i][column] == ballType || this.grid[i][column] == ballType+10) ) 
    {
      i++;
      ballsNo++;
    }

    return ballsNo;
  }

  //check same ball type at the top of the current ball
  checkBallTop(ballY, ballX, ballType){
    if(ballX > 0) 
    {
      ballX -= 1;
      let cBallType = this.grid[ballX][ballY];
      if(cBallType == ballType || cBallType == ballType+10) 
      {
        this.grid[ballX][ballY] = ballType * -1;
        this.checkBallTop(ballY, ballX, ballType);
        this.checkBallLeft(ballY, ballX, ballType);
        this.checkBallRight(ballY, ballX, ballType);
      }
    }
  }

  //check same ball type at the bottom of the current ball
  checkBallBottom(ballY, ballX, ballType){
    if(ballX < sizes.rows - 1) 
    {
      ballX += 1;
      let cBallType = this.grid[ballX][ballY];
      if(cBallType == ballType || cBallType == ballType+10) 
      {
        this.grid[ballX][ballY] = ballType * -1;
        this.checkBallBottom(ballY, ballX, ballType);
        this.checkBallLeft(ballY, ballX, ballType);
        this.checkBallRight(ballY, ballX, ballType);
      }
    }
  }

  //check same ball type at the left of the current ball
  checkBallLeft(ballY, ballX, ballType){
    if(ballY > 0) 
    {
      ballY -= 1;
      let cBallType = this.grid[ballX][ballY];
      if(cBallType == ballType || cBallType == ballType+10) 
      {
        this.grid[ballX][ballY] = ballType * -1;
        this.checkBallBottom(ballY, ballX, ballType);
        this.checkBallTop(ballY, ballX, ballType);
        this.checkBallLeft(ballY, ballX, ballType);
      }
    }
  }

  //check same ball type at the right of the current ball
  checkBallRight(ballY, ballX, ballType)
  {
    if(ballY < sizes.columns - 1) 
    {
      ballY += 1;
      let cBallType = this.grid[ballX][ballY];
      if(cBallType == ballType || cBallType == ballType+10) 
      {
        this.grid[ballX][ballY] = ballType * -1;
        this.checkBallBottom(ballY, ballX, ballType);
        this.checkBallTop(ballY, ballX, ballType);
        this.checkBallRight(ballY, ballX, ballType);
      }
    }
  }

  
  //remove the balls that needs to be destroyed due to the chain reaction and add a tempPinga with bloom effect
  removeAllBalls(ballType)
  {
    let score = 0;
    let scorePosition = {x:0, y:0};

    for(let i = 0; i<sizes.rows; i++){
      for(let j=0; j<sizes.columns; j++){
        if(this.grid[i][j] * -1 == ballType || this.grid[i][j] * -1 == ballType+10){
          this.grid[i][j] = 0;
          score++;
          let tempPinga = new Pinga(this.scene, j * sizes.cellSize, i * sizes.cellSize, ballType-1);
          tempPinga.postFX.addBloom(0xffffff,1,1,1,3);
          scorePosition.x = tempPinga.x;
          scorePosition.y = tempPinga.y;
          this.scene.tweens.add({
            targets: tempPinga,
            opacity: 0,
            duration: 300,
            delay: 100,
            onComplete: () => tempPinga.destroy()
          });
        }
      }
    }
    this.scene.updateCombo(scorePosition);
    this.scene.updateScore(score * 10 * this.scene.combo * this.scene.extraScoreMultiplier);
    this.scene.updateQuota(score);
    this.scene.playAudio("pop");
  }

  //deleting the empty space that are within the balls
  checkEmptySpaces()
  {
    for(let i = 0; i<sizes.columns; i++) 
    {
      for(let j = sizes.rows - 1; j>=1; j--) 
      {
        if(this.grid[j][i] != 0 && this.grid[j - 1][i] == 0) 
        {
          this.grid[j - 1][i] = this.grid[j][i];
          this.grid[j][i] = 0;
          if(this.grid[j-1][i] != this.grid[j+1][i]) 
          {
            let streak = this.isAStreak(i, j-1);
            if(streak >= 3) 
            {
              this.markBalls(i, j-1, streak);
            }
          }
          j = sizes.rows - 1;
        }
      }
    }
  }

  //detect the balls that are the same and cause chain reaction
  markBalls(ballY, ballX, ballsStreak)
  {
    let ballType = this.grid[ballX][ballY];
    if(this.getSameBalls(ballY, ballX) >= 3 || ballsStreak >= 3) 
    {
      this.grid[ballX][ballY] = ballType * -1;
      this.checkBallTop(ballY, ballX, ballType);
      this.checkBallBottom(ballY, ballX, ballType);
      this.checkBallLeft(ballY, ballX, ballType);
      this.checkBallRight(ballY, ballX, ballType);
      // Delayed calls to add a pause inbetween chain reactions
      this.scene.time.delayedCall(
        150,
        () => {
          this.scene.canAddRow = false;
          this.removeAllBalls(ballType);

          this.scene.time.delayedCall(
            275,
            () => {
              this.checkEmptySpaces();
              this.scene.drawPingas();
              this.scene.canAddRow = true;
            },
            null,this
          );
            
        },
        null,
        this
      );
      
    }

  }

  //detect the balls that are of a colour and cause chain reaction
  markAllBallsOfColour(ballY, ballX, ballsStreak){
    let ballType = this.grid[ballX][ballY];
    if(this.getSameBalls(ballY, ballX) >= 3 || ballsStreak >= 3){
      for(let i = 0; i<sizes.columns; i++){
        for(let j = sizes.rows - 1; j>=0; j--){
          if(this.grid[j][i] == ballType || this.grid[j][i] == ballType+10 || this.grid[j][i] == ballType-10)
            this.grid[j][i] = ballType * -1;
        }
      }
    
      // Delayed calls to add a pause inbetween chain reactions
      this.scene.time.delayedCall(
        150,
        () => {
          this.scene.canAddRow = false;
          this.removeAllBalls(ballType);

          this.scene.time.delayedCall(
            275,
            () => {
              this.checkEmptySpaces();
              this.scene.drawPingas();
              this.scene.canAddRow = true;
            },
            null,this
          );     
        },
        null,
        this
      );
    }
  }


}
