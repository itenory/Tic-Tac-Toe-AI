function Game(gameMode, aiLevel, first, vsai){
  this.gameMode = gameMode;
  this.currentPlayer = first; // Human is player 1, AI/Human is player 2
  this.playingAI = vsai;
  this.numOfMoves = 0;
  this.player1AI = false;
  this.player2AI = vsai;

  if(vsai){ // If there is an ai player, create the object
    this.ai = new AI(aiLevel, gameMode);
  }

  //Makes sure methods are not declared multiply times.
  if(typeof this.startGame != "function"){
    console.log("Adding functions");

    /*
     * Starts game, draws game board
     */
    Game.prototype.startGame = function(){

      //Remove menu
      var menu = document.getElementById("menu");
      menu.parentNode.removeChild(menu);

      this.setbackEnd();
      this.setMouse();
      this.drawBoard();
    };

    Game.prototype.setbackEnd = function(){
      if(this.gameMode == 1){
        console.log("Setting up for Normal Mode.");
        this.board =
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ];
      }else if(this.gameMode == 2){
        console.log("Setting up for Ultimate Mode.");

        this.board =
        [

        ];
      }
    };

    Game.prototype.setMouse = function(){
      var canvas = document.getElementById("gameboard");
      var xPos = canvas.offsetLeft - canvas.scrollLeft + canvas.clientLeft;
      var yPos = canvas.offsetTop - canvas.scrollTop + canvas.clientTop;

      console.log(xPos);
      console.log(yPos);
      var mouseDown = function(game, event){
        game.numOfMoves++;

        var xPos = canvas.offsetLeft - canvas.scrollLeft + canvas.clientLeft;
        var yPos = canvas.offsetTop - canvas.scrollTop + canvas.clientTop;

        xPos = event.pageX - xPos;
        yPos = event.pageY - yPos;

        //Check if
        if(game.gameMode == 1){
          var iX = parseInt(xPos/200);
          var iY = parseInt(yPos/200);

          game.setPieceToPlayer(0, 0, iX, iY);
        }else if(game.gameMode == 2){
          var oX = (xPos%200);
          var oY = (xPos%200);
          var iX ;
          var iY ; 
          game.setPieceToPlayer(oX, oY, iX, iY);
        }
        // console.log(event.pageX - xPos);
        // console.log(event.pageY - yPos);
      };

      canvas.addEventListener("mousedown", 
        function(game){
          return function (){mouseDown(game, event);}
        }(this)
        , false);
    }

    Game.prototype.drawBoard = function(){
      console.log("Drawing board");

      //Try first with webgl, if it doesn't work than use svgs
      var canvas = document.getElementById("gameboard");
    };

    /*
     * Draws board using svg rather than webgl
     */
    Game.prototype.drawBoardAlt = function(){
    }

    /*
     * Sets the piece of the board for the player
     */
    Game.prototype.setPieceToPlayer = function(outerX, outerY, innerX, innerY){
      if(this.gameMode == 1){
        //Check for valid move
        if(this.board[innerX][innerY] != 0){
          console.log("Invalid move.");
          return;
        }

        this.board[innerX][innerY] = this.currentPlayer;
        console.log(this.board);

        if(this.gameOver()){ //Check if game is over
          console.log("Game over. Player " + this.currentPlayer + " wins!");
          return;
        }

        this.currentPlayer = (this.currentPlayer%2) + 1;
        this.numOfMoves++;

        //If the next player is an AI, then get their move
        if((this.currentPlayer == 1 && this.player1AI) || (this.currentPlayer == 2 && this.player2AI)){
          var move = ai.getMove(this.board, this.currentPlayer, null);
          this.setPieceToPlayer(0, 0, move.innerX, move.innerY);
        }

      }else if(this.gameMode == 2){
        if(board[outerX][outerY][innerX][innerY] != 0){ // Check for valid move
          console.log("invalid move!");
          return;
        }

        this.board[outerX][outerY][innerX][innerY] = this.currentPlayer;

        if(this.gameOver()){ // Check if game is over
          console.log("Game Over. Player "+ this.currentPlayer + " wins!");
          return;
        }

        this.currentPlayer = (this.currentPlayer % 2) + 1;
        this.numOfMoves++;

        //If the next player is AI, then get their move, else set up next player's move.
        if((this.currentPlayer == 1 && this.player1AI) || (this.currentPlayer == 2 && this.player2AI)){
          var move = ai.getMove(this.board, this.currentPlayer, null);
          this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
        }else{ 
          //Set up next player's move

        }
      }
    };

    Game.prototype.gameOver = function(){
      if(this.gameMode == 1){ // Normal mode
        if(this.board[0][0] != 0){
          if(this.board[0][0] == this.board[0][1] && this.board[0][0] == this.board[0][2]){ // Left col
            return true;
          }

          if(this.board[0][0] == this.board[1][1] && this.board[0][0] == this.board[2][2]){ //Left Diag
            return true;
          }

          if(this.board[0][0] == this.board[1][0] && this.board[0][0] == this.board[2][0]){ // Top row
            return true;
          }
        }

        if(this.board[2][0] != 0){
          if(this.board[2][0] == this.board[1][1] && this.board[2][0] == this.board[0][2]){ // Right diag
            return true;
          }

          if(this.board[2][0] == this.board[2][1] && this.board[2][0] == this.board[2][2]){ // Right col=
            return true;
          }
        }

        if(this.board[1][2] != 0){
          if(this.board[1][2] == this.board[1][1] && this.board[1][2] == this.board[1][0]){ // Middle col
            return true;
          }

          if(this.board[1][2] == this.board[0][2] && this.board[1][2] == this.board[2][2]){ // Bottom row
            return true;
          }
        }

        if(this.board[0][1] != 0 && this.board[0][1] == this.board[1][1] && this.board[0][1] == this.board[1][2]){ // Middle row
          return true;
        }

        return false;
      }else if(this.gameMode == 2){ // Ultimate mode



        return false;
      }
    }

    Game.prototype.endScene = function(){

    }

  }

}
