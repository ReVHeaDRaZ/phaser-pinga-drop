import Phaser from "phaser";

export class Smoke extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, color = 0xffffff, gravity = false) {
    width = width || Phaser.Math.Between(5, 15);
    height = height || Phaser.Math.Between(5, 15);
    super(scene, x, y, width, height, color);
    scene.add.existing(this);
    this.color = color;
    this.init();
  }
  init() {
  this.scene.tweens.add({
    targets: this,
    duration: 800,
    scale: { from: 1, to: 0 },
    onComplete: () => {
      this.destroy();
    },
    });
  }
}

export class RockSmoke extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height, color = 0xffeaab, gravity = false) {
    width = width || Phaser.Math.Between(30, 55);
    height = height || Phaser.Math.Between(30, 55);
    super(scene, x, y, width, height, color);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setVelocityY(-100);
    this.init();
  }
  init() {
    this.scene.tweens.add({
      targets: this,
      duration: 800,
      scale: { from: 1, to: 0 },
      onComplete: () => {
        this.destroy();
      },
    });
  }
}

export class PingaDebris extends Phaser.GameObjects.Ellipse {
  constructor(scene, x, y, width, height, color = 0xffeaab, gravity = false) {
    width = width || Phaser.Math.Between(5, 15);
    height = height || Phaser.Math.Between(5, 15);
    super(scene, x, y, width, height, color);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.setVelocityX(Phaser.Math.Between(-50, 50));
    this.body.setVelocityY(width * height * 2);
    this.setDepth(50);
    this.init();
  }
  init() {
    this.scene.tweens.add({
      targets: this,
      duration: 1800,
      scale: { from: 1, to: 0.5 },
      onComplete: () => {
        this.destroy();
      },
    });
  }
}

export class PickupDebris extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, color = 0xf8b972, width, height, gravity = false) {
    width = width || Phaser.Math.Between(2, 5);
    height = height || Phaser.Math.Between(2, 5);
    super(scene, x + 16, y + 16, width, height, color);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(true);
    this.body.setVelocityX(Phaser.Math.Between(-50, 50));
    this.body.setVelocityY(width * height);
    this.setDepth(50);
    this.setOrigin(0);
    this.init();
  }
  init() {
    this.scene.tweens.add({
      targets: this,
      duration: 1000,
      scale: { from: 1, to: 0.5 },
      opacity: {from: 1, to: 0},
      onComplete: () => {
        this.destroy();
      },
    });
  }
}