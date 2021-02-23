import Phaser from "phaser";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";

const config = {
  width: 620,
  height: 620,
  backgroundColor: 0x000000,
  type: Phaser.AUTO,
  scenes: [MenuScene, GameScene],
};

//creating the game object
const game = new Phaser.Game(config);
//adding scenes to the game
game.scene.add("menuScene", MenuScene);
game.scene.add("gameScene", GameScene);
//starting with menu scene
game.scene.start("menuScene");
