# Tic Tac Toe with AI
A playable tic tac toe game allowing for playing against AI or playing two AI against each other. Has two playable modes, normal Tic Tac Toe and Ultimate Tic Tac Toe. 
[Current version playable (Codepen).](https://codepen.io/tenory/pen/BpNXqb)
## Game 
Game follows normal rules for Tic Tac Toe. Used rules for Ultimate Tic Tac Toe that doesn't allow for a easy always win strategy if going first.
### Rules
 - First move is allowed anywhere on the board
 - All following moves can be played on the board that the last move represents. EX:
 - If a player is sent to a board that is already won, then they are allowed to play anywhere.
 - A player wins by winning three individual boards in a row.

## AI (Min Max Search)
AI uses min max search to determine best possible move to take. For normal mode on hard difficulty, the AI will generate a complete tree so it will always win or tie the game. 
#### Evaluation
Evaluation changes depending on the game mode.
Normal Mode only scores for winning or losing boards:
+10 for winning game board
-10 for losing game board

Ultimate mode scoring depends on the strategy of trying to pin the player on the 4 corners boards while trying to take the center board.  

#### Levels
AI has 3 levels, Easy, Normal, Hard. On Hard, the AI will use a pruning version of the search to speed up the process. Each level determines how deep to generate a tree:
 - Easy - 2 levels
 - Normal - 4 levels 
 - Hard - 8 levels

## Todo
 - Add option to AI to draw the game tree it uses each move
 - Add timer for AI's move (and compute average time)
 - Allow for AI vs AI to have different difficulty levels

