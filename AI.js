var AI = function(level, mode, player){
  this.aiLevel = level;
  this.gameMode = mode;
  this.aiPlayer = player;
  this.aiOpponent = (player%2) + 1;

  if(this.aiLevel == 1){
    this.depthBound = 2;

  }else if(this.aiLevel == 2){
    this.depthBound = 4;

  }else if(this.aiLevel == 3){
    this.depthBound = 8;
  }

  if(typeof this.getMove != "function"){
    console.log("Adding AI fucntions");

    /*
     * Gets the next move for the AI
     * currentBoard The current board in the gameMode
     * x Last move innerX
     * y Last move innerY
     */
    AI.prototype.getMove = function(currentBoard, x, y){
      this.possibleBoard = currentBoard;

      console.log("Finding AI's move.");
      var nextMove = this.minmaxSearch(this.aiPlayer, 0, x, y);
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
    AI.prototype.minmaxSearch = function(player, depth, x, y){
      /*
        1. check depth
        2. get possible moves
        3. loop through moves
        4. return
       */
      if(depth == this.depthBound){
        return this.evaluation(depth);
      }

      var possibleMoves = this.getPossibleMoves(x, y);

      var bestMove;
      var bestScore;
      if(possibleMoves.length == 0){       
        return this.evaluation(depth);
      }

      // Conduct search
      if(player == this.aiPlayer){ // Max AI Player's move
        bestScore = -1000000;

        for(var i = 0; i < possibleMoves.length; i++){
          this.setMove(possibleMoves[i], player);

          var score = this.minmaxSearch((player%2)+1, depth+1, possibleMoves[i].innerX, possibleMoves[i].innerY);
          if(score > bestScore){ // min
            bestScore = score;
            bestMove = possibleMoves[i];
          }

          this.setMove(possibleMoves[i], 0);
        }
      }else{ // Min Opponent's move
        bestScore = 1000000;

        for(var j = 0; j < possibleMoves.length; j++){
          this.setMove(possibleMoves[j], player);
          var score = this.minmaxSearch((player%2)+1, depth+1, possibleMoves[j].innerX, possibleMoves[j].innerY);
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
    AI.prototype.minmaxSearchrchPruning = function(player, depth, lastMove, a, b){
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
    AI.prototype.getPossibleMoves = function(x, y){
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
        if((x == -1 || y == -1) || this.singleWon(x, y)){
          for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
              if(!this.singleWon(i,j)){ // If the board is already won, skip it
                for(var k = 0; k < 3; k++){
                  for(var l = 0; l < 3; l++){
                    if(this.possibleBoard[i][j][k][l] == 0){
                      moves.push({outerX: i, outerY: j, innerX: k, innerY: l});
                    }
                  }
                }
              }
            }
          }
        }else{
          for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
              if(this.possibleBoard[x][y][i][j] == 0){
                moves.push({outerX: x, outerY: y, innerX: i, innerY: j});
              }
            }
          }
        }
      }

      return moves;
    };
    
    AI.prototype.boardTied = function(outerX, outerY){
      for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
          if(this.possibleBoard[outerX][outerY][i][j] == 0){
            return false;
          }
        }
      }

      return true;
    };

    /* ! Use for ultimate mode only !
     * Checks if a inner board is won
     */
    AI.prototype.singleWon = function(outerX, outerY){
      if(this.possibleBoard[outerX][outerY][0][0] != 0){
          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][1][0] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][2][0]){ // Left col
            return true;
          }

          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][2][2]){ //Left Diag
            return true;
          }

          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][0][1] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][0][2]){ // Top row
            return true;
          }
      }

      if(this.possibleBoard[outerX][outerY][0][2] != 0){
        if(this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][2][0]){ // Right diag
          return true;
        }

        if(this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][1][2] && this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][2][2]){ // Right col=
          return true;
        }
      }

      if(this.possibleBoard[outerX][outerY][2][1] != 0){
        if(this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][0][1]){ // Middle col
          return true;
        }

        if(this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][2][0] && this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][2][2]){ // Bottom row
          return true;
        } 
      }

      if(this.possibleBoard[outerX][outerY][1][0] != 0 && this.possibleBoard[outerX][outerY][1][0] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][1][0] == this.possibleBoard[outerX][outerY][1][2]){ // Middle row
        return true;
      }

      if(this.boardTied(outerX, outerY)){
        return true;
      }

      return false;
    };

    /* ! Use for ultimate mode only !
     * 
     */
    AI.prototype.singleWonBy = function(outerX, outerY){
      if(this.possibleBoard[outerX][outerY][0][0] != 0){
          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][1][0] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][2][0]){ // Left col
            return this.possibleBoard[outerX][outerY][0][0] ;
          }

          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][2][2]){ //Left Diag
            return this.possibleBoard[outerX][outerY][0][0] ;
          }

          if(this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][0][1] && this.possibleBoard[outerX][outerY][0][0] == this.possibleBoard[outerX][outerY][0][2]){ // Top row
            return this.possibleBoard[outerX][outerY][0][0] ;
          }
      }

      if(this.possibleBoard[outerX][outerY][0][2] != 0){
        if(this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][2][0]){ // Right diag
          return this.possibleBoard[outerX][outerY][0][2];
        }

        if(this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][1][2] && this.possibleBoard[outerX][outerY][0][2] == this.possibleBoard[outerX][outerY][2][2]){ // Right col=
          return this.possibleBoard[outerX][outerY][0][2];
        }
      }

      if(this.possibleBoard[outerX][outerY][2][1] != 0){
        if(this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][0][1]){ // Middle col
          return this.possibleBoard[outerX][outerY][2][1];
        }

        if(this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][2][0] && this.possibleBoard[outerX][outerY][2][1] == this.possibleBoard[outerX][outerY][2][2]){ // Bottom row
          return this.possibleBoard[outerX][outerY][2][1];
        } 
      }

      if(this.possibleBoard[outerX][outerY][1][0] != 0 && this.possibleBoard[outerX][outerY][1][0] == this.possibleBoard[outerX][outerY][1][1] && this.possibleBoard[outerX][outerY][1][0] == this.possibleBoard[outerX][outerY][1][2]){ // Middle row
        return this.possibleBoard[outerX][outerY][1][0];
      }

      return 0;
     };

    /*
     * Evaluation function for min max search. Checks for game mode.
     */
    AI.prototype.evaluation = function(depth){
      if(this.gameMode == 1){ // Normal mode
        if(this.gameWonBy(this.aiOpponent)){
          return depth - 10;
        }else if(this.gameWonBy(this.aiPlayer)){
          return 10 - depth;
        }

        return 0;
      }else if(this.gameMode == 2){ // Ultimate mode
        if(this.gameWonBy(this.aiPlayer)){
          return 100000;
        }else if(this.gameWonBy(this.aiOpponent)){
          return -100000;
        }

        var score = 0;
        var boardWins = [0,0,0,0,0,0,0,0];
        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
            //Check for board wins
            var winner = this.singleWonBy(i,j);
            if(winner == this.aiPlayer){
              boardWins[i*3 + j] = this.aiPlayer;
              score += 10;
            }else if(winner == this.aiOpponent){
              boardWins[i*3 + j] = this.aiOpponent;
              score -= 10;
            }

            //Check for board 
          }
        }

        return score;
      }
    };

    /*
     * Checks if the game is won by the player.
     */
    AI.prototype.gameWonBy = function(player){
      if(this.gameMode == 1){
        if(this.possibleBoard[0][0] == player){
          if(this.possibleBoard[1][0] == player && this.possibleBoard[2][0] == player){ // Left col
            return true;
          }

          if(this.possibleBoard[1][1] == player && this.possibleBoard[2][2] == player){ //Left Diag
            return true;
          }

          if(this.possibleBoard[0][1] == player && this.possibleBoard[0][2] == player){ // Top row
            return true;
          }
        }

        if(this.possibleBoard[0][2] == player){
          if(this.possibleBoard[1][1] == player && this.possibleBoard[2][0] == player){ // Right diag
            return true;
          }

          if(this.possibleBoard[1][2] == player && this.possibleBoard[2][2] == player){ // Right col=
            return true;
          }
        }

        if(this.possibleBoard[2][1] == player){
          if(this.possibleBoard[1][1] == player && this.possibleBoard[0][1] == player){ // Middle col
            return true;
          }

          if(this.possibleBoard[2][0] == player && this.possibleBoard[2][2] == player){ // Bottom row
            return true;
          }
        }

        if(this.possibleBoard[1][0] == player && this.possibleBoard[1][1] == player && this.possibleBoard[1][2] == player){ // Middle row
          return true;
        }

        return false;
      }else if(this.gameMode == 2){

        var boardWins = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        var tieCounter = 0;

        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
            var winner = this.singleWonBy(i,j);
            if(winner == this.aiPlayer){
              boardWins[i*3 + j] = this.aiPlayer;
              tieCounter++;
            }else if(winner == this.aiOpponent){
              boardWins[i*3 + j] = this.aiOpponent;
              tieCounter++;
            }else if(this.boardTied(i,j)){ //Check for tie
              boardWins[i*3 + j] = -1;
              tieCounter++;
            }
          }
        }

        //Check all possible winning game positions
        if(boardWins[0] == player && boardWins[3] == player && boardWins[6] == player){ // Left col
          return true;
        }

        if(boardWins[1] == player && boardWins[4] == player && boardWins[7] == player){ // Mid col
          return true;
        }
        
        if(boardWins[2] == player && boardWins[5] == player && boardWins[8] == player){ // Right col
          return true;
        }

        if(boardWins[0] == player && boardWins[1] == player && boardWins[2] == player){ // Top row
          return true;
        }
        
        if(boardWins[3] == player && boardWins[4] == player && boardWins[5] == player){ // Mid row
          return true;
        }
        
        if(boardWins[6] == player && boardWins[7] == player && boardWins[8] == player){ // Bot row
          return true;
        }
        
        if(boardWins[0] == player && boardWins[4] == player && boardWins[8] == player){ // Left Diag
          return true;
        }
        
        if(boardWins[2] == player && boardWins[4] == player && boardWins[6] == player){ // Right Diag
          return true;
        }

        if(tieCounter == 9){
          return true;
        }

        return false;
      }
    };

  }
};
