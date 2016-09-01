var AI = function(level, mode, player){
  this.aiLevel = level;
  this.gameMode = mode;
  this.aiPlayer = player;
  this.aiOpponent = (player%2) + 1;

  if(typeof this.getMove != "function"){
    console.log("Adding AI fucntions");

    AI.prototype.getMove = function(currentBoard, lastMove){
      this.possibleBoard = currentBoard;
      console.log(lastMove);

      if(this.aiLevel == 1){
        this.depthBound = 2;

      }else if(this.aiLevel == 2){
        this.depthBound = 4;

      }else if(this.aiLevel == 3){
        this.depthBound = 8;
      }
      console.log("Finding AI's move.");
      var nextMove = this.minmaxSearch(this.aiPlayer, 0, lastMove);
      console.log("Move found: ");
      console.log(nextMove);
      return nextMove;
    };

    /*
     * Min Max search for tic tac toe
     * player The current player whose moves are to be evaluated.
     * depth The depth of the search tree (Initially 0).
     * lastMove The last move made on teh board
     */
    AI.prototype.minmaxSearch = function(player, depth, lastMove){
      /*
        1. check depth
        2. get possible moves
        3. loop through moves
        4. return
       */
      if(depth == this.depthBound){
        return this.evaluation();
      }

      var possibleMoves = this.getPossibleMoves(lastMove);

      var bestMove;
      var bestScore;
      if(possibleMoves.length == 0){
        return this.evaluation();
      }

      // Conduct search
      if(player == this.aiPlayer){ // Max AI Player's move
        bestScore = -100000;

        for(var i = 0; i < possibleMoves.length; i++){
          this.setMove(possibleMoves[i], player);

          var score = this.minmaxSearch((player%2)+1, depth+1, possibleMoves[i]);
          if(score > bestScore){ // min
            bestScore = score;
            bestMove = possibleMoves[i];
          }

          this.setMove(possibleMoves[i], 0);
        }
      }else{ // Min Opponent's move
        bestScore = 100000;

        for(var j = 0; j < possibleMoves.length; j++){
          this.setMove(possibleMoves[j], player);

          var score = this.minmaxSearch((player%2)+1, depth+1, possibleMoves[j]);
          if(score < bestScore){ // min
            bestScore = score;
            bestMove = possibleMoves[j];
          }

          this.setMove(possibleMoves[j], 0);
        }
      }

      if(depth == 0){
        return bestMove;
      }else{
        return bestScore;
      }
    };

    /*
     * Min max search with aplha beta pruning.
     * player The current player whos' moves are to be evaluated.
     * depth The depth of the search tree. (Initially 0).
     * lastMove The last move made on the board
     * a Aplha
     * b Beta
     */
    AI.prototype.minmaxSearchPruning = function(player, depth, lastMove, a, b){
    };

    /*
     * Sets the move for the player in possibleBoard, depending on the game type
     * move The move to make in form of {outerX*, outerY*, innerX, innerY}.
     * player Player to set move to.
     */
    AI.prototype.setMove = function(move, player){
      if(this.gameMode == 1){
        this.possibleBoard[move.innerX][move.innerY] = player;
      }else if(this.gameMode == 2){
        this.possibleBoard[move.outerX][move.outerY][move.innerX][move.innerY] = player;
      }
    };

    /*
     * Gets all possible moves for either game mode.
     *  Ultimate mode uses last move to determind where the player can go.
     * lastMove The last move made on the board.
     */
    AI.prototype.getPossibleMoves = function(lastMove){
      //Check if game is over
      if(this.gameWonBy(1) || this.gameWonBy(2)){
        return [];
      }

      var moves = [];

      if(this.gameMode == 1){ // Normal mode
        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
            if(this.possibleBoard[i][j] == 0){
              moves.push({innerX: i, innerY: j});
            }
          }
        }
      }else if(this.gameMode == 2){ // Ultimate mode
        //Checks if the inner board is won to determind moves.
        if(this.singleWon(lastMove.innerX, lastMove.innerY)){
          for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
              for(var k = 0; k < 3; k++){
                for(var l = 0; l < 3; l++){
                  if(this.possibleBoard[i][j][k][l] == 0){
                    moves.push({outerX: i, outerY: j, innerX: k, innerY: l});
                  }
                }
              }
            }
          }
        }else{
          for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
              if(this.possibleBoard[lastMove.innerX][lastMove.innerY][i][j] == 0){
                moves.push({outerX: lastMove.innerX, outerY: lastMove.outerY, innerX: i, innerY: j});
              }
            }
          }
        }
      }

      return moves;
    };

    /* ! Use for ultimate mode only !
     * Checks if a inner board is won
     */
    AI.prototype.singleWon = function(outerX, outerY){
      if(this.possibleBoard[outerX][outerY][0][0] != 0){
          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][0][1] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][0][2]){ // Left col
            return true;
          }

          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][2][2]){ //Left Diag
            return true;
          }

          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][1][0] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][2][0]){ // Top row
            return true;
          }
      }

      if(this.possibleBoard[outerX][outerY][2][0] != 0){
        if(this.possibleBoard[outerX][outerY][2][0] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][2][0] == this.possibleBoard[outerX][outerY][0][2]){ // Right diag
          return true;
        }

        if(this.possibleBoard[outerX][outerY][2][0] == this.possibleBoard[outerX][outerY][2][1] && this.possibleBoard[outerX][outerY][2][0] == this.possibleBoard[outerX][outerY][2][2]){ // Right col=
          return true;
        }
      }

      if(this.possibleBoard[outerX][outerY][1][2] != 0){
        if(this.possibleBoard[outerX][outerY][1][2] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][1][2] == this.possibleBoard[outerX][outerY][1][0]){ // Middle col
          return true;
        }

        if(this.possibleBoard[outerX][outerY][1][2] == this.possibleBoard[outerX][outerY][0][2] && this.possibleBoard[outerX][outerY][1][2] == this.possibleBoard[outerX][outerY][2][2]){ // Bottom row
          return true;
        }
      }

      if(this.possibleBoard[outerX][outerY][0][1] != 0 && this.possibleBoard[outerX][outerY][0][1] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][0][1] == this.possibleBoard[outerX][outerY][1][2]){ // Middle row
        return true;
      }

      return false;
    };

    /*
     * Evaluation function for min max search. Checks for game mode.
     */
    AI.prototype.evaluation = function(){
      if(this.gameMode == 1){ // Normal mode
        if(this.gameWonBy(this.aiOpponent)){
          return -10;
        }else if(this.gameWonBy(this.aiPlayer)){
          return 10;
        }
      }else if(this.gameMode == 2){ // Ultimate mode
        var score = 0;


        return score;
      }
    };

    /*
     * Checks if the game is won by the player.
     */
    AI.prototype.gameWonBy = function(player){
      if(this.gameMode == 1){
        if(this.possibleBoard[0][0] == player){
          if(this.possibleBoard[0][1] == player && this.possibleBoard[0][2] == player){ // Left col
            return true;
          }

          if(this.possibleBoard[1][1] == player && this.possibleBoard[2][2] == player){ //Left Diag
            return true;
          }

          if(this.possibleBoard[1][0] == player && this.possibleBoard[2][0] == player){ // Top row
            return true;
          }
        }

        if(this.possibleBoard[2][0] == player){
          if(this.possibleBoard[1][1] == player && this.possibleBoard[0][2] == player){ // Right diag
            return true;
          }

          if(this.possibleBoard[2][1] == player && this.possibleBoard[2][2] == player){ // Right col=
            return true;
          }
        }

        if(this.possibleBoard[1][2] == player){
          if(this.possibleBoard[1][1] == player && this.possibleBoard[1][0] == player){ // Middle col
            return true;
          }

          if(this.possibleBoard[0][2] == player && this.possibleBoard[2][2] == player){ // Bottom row
            return true;
          }
        }

        if(this.possibleBoard[0][1] == player && this.possibleBoard[1][1] == player && this.possibleBoard[1][2] == player){ // Middle row
          return true;
        }

        return false;
      }else if(this.gameMode == 2){

        return false;
      }
    };

  }
};
