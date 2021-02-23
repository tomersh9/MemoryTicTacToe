import Phaser from "phaser";
import GameScene from "./GameScene.js";

import bg from "../assets/background.png";
import clickSfx from "../assets/sfx/clicklow.mp3";

export default class MenuScene extends Phaser.Scene {
  preload() {
    this.load.image("bg", bg);
    this.load.audio("clickSfx", clickSfx);
    this.scene.add("GameScene", GameScene);
  }

  create() {
    //sfx
    const clickSfx = this.sound.add("clickSfx", { loop: false });

    //background
    const screenBackground = this.add.image(620, 600, "bg");
    screenBackground.setOrigin(1, 1);

    //UI
    const titleTv = this.add.text(310, 100, "Memory Tic Tac Toe", { fontSize: "40px", fontFamily: "Arial", fill: "#000" });
    titleTv.setOrigin(0.5, 0.5);
    titleTv.setPadding(5);

    const descTv = this.add.text(310, 220, `The tiles will disappear after a short time,\nso remember where you have placed them :)`, { fontSize: "24px", fontFamily: "Arial", fill: "#000" });
    descTv.setOrigin(0.5, 0.5);

    const playBtn = this.add.text(310, 310, "Play", { fontSize: "40px", fontFamily: "Arial", fill: "#000" });
    playBtn.setOrigin(0.5, 0.5);
    playBtn.setPadding(10, 5, 10, 5);
    playBtn.setBackgroundColor("yellow");
    playBtn.setInteractive();
    playBtn.on("pointerdown", () => {
      clickSfx.play();
      this.scene.start("GameScene"); //start game scene
    });

    const aboutTv = this.add.text(310, 580, `Made by Tomer Shitrit for Effectivate`, { fontSize: "16px", fontFamily: "Arial", fill: "#fff" });
    aboutTv.setOrigin(0.5, 0.5);
  }
}
