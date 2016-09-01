function Game(gameMode, aiLevel, first, vsai){
  this.gameMode = gameMode;
  this.currentPlayer = first; // Human is player 1, AI/Human is player 2
  this.playingAI = vsai;
  this.numOfMoves = 0;
  this.player1AI = false;
  this.player2AI = vsai;

  if(vsai){ // If there is an ai player, create the object
    this.ai = new AI(aiLevel, gameMode, 2);
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

    /*
     * Sets up the backend for the board depending on the game mode
     */
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
     * Sets mouse events for the current game mode
     */
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
          var oX = parseInt(xPos/200);
          var oY = parseInt(yPos/200);
          var iX = parseInt(xPos/66.6) % 3;
          var iY = parseInt(yPos/66.6) % 3;

          console.log(oX, oY, iX, iY);
          game.setPieceToPlayer(oX, oY, iX, iY);
        }
        // console.log(event.pageX - xPos);
        // console.log(event.pageY - yPos);
      };

      canvas.addEventListener("mousedown",
        function(game){
          return function (){mouseDown(game, event);}
        }(this),
        false);
    };

    /*
     *
     */
    Game.prototype.drawBoard = function(){
      console.log("Drawing board");
      var vertexShaderText =
      [
        'precision mediump float;',
        '',
        'attribute vec2 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        ' fragColor = vertColor;',
        ' gl_Position = vec4(vertPosition, 0.0, 1.0);',
        '}'
      ].join('\n');
      var fragmentShaderText =
      [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'void main()',
        '{',
        ' gl_FragColor = vec4(fragColor, 1.0);',
        '}'
      ].join('\n');

      //Try first with webgl, if it doesn't work than use svgs
      var canvas = document.getElementById("gameboard");
      var gl = canvas.getContext("experimental-webgl");

      if(!gl){
        alert("ERROR This browser does not support WebGL, using an altinate method.");
        drawBoardAlt();
        return;
      }

      //Clear 
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      //Compile shader
      var vertexShader = gl.createShader(gl.VERTEX_SHADER);
      var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      
      gl.shaderSource(vertexShader, vertexShaderText);
      gl.shaderSource(fragmentShader, fragmentShaderText);
      
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);

      //Create Program
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
  

      //Function for getting vertices for squares
      var verticesSquare = function (topLeftX, topLeftY, length, r, g, b, buffer){
        var vertices = [];
        
        vertices.push(topLeftX + buffer, topLeftY - buffer, r, g, b); // Top left
        vertices.push(topLeftX + buffer, (topLeftY - length) + buffer, r, g, b); // Bottom left
        vertices.push(topLeftX + (length - buffer), (topLeftY - length) + buffer, r,g,b); // Bottom Right
        
        vertices.push(topLeftX + buffer, topLeftY - buffer, r, g, b); // Top left
        vertices.push(topLeftX + (length - buffer), (topLeftY - length) + buffer, r,g,b); // Bottom Right
        vertices.push( topLeftX + (length - buffer), topLeftY - buffer, r,g,b); // Top Right
        
        return vertices;
      }


      //Creating vertices for triangles
      var boardVertices = [];
      var numOfSquares;
      if(this.gameMode == 1){
        for(var j = 0; j < 3; j++){
          for(var i = 0; i < 3; i++){
            if(this.board[i][j] == 0){
              var square = verticesSquare(-1 + (i*2/3),1 - (j*2/3) , 2/3, .5, .5, .5, .05);
              for(var k = 0; k < square.length; k++){
                boardVertices.push(square[k]);
              } 
            }else if(this.board[i][j] == 1){ // Red 
              var square = verticesSquare(-1 + (i*2/3),1 - (j*2/3) , 2/3, 1, 0, 0, .1);
              for(var k = 0; k < square.length; k++){
                boardVertices.push(square[k]);
              } 
            }else{ // Blue
              var square = verticesSquare(-1 + (i*2/3),1 - (j*2/3) , 2/3, 0, 1, 0, .1);
              for(var k = 0; k < square.length; k++){
                boardVertices.push(square[k]);
              } 
            }
          }
        }
        numOfSquares = 9;
      }else if(this.gameMode == 2){
        console.log("here");
        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
            for(var k = 0; k < 3; k++){
              for(var l = 0; l < 3; l++){
                if(this.board[i][j][k][l] == 0){ // Default
                  var square = verticesSquare(-1 + (l * 2/9) + (j*2/3),1 - (k*2/9) -(i*2/3) , 2/9, .5, .5, .5, .05);
                  for(var m = 0; m < square.length; m++){
                    boardVertices.push(square[m]);
                  } 
                }else if(this.board[i][j][k][l] == 1){// Player 1 (Red)
                  var square = verticesSquare(-1 + (l * 2/9) + (j*2/3),1 - (k*2/9) -(i*2/3) , 2/9, 1, 0, 0, .05);
                  for(var m = 0; m < square.length; m++){
                    boardVertices.push(square[m]);
                  } 
                }else{ // Player 2 (Blue)
                  var square = verticesSquare(-1 + (l * 2/9) + (j*2/3),1 - (k*2/9) -(i*2/3) , 2/9, 0, 0, 1, .05);
                  for(var m = 0; m < square.length; m++){
                    boardVertices.push(square[m]);
                  } 
                }
              }
            }
          }
        }
        numOfSquares = 81;
      }
     
      //Creating buffers
      var boardVertexBufferObject = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, boardVertexBufferObject);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boardVertices), gl.STATIC_DRAW);
      
      
      var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
      var colorAttribLocation = gl.getAttribLocation(program, "vertColor");
      
      gl.vertexAttribPointer(
        positionAttribLocation,
        2, // Number of elements per attribute;
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
      );
      
      
      gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
      );
      
      gl.enableVertexAttribArray(positionAttribLocation);
      gl.enableVertexAttribArray(colorAttribLocation);
      
      //Start
      gl.useProgram(program);
      gl.drawArrays(gl.TRIANGLES, 0, 3*(2*numOfSquares));
    };

    /*
     * Draws board using svg rather than webgl
     */
    Game.prototype.drawBoardAlt = function(){
    };

    /*
     * Sets the piece of the board for the player
     */
    Game.prototype.setPieceToPlayer = function(outerX, outerY, innerX, innerY){
      //DEBUG
      console.log(innerX, innerY);
      if(this.gameMode == 1){
        //Check for valid move
        if(this.board[innerX][innerY] != 0){
          console.log("Invalid move.");
          return;
        }

        this.board[innerX][innerY] = this.currentPlayer;

        if(this.gameOver()){ //Check if game is over
          this.drawBoard();
          console.log(this.board);
          console.log("Game over. Player " + this.currentPlayer + " wins!");
          this.endScene();
          return;
        }

        this.currentPlayer = (this.currentPlayer%2) + 1;
        this.numOfMoves++;

        //If the next player is an AI, then get their move
        if((this.currentPlayer == 1 && this.player1AI) || (this.currentPlayer == 2 && this.player2AI)){
          var move = this.ai.getMove(this.board, null);
          this.setPieceToPlayer(0, 0, move.innerX, move.innerY);
        }else{
          this.drawBoard();
        }
      }else if(this.gameMode == 2){
        if(this.board[outerX][outerY][innerX][innerY] != 0){ // Check for valid move
          console.log("invalid move!");
          return;
        }

        this.board[outerX][outerY][innerX][innerY] = this.currentPlayer;
        console.log("Move made " + this.board[outerX][outerY][innerX][innerY]);
        console.log(outerX + "" + outerY);
        console.log(innerX + "" + innerY);
;
        if(this.gameOver()){ // Check if game is over
          console.log("Game Over. Player "+ this.currentPlayer + " wins!");
          return;
        }

        this.currentPlayer = (this.currentPlayer % 2) + 1;
        console.log(this.currentPlayer);
        this.numOfMoves++;

        //If the next player is AI, then get their move, else set up next player's move.
        if((this.currentPlayer == 1 && this.player1AI) || !(this.currentPlayer == 2 && this.player2AI)){
          // var move = this.ai.getMove(this.board, {outerX: outerX, outerY: outerY, innerX: innerX, innerY: innerY});
          // this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
        }else{
          //Set up next player's move
          this.drawBoard();
          console.log(this.board);
        }
      }
    };

    Game.prototype.gameOver = function(){
      //Check for tie
      if(this.gameTied()){
        return true;
      }
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

        if(this.board[0][1] != 0 && this.board[0][1] == this.board[1][1] && this.board[0][1] == this.board[2][1]){ // Middle row
          return true;
        }

        //Check for ties
        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
          }
        }

        return false;
      }else if(this.gameMode == 2){ // Ultimate mode

        return false;
      }
    };

    /*
     * Checks for ties by looking for any piece that isn't claimed
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
        for(var i = 0; i < 3; i++){
          for(var j = 0; j < 3; j++){
            for(var k = 0; k < 3; k++){
              for(var l = 0; l < 3; l++){
                if(this.board[i][j][k][l] == 0){
                  return false;
                }
              }
            }
          }
        }

        return true;
      }
    };

    Game.prototype.endScene = function(){
    };

  }

}
