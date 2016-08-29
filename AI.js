var AI = function(level, mode){
  this.aiLevel = level;
  this.gameMode = mode;


  if(typeof this.getMove != "function"){
    console.log("Adding AI fucntions");

    AI.prototype.getMove = function(currentBorad, player, lastMove){
      this.possibleBoard = currentBoard;

      if(this.aiLevel == 1){
        this.depthBound = 2;

      }else if(this.aiLevel == 2){
        this.depthBound = 4;

      }else if(this.aiLevel == 3){
        this.depthBound = 6;
      }

      var nextMove = this.minmaxSearch(player, 0, lastMove);

      return nextMove;
    };

    /*
     * Min Max search for tic tac toe
     * player The current player whose moves are to be evaluated.
     * depth The depth of the search tree (Initially 0).
     * lastMove The last move made on teh board
     */
    AI.prototype.minmaxSearch = function(player, depth, lastMove){
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
     * Gets all possible moves for either game mode.
     *  Ultimate mode uses last move to determind where the player can go.
     * lastMove The last move made on the board. 
     */
    AI.prototype.getPossibleMoves = function(lastMove){
    };

    /*
     * Evaluation function for min max search. Checks for game mode.
     */
    AI.prototype.eval = function(){
    };

    /*
     * Checks if the game is won by the player.
     */
    AI.prototype.gameWonBy = function(player){
    }

  }
};