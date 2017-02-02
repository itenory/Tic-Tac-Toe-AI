function Game(gameMode, aiLevel, first, vsai1, vsai2){
  //Game Options
  this.gameMode = gameMode;
  this.currentPlayer = first;
  this.numOfMoves = 0;
  this.player1AI = vsai1;
  this.player2AI = vsai2;

  this.gameDone = false;
  
  if(vsai1){ // Sets player 1 as AI
    this.ai1 = new AI(aiLevel, gameMode, 1);
  }
  if(vsai2){ // Sets player 2 as AI
    this.ai2 = new AI(aiLevel, gameMode, 2);
  }
  if(gameMode == 2){
    this.boardsWon = [0,0,0,0,0,0,0,0,0]; // Keep track of what single boards are won
    this.lastMove = null;
  }

  //Makes sure methods are not declared multiply times.
  if(typeof this.startGame != "function"){

    /*
     * Sets the backend copy of the board and draws the game board
     */
    Game.prototype.startGame = function(){
      
      this.setbackEnd();

      var title = document.getElementById("header");

      if(this.gameMode == 1){
        title.innerHTML = "Tic Tac Toe";
      }else{
        title.innerHTML = "Ultimate Tic Tac Toe"
      }
      //If AI goes first, get and set their move.
      if(this.player1AI && this.currentPlayer == 1){
        var move = this.ai1.getMove(this.board, -1, -1);
      
        //Perform click for AI 
        if(this.gameMode == 1){
          var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
        }else if(this.gameMode == 2){
          var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
        }
        elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
        
        this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY)
      }else if(this.player2AI && this.currentPlayer == 2){
        var move = this.ai2.getMove(this.board, -1, -1);
         
        //Perform click for AI
        if(this.gameMode == 1){
          var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
        }else if(this.gameMode == 2){
          var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
        }
        elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
        
        this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
      }
    };

    /*
     * Sets up the backend for the board depending on the game mode
     */
    Game.prototype.setbackEnd = function(){
      if(this.gameMode == 1){
        this.board =
        [
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0]
        ];
      }else if(this.gameMode == 2){
        this.board =
        [
          [ [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // 0
            [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0]]],
          [ [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // 1
            [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0]]],
          [ [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // 2
            [[0 ,0, 0], [0, 0, 0], [0, 0, 0]],
            [[0, 0, 0], [0, 0, 0], [0, 0, 0]]]
          ];
      }
    };

    /*
     * Sets the piece of the board for the player
     */
    Game.prototype.setPieceToPlayer = function(outerX, outerY, innerX, innerY){
      if(this.gameMode == 1){
        //Check for valid move
        if(this.board[innerX][innerY] != 0){
          alert("Invalid Move");
          return;
        }

        this.board[innerX][innerY] = this.currentPlayer;

        if(this.gameOver()){ //Check if game is over   
          this.gameDone = true;
          this.endScene();
          return;
        }

        this.currentPlayer = (this.currentPlayer%2) + 1;
        this.numOfMoves++;

        //If the next player is an AI, then get their move
        if(this.currentPlayer == 1 && this.player1AI){
          var move = this.ai1.getMove(this.board, null, null);

          //Perform click for AI only for SVG version
          var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
          elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
        
          this.setPieceToPlayer(0, 0, move.innerX, move.innerY);

        }else if(this.currentPlayer == 2 && this.player2AI){
          var move = this.ai2.getMove(this.board, null, null);

          //Perform click for AI only for SVG version
          var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
          elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
          
          this.setPieceToPlayer(0, 0, move.innerX, move.innerY);
        }
      }else if(this.gameMode == 2){
        //Check for invalid move
        if(this.board[outerX][outerY][innerX][innerY] != 0 || this.boardsWon[(outerX*3) + outerY] != 0 || (this.lastMove && (outerX != this.lastMove.innerX || outerY != this.lastMove.innerY))){
          
          //Reset piece
          var elem = document.getElementById(outerX + "" + outerY + "" + innerX + "" + innerY);
          elem.setAttributeNS(null, 'class', 'piece');
          alert("Invalid Move");
          return;
        }

        this.board[outerX][outerY][innerX][innerY] = this.currentPlayer;

        //If single is won, mark it currentPlayer, if tied, mark it -1
        if(this.boardWon(outerX, outerY)){
          this.boardsWon[(outerX*3) + outerY] = this.currentPlayer;
        }else if(this.boardTied(outerX, outerY)){
          this.boardsWon[outerX*3 + outerY] = -1;
        }

        if(this.gameOver()){ // Check if game is over
          this.gameDone = true;
          this.endScene();
          return;
        }

        //Check if next play gets to play anywhere.
        if(this.boardsWon[(innerX*3) + innerY] != 0){
          this.lastMove = null;
          innerX = -1;
          innerY = -1;
        }else{
          this.lastMove = {outerX: outerX, outerY: outerY, innerX: innerX, innerY: innerY};
        }

        this.currentPlayer = (this.currentPlayer % 2) + 1;
        this.numOfMoves++;

        //If the next player is AI, then get their move
        if(this.currentPlayer == 1 && this.player1AI){
          var move = this.ai1.getMove(this.board, innerX, innerY);

          //Perform click for AI only for SVG version
          var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
          elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
          
          this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
        }else if(this.currentPlayer == 2 && this.player2AI){
          var move = this.ai2.getMove(this.board, innerX, innerY);

          //Perform click for AI only for SVG version
          var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
          elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
          this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
        }
      }
    };

    /*
     * Checks if game is over for all modes by looking for wins and ties.
     * return Returns the true if the game is over, false otherwise
     */
    Game.prototype.gameOver = function(){
      //Check for tie
      if(this.gameMode == 1){ // Normal mode
        if(this.board[0][0] != 0){
          if(this.board[0][0] == this.board[1][0] && this.board[0][0] == this.board[2][0]){ // Left col
            return true;
          }

          if(this.board[0][0] == this.board[1][1] && this.board[0][0] == this.board[2][2]){ //Left Diag
            return true;
          }

          if(this.board[0][0] == this.board[0][1] && this.board[0][0] == this.board[0][2]){ // Top row
            return true;
          }
        }

        if(this.board[0][2] != 0){
          if(this.board[0][2] == this.board[1][1] && this.board[0][2] == this.board[2][0]){ // Right diag
            return true;
          }

          if(this.board[0][2] == this.board[1][2] && this.board[0][2] == this.board[2][2]){ // Right col=
            return true;
          }
        }

        if(this.board[2][1] != 0){
          if(this.board[2][1] == this.board[1][1] && this.board[2][1] == this.board[0][1]){ // Middle col
            return true;
          }

          if(this.board[2][1] == this.board[2][0] && this.board[2][1] == this.board[2][2]){ // Bottom row
            return true;
          }
        }

        if(this.board[1][0] != 0 && this.board[1][0] == this.board[1][1] && this.board[1][0] == this.board[1][2]){ // Middle row
          return true;
        }

        //Only a tie stops the game
        return this.gameTied();
      }else if(this.gameMode == 2){ // Ultimate mode
        if(this.gameWon()){
          return true;
        }
        //Only a tie stops the game
        return this.gameTied();
      }
    };

    /* ! ULTIMATE VERSION ONLY !
     * Checks if a single board for ultimate verison is won
     * oX The x of the board to check
     * oY The y of the board to check
     * return Returns true if a single board is won
     */
    Game.prototype.boardWon = function(oX, oY){
      if(this.board[oX][oY][0][0] != 0){
          if(this.board[oX][oY][0][0] == this.board[oX][oY][1][0] && this.board[oX][oY][0][0] == this.board[oX][oY][2][0]){ // Left col
            return true;
          }

          if(this.board[oX][oY][0][0] == this.board[oX][oY][1][1] && this.board[oX][oY][0][0] == this.board[oX][oY][2][2]){ //Left Diag
            return true;
          }

          if(this.board[oX][oY][0][0] == this.board[oX][oY][0][1] && this.board[oX][oY][0][0] == this.board[oX][oY][0][2]){ // Top row
            return true;
          }
      }

      if(this.board[oX][oY][0][2] != 0){
        if(this.board[oX][oY][0][2] == this.board[oX][oY][1][1] && this.board[oX][oY][0][2] == this.board[oX][oY][2][0]){ // Right diag
          return true;
        }

        if(this.board[oX][oY][0][2] == this.board[oX][oY][1][2] && this.board[oX][oY][0][2] == this.board[oX][oY][2][2]){ // Right col
          return true;
        }
      }

      if(this.board[oX][oY][2][1] != 0){
        if(this.board[oX][oY][2][1] == this.board[oX][oY][1][1] && this.board[oX][oY][2][1] == this.board[oX][oY][0][1]){ // Middle col
          return true;
        }

        if(this.board[oX][oY][2][1] == this.board[oX][oY][2][0] && this.board[oX][oY][2][1] == this.board[oX][oY][2][2]){ // Bottom row
          return true;
        }
      }

      if(this.board[oX][oY][1][0] != 0 && this.board[oX][oY][1][0] == this.board[oX][oY][1][1] && this.board[oX][oY][1][0] == this.board[oX][oY][1][2]){ // Middle row
        return true;
      }
      return false;
    }

    /* ! ULTIMATE VERSION ONLY !
     *  Checks if a single board is tied by looking for at least 1 possible move
     * outerX The x position of the board
     * outerY The y position of the board
     * return Returns true if theres a possible move, false otherwise
     */
    Game.prototype.boardTied = function(outerX, outerY){
      for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
          if(this.board[outerX][outerY][i][j] == 0){
            return false;
          }
        }
      }
      return true;
    };

    /*
     * Checks if game is won for any game mode. Doesn't not account for ties.
     * return Returns true if game is won, false otherwise.
     */
    Game.prototype.gameWon = function(){
      if(this.gameMode == 1){
        if(this.board[0][0] != 0){
          if(this.board[0][0] == this.board[1][0] && this.board[0][0] == this.board[2][0]){ // Left col
            return true;
          }

          if(this.board[0][0] == this.board[1][1] && this.board[0][0] == this.board[2][2]){ //Left Diag
            return true;
          }

          if(this.board[0][0] == this.board[0][1] && this.board[0][0] == this.board[0][2]){ // Top row
            return true;
          }
        }

        if(this.board[0][2] != 0){
          if(this.board[0][2] == this.board[1][1] && this.board[0][2] == this.board[2][0]){ // Right diag
            return true;
          }

          if(this.board[0][2] == this.board[1][2] && this.board[0][2] == this.board[2][2]){ // Right col=
            return true;
          }
        }

        if(this.board[2][1] != 0){
          if(this.board[2][1] == this.board[1][1] && this.board[2][1] == this.board[0][1]){ // Middle col
            return true;
          }

          if(this.board[2][1] == this.board[2][0] && this.board[2][1] == this.board[2][2]){ // Bottom row
            return true;
          }
        }

        if(this.board[1][0] != 0 && this.board[1][0] == this.board[1][1] && this.board[1][0] == this.board[1][2]){ // Middle row
          return true;
        }
      }else if(this.gameMode == 2){
        //Condition for a win
        if(this.boardsWon[0] != 0){
          if(this.boardsWon[0] == this.boardsWon[3] && this.boardsWon[0] == this.boardsWon[6]){ // Left col
            return true;
          }

          if(this.boardsWon[0] == this.boardsWon[4] && this.boardsWon[0] == this.boardsWon[8]){ //Left Diag
            return true;
          }

          if(this.boardsWon[0] == this.boardsWon[1] && this.boardsWon[0] == this.boardsWon[2]){ // Top row
            return true;
          }
        }

        if(this.boardsWon[2] != 0){
          if(this.boardsWon[2] == this.boardsWon[4] && this.boardsWon[2] == this.boardsWon[6]){ // Right diag
            return true;
          }

          if(this.boardsWon[2] == this.boardsWon[5] && this.boardsWon[2] == this.boardsWon[8]){ // Right col
            return true;
          }
        }

        if(this.boardsWon[7] != 0){
          if(this.boardsWon[7] == this.boardsWon[4] && this.boardsWon[7] == this.boardsWon[1]){ // Middle col
            return true;
          }

          if(this.boardsWon[7] == this.boardsWon[6] && this.boardsWon[7] == this.boardsWon[8]){ // Bottom row
            return true;
          }
        }

        if(this.boardsWon[3] != 0 && this.boardsWon[3] == this.boardsWon[4] && this.boardsWon[3] == this.boardsWon[5]){ // Middle row
          return true;
        }
      }

      return false;
    };

    /*
     * Checks for ties by looking for any piece that isn't claimed.
     *  Works for all game modes
     * return Returns true if the game is tied, false otherwise
     */
    Game.prototype.gameTied = function(){
      if(this.gameMode == 1){
        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
            if(this.board[i][j] == 0){
              return false;
            }
          }
        }
       return true;
      }else if(this.gameMode == 2){
        if(this.numOfMoves > 26){// Tie when no more playable moves
          for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
              if(this.boardsWon[(i*3) + j] == 0){
                return false;
              }
            }
          }

          //Last check to be done, so don't worry about winning in the last move
          if(this.numOfMoves == 81){
            return true;
          }
        }else{ // Not possible to have a tied less than 27 moves
          return false;
        }
        return true;
      }
    };

    /*
     * Shows winner of the game or tied using SVG or WebGL
     * SVG draws a box over the game board
     * Adds a button on the bottom for restarting the game
     */
    Game.prototype.endScene = function(){
      // SVG, just display a rect over the board that say who won
      var boardSVG = document.getElementById("gameboard");
      var svgns = "http://www.w3.org/2000/svg";
      var text = document.createElementNS(svgns, "text");
      var text2 = document.createElementNS(svgns, "text");
      var rect = document.createElementNS(svgns, "rect");

      //Position for background and text
      rect.setAttribute("x", 15);
      rect.setAttribute("y", 15);
      rect.setAttribute("width", 570);
      rect.setAttribute("height", 570);

      text.setAttribute("x", 300);
      text.setAttribute("y", 250);
      text.setAttribute("font-size", 64);
      text.setAttribute("text-anchor", "middle");

      text2.setAttribute("x", 300);
      text2.setAttribute("y", 350);
      text2.setAttribute("font-size", 64);
      text2.setAttribute("text-anchor", "middle");

      //Set text
      text.innerHTML = "Game Over";
      if(this.gameWon()){
        rect.setAttribute("class", "background-winner" + this.currentPlayer);
        text.setAttribute("class", "winner" + this.currentPlayer);
        text2.setAttribute("class", "winner" + this.currentPlayer);
        text2.innerHTML = "Winner: Player " + this.currentPlayer;
      }else{ //Tie
        text.setAttribute("class", "tie");
        text2.setAttribute("class", "tie");
        text2.innerHTML = "Tie";
        rect.setAttribute("class", "background-tie");
      }

      boardSVG.appendChild(rect);
      boardSVG.appendChild(text);
      boardSVG.appendChild(text2);

      //Create link to play a new game
      var link = document.createElement("a");
      var gameDiv = document.getElementById("game");

      link.setAttribute("href", "index.html");
      link.setAttribute("class", "restart-link");
      link.innerHTML = "Restart Game!";
      gameDiv.appendChild(link);
    };
  }
}
