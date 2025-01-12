import "./style.css";
import Phaser, { RIGHT } from "phaser";

// RESPONSIVENESS: make a sizes object
const sizes = {
  width: 500,
  height: 500,
};

const speedDown = 400;

const gameStartDiv = document.querySelector("#gameStartDiv");
const gameStartBtn = document.querySelector("#gameStartBtn");
const gameEndDiv = document.querySelector("#gameEndDiv");
const winOrLost = document.querySelector("#winOrLost");
const gameEndScore = document.querySelector("#gameEndScore");

const animals = ["apple1", "apple2", "apple3"];

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    this.player;
    this.cursor;
    this.playerSpeed = speedDown - 50;
    this.target;
    this.points = 0; //for collisions
    this.textScore;
    this.timedEvent;
    this.remainingTime;
    this.coinMusic;
    this.backgroundMusic;
    this.emitter;
  }

  preload() {
    //backgound image
    this.load.image("bg", "assets/bg.png");
    //basket image
    this.load.image("basket", "assets/basket.png");
    this.load.image("apple1", "assets/apple.png");
    this.load.image("apple2", "assets/apple2.png");
    this.load.image("apple3", "assets/apple3.png");
    this.load.audio("bgMusic", "assets/bgMusic.mp3");
    this.load.audio("coin", "assets/coin.wav");
    this.load.image("money", "assets/money.png");
  }
  create() {
    this.scene.pause("scene-game");
    this.coinMusic = this.sound.add("coin", { volume: 0.8 });
    this.backgroundMusic = this.sound.add("bgMusic", { volume: 0.5 });
    this.backgroundMusic.play();
    //references bg image
    this.add.image(0, 0, "bg").setOrigin(0, 0);
    //this.add.image(x,y position), setOrigin(point of reference)
    this.player = this.physics.add // adds physics to player
      .image(sizes.width / 2 - 50, 400, "basket")
      .setOrigin(0, 0); // ^ makes this the player cnotrolled element
    this.player.depth = 100; // z-index
    this.player.setImmovable(true); //makes the player not affected by other sprites
    this.player.body.allowGravity = false; // stops the player from falling
    this.player.setCollideWorldBounds(true); // stops the player from going out of the screen
    this.player
      .setSize(this.player.width / 2, this.player.height / 6)
      .setOffset(this.player.width / 4, (this.player.height * 9) / 10); // sets hitbox;

    this.target = this.physics.add.image(0, 0, "apple1").setOrigin(0, 0);
    this.target.setMaxVelocity(0, speedDown); // sets max horizontal and vertical velocity

    this.physics.add.overlap(
      this.player,
      this.target,
      this.targetHit,
      null,
      this
    ); // checks for overlap between player and target

    this.cursor = this.input.keyboard.createCursorKeys(); //creates a cursor object
    this.textScore = this.add.text(sizes.width - 120, 10, "Score: 0", {
      font: "25px Arial",
      fill: "#090a1f",
    });
    this.textTime = this.add.text(10, 10, "Remaining Time: 00", {
      font: "25px Arial",
      fill: "#090a1f",
    });

    this.timedEvent = this.time.delayedCall(30000, this.gameOver, [], this);
    this.emitter = this.add.particles(0, 0, "money", {
      speed: 100,
      gravityY: speedDown - 50,
      scale: 0.04,
      duration: 100,
      emitting: false,
    });

    this.emitter.startFollow(
      this.player,
      this.player.width / 2,
      this.player.height / 3
    );
  }
  // runs continuously
  update() {
    this.remainingTime = this.timedEvent.getRemainingSeconds();
    this.textTime.setText("Remaining Time: " + Math.round(this.remainingTime));
    const { left, right } = this.cursor; // destructures the cursor object to only move left right
    // pressing left and right settings
    if (left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    } else {
      this.player.setVelocityX(0);
    }

    //makes apple reset height
    if (this.target.y >= sizes.height) {
      this.target.setY(0);
      this.target.setX(this.getRandomX());
    }
  }
  getRandomX() {
    let newTexture = animals[Math.floor(Math.random() * animals.length)];
    this.target.setTexture(newTexture);
    let textureFrame = this.textures.getFrame(newTexture);
    this.target.body.setSize(textureFrame.width, textureFrame.height, true);
    return Math.floor(30 + Math.random() * (sizes.width - 60));
  }

  targetHit() {
    this.coinMusic.play();
    this.target.setY(0);
    this.target.setX(this.getRandomX());
    this.points++;
    this.textScore.setText("Score: " + this.points);
    this.emitter.start();
  }

  gameOver() {
    this.sys.game.destroy(true);
    gameEndScore.textContent = this.points;
    if (this.points >= 25) {
      winOrLost.textContent = "WIN!";
    } else {
      winOrLost.textContent = "LOST :((";
    }
    gameEndDiv.style.display = "flex";
  }
}

const config = {
  type: Phaser.WEBGL,
  /*dimension of your game window*/
  width: sizes.width,
  height: sizes.height,
  canvas: gameCanvas /*id of your canvas*/,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: speedDown },
    },
  },
  /* scene is the main game class */
  scene: [GameScene],
};

const game = new Phaser.Game(config);

gameStartBtn.addEventListener("click", () => {
  gameStartDiv.style.display = "none";
  gameEndDiv.style.display = "none";
  game.scene.resume("scene-game");
});
