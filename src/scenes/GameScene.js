//classes
import Phaser from "phaser";
import Square from "../square";
import { colors } from "../colors";

//assets
import s from "../assets/s.png";
import b from "../assets/b.png";
import bg from "../assets/background.png";
import reset from "../assets/reset_btn.png";
import clickSfx from "../assets/sfx/clicklow.mp3";

export default class GameScene extends Phaser.Scene {
  preload() {
    //sprites
    this.load.image("s", s);
    this.load.image("b", b);
    this.load.image("bg", bg);
    this.load.image("resetBtn", reset);

    //sfx
    this.load.audio("clickSfx", clickSfx);
  }

  create() {
    //game variables and states
    this.isActive = true;
    this.isGameOver = false;
    this.currPlayer = Math.round(Math.random()); //0 or 1
    this.iconsArr = [];
    this.placedArr = [];
    this.boardArr = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 4, 8],
      [2, 4, 6],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
    ];

    //sfx
    this.clickSfx = this.sound.add("clickSfx", { loop: false });

    //background
    const screenBackground = this.add.image(620, 600, "bg");
    screenBackground.setOrigin(1, 1);

    //starting state of text view
    this.setUpInitialText();

    //creating board of squares and adding listeners click events
    this.createBoard();
  }

  setUpInitialText() {
    this.currPlayer = this.currPlayer === 0 ? "O" : "X";
    this.stateTv = this.add.text(310, 80, `Player ${this.currPlayer}'s turn`, {
      fontSize: "45px",
      fontFamily: "Arial",
      color: "#ffffff",
      align: "center",
    });
    const bgColor = this.currPlayer === "O" ? colors.playerOColor : colors.playerXColor;
    this.stateTv.setBackgroundColor(bgColor);
    this.stateTv.setPadding(7, 5, 7, 5);
    this.stateTv.setOrigin(0.5, 0.5); //center
  }

  createBoard() {
    //square has default values
    const { startPosition, squareSize, squareHalf, squareColor } = new Square();

    let cellKey = 0;
    for (let row = 0; row < 3; row++) {
      let y = startPosition + squareHalf + squareSize * row + row * 10;
      for (let col = 0; col < 3; col++) {
        let x = startPosition + squareHalf + squareSize * col + col * 10;

        //create squares
        const square = this.add.rectangle(x, y, squareSize, squareSize, squareColor, 0.7);
        square.setStrokeStyle(1, "black", 1);

        //adding to the square properties
        square.position = {
          x: x,
          y: y,
        };
        square.cellKey = cellKey++;

        //click event
        square.setInteractive();
        this.attachEventListeners(square);
      }
    }
  }

  attachEventListeners(square) {
    square.on("pointerover", () => {
      this.onSquareHover(this.currPlayer, square, this.boardArr);
    });
    square.on("pointerout", () => {
      this.onSquareExit(square);
    });
    square.on("pointerdown", () => {
      if (this.isActive) {
        if (this.markSquare(this.currPlayer, square, this.boardArr)) {
          if (this.checkWin(this.currPlayer)) {
            this.gameOver(false);
          } else if (this.checkDraw(this.boardArr)) {
            this.gameOver(true);
          } else {
            this.togglePlayers();
          }
        }
      }
    });
  }

  onSquareHover(currPlayer, square, boardArr) {
    if (!this.isGameOver && boardArr[square.cellKey] === 0) {
      //adding image as property then when not hovering, destroy it
      square.icon = this.add.image(square.position.x, square.position.y, currPlayer === "X" ? "s" : "b");
      square.icon.setDisplaySize(75, 75);
      square.icon.setAlpha(0.5);
    }
  }

  onSquareExit(square) {
    //remove hover image
    if (square.icon) {
      square.icon.destroy();
      square.icon = null;
    }
  }

  markSquare(currPlayer, square, boardArr) {
    //checks if placed already
    if (boardArr[square.cellKey] !== 0) {
      return false;
    } else {
      //placing based on player
      boardArr[square.cellKey] = currPlayer === "X" ? 1 : 2;
      this.isActive = false; //can't place anything until disappear
      this.clickSfx.play(); ///sfx
      this.spawnIconOnSquare(currPlayer, square, this.iconsArr);
      return true;
    }
  }

  spawnIconOnSquare(currPlayer, square, iconsArr) {
    const icon = this.add.image(square.position.x, square.position.y, currPlayer === "X" ? "s" : "b");
    icon.setDisplaySize(75, 75);
    //needs to check if game over so it won't start timer to hide
    if (!this.checkWin(currPlayer) && !this.checkDraw(this.boardArr)) {
      this.hideIcons(square, icon);
      this.onSquareExit(square);
    }
    iconsArr.push(icon); //to show icons again at end game
  }

  //hide icons after a while
  hideIcons(square, icon) {
    setTimeout(() => {
      this.isActive = true; //can place again
      icon.setDisplaySize(0, 0);
      const placedTv = this.add.text(square.position.x, square.position.y, "Placed");
      placedTv.setStyle({ fontSize: "24px", fontFamily: "Arial", fill: "#000" });
      placedTv.setOrigin(0.5, 0.5); //center in square
      this.placedArr.push(placedTv);
    }, 650);
  }

  togglePlayers() {
    this.currPlayer = this.currPlayer === "X" ? "O" : "X"; //toggle
    const currPlayerString = `Player ${this.currPlayer}'s turn`;
    const bgColor = this.currPlayer === "X" ? colors.playerXColor : colors.playerOColor;
    this.updateStateText(currPlayerString, bgColor);
  }

  updateStateText(content, color) {
    this.stateTv.text = content;
    this.stateTv.setBackgroundColor(color);
  }

  //check if all elements in the board array are occupied
  checkDraw(boardArr) {
    return boardArr.every((element) => {
      return element !== 0;
    });
  }

  //check for at least one combination with every cell filled with same input
  checkWin(currPlayer) {
    const result = currPlayer === "X" ? 1 : 2;
    return this.winningCombinations.some((combination) => {
      return combination.every((element) => {
        return this.boardArr[element] === result;
      });
    });
  }

  gameOver(isDraw) {
    //game not active
    this.isActive = false;
    this.isGameOver = true; //for hover effect disable
    //display reset button to reload scene
    const resetBtn = this.add.sprite(310, 535, "resetBtn");
    resetBtn.setDisplaySize(200, 75);
    resetBtn.setOrigin(0.5, 0.5);
    resetBtn.setInteractive();
    resetBtn.on("pointerdown", () => {
      this.scene.restart();
    });

    //showing the icons at end game
    this.iconsArr.forEach((icon) => {
      icon.setDisplaySize(75, 75);
    });
    this.placedArr.forEach((placed) => {
      placed.setDisplaySize(0, 0);
    });

    //draw text
    if (isDraw) {
      this.updateStateText("It's a Draw!", colors.drawColor);
    } else {
      const color = this.currPlayer === "X" ? colors.playerXColor : colors.playerOColor;
      this.updateStateText(`Player ${this.currPlayer} has won!`, color);
    }
  }
}
