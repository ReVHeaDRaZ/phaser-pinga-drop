import { pingaColours } from "../pingacolours";

class Pinga extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, colour, name = "pinga") {
    super(scene, x, y, name);
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.name = name;
    this.setScale(1);
    this.setOrigin(0);

    scene.add.existing(this);

    this.init();
  }

  /*
    Inits the animation. Also adds light
    */
  init() {
    if(!this.scene.anims.exists(this.name)){
      this.scene.anims.create({
        key: this.name,
        frames: this.scene.anims.generateFrameNumbers(this.name, {
          start: 0,
          end: 6,
        }),
        frameRate: 10,
        repeat:-1
      });
    }

    this.anims.play(this.name, true);
    this.setTint(pingaColours[this.colour]);
  }

}

export default Pinga;
