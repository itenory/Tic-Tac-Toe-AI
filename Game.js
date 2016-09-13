function Game(gameMode, aiLevel, first, vsai1, vsai2){
  this.gameMode = gameMode;
  this.currentPlayer = first;
  this.numOfMoves = 0;
  this.player1AI = vsai1;
  this.player2AI = vsai2;
  this.gameDone = false;
  this.gl; // GL context if using webgl, null otherwise

  //Create ai objects for player
  if(vsai1){
    this.ai1 = new AI(aiLevel, gameMode, 1);
  }
  if(vsai2){ // If there is an ai player, create the object
    this.ai2 = new AI(aiLevel, gameMode, 2);
  }
  if(gameMode == 2){ // Use for ultimate mode to keep track single board wins
    this.boardsWon = [0,0,0,0,0,0,0,0,0];
    this.lastMove = null;
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
      this.drawBoard();

      var title = document.getElementById("header");

      if(this.gameMode == 1){
        title.innerHTML = "Tic Tac Toe";
      }else{
        title.innerHTML = "Ultimate Tic Tac Toe"
      }
      //If AI goes first, get and set their move. Redraw board
      if(this.player1AI && this.currentPlayer == 1){
        var move = this.ai1.getMove(this.board, -1, -1);
        if(!this.gl){
          //Perform click for AI only for SVG version
          if(this.gameMode == 1){
            var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
          }else if(this.gameMode == 2){
            var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
          }
          elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
        }
        this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY)
      }else if(this.player2AI && this.currentPlayer == 2){
        var move = this.ai2.getMove(this.board, -1, -1);
         if(!this.gl){
          //Perform click for AI only for SVG version
          if(this.gameMode == 1){
            var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
          }else if(this.gameMode == 2){
            var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
          }
          elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
        }
        this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
      }
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

      var mouseDown = function(game, event){
        if(game.gameDone){
          return;
        }
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
          var oX = parseInt(yPos/200);
          var oY = parseInt(xPos/200);


          var iX = parseInt(yPos/66.6) % 3;
          var iY = parseInt(xPos/66.6) % 3;

          console.log(oX, oY, iX, iY);
          game.setPieceToPlayer(oX, oY, iX, iY);
        }
      };

      canvas.addEventListener("mousedown",
        function(game){
          return function (){mouseDown(game, event);}
        }(this),
        false);
    };

    /*
     * Draws the game board using WebGL 
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
      this.gl = canvas.getContext("experimental-webgl");
      this.gl = null;

      if(!this.gl){
        alert("ERROR This browser does not support WebGL, using an alternate method.");
        this.drawBoardAlt();
        return;
      }

      this.setMouse();

      //Clear
      this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      //Compile shader
      var vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      var fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

      this.gl.shaderSource(vertexShader, vertexShaderText);
      this.gl.shaderSource(fragmentShader, fragmentShaderText);

      this.gl.compileShader(vertexShader);
      this.gl.compileShader(fragmentShader);

      //Create Program
      var program = this.gl.createProgram();
      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);


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
      var boardVertexBufferObject = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, boardVertexBufferObject);
     this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(boardVertices), this.gl.STATIC_DRAW);


      var positionAttribLocation = this.gl.getAttribLocation(program, "vertPosition");
      var colorAttribLocation = this.gl.getAttribLocation(program, "vertColor");

      this.gl.vertexAttribPointer(
        positionAttribLocation,
        2, // Number of elements per attribute;
        this.gl.FLOAT,
        this.gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        0
      );


      this.gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        this.gl.FLOAT,
        this.gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT,
        2 * Float32Array.BYTES_PER_ELEMENT
      );

      this.gl.enableVertexAttribArray(positionAttribLocation);
      this.gl.enableVertexAttribArray(colorAttribLocation);

      //Start
      this.gl.useProgram(program);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 3*(2*numOfSquares));
    };

    /*
     * Draws board using svg rather than webgl
     */
    Game.prototype.drawBoardAlt = function(){
      var boardSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      var divContainer = document.getElementById("game");

      var h = 600; var w = 600;
      boardSVG.setAttribute('id', 'gameboard');
      boardSVG.setAttribute('height', h);
      boardSVG.setAttribute('width', w);


      //Functions for drawing board and drawing lines
      var drawLines = function(x1, x2, y1, y2, color, width){
        var svgns = "http://www.w3.org/2000/svg";
        var line = document.createElementNS(svgns, "line");

        line.setAttributeNS(null, "x1", x1);
        line.setAttributeNS(null, "x2", x2);
        line.setAttributeNS(null, "y1", y1);
        line.setAttributeNS(null, "y2", y2);
        line.setAttributeNS(null, "stroke", color);
        line.setAttributeNS(null, "stroke-width", width);

        return line;
      };

      //Check for game modes
      if(this.gameMode == 1){
        this.drawSingle(boardSVG, h, w, 0, 0, 0, "00");
      }else if(this.gameMode == 2){
        //Draw 9 singles boards
        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
              this.drawSingle(boardSVG, h/3, w/3, (w/3)*j, (h/3)*i, 10, i + "" + j);
            }
        }
        //Draw the main divider lines
        var verticeLine = drawLines(w/3, w/3, 0, h, "pink", 5);
        boardSVG.appendChild(verticeLine);

        verticeLine = drawLines((w/3)*2, (w/3)*2, 0, h, "pink", 5);
        boardSVG.appendChild(verticeLine);

        verticeLine = drawLines(0, w, h/3, h/3, "pink", 5);
        boardSVG.appendChild(verticeLine);

        verticeLine = drawLines(0, w, (h/3)*2, (h/3)*2, "pink", 5);
        boardSVG.appendChild(verticeLine);


      }

      //Add the svg to the div, and remove the canvas tag
      divContainer.appendChild(boardSVG);
      var canvas = document.getElementById("gameboard");
      divContainer.removeChild(canvas);
    };

    /*
     * Draws a single board using SVGs. Used for ultimate to draw multiple boards
     *
     */
    Game.prototype.drawSingle = function(boardElem, height, width, x, y, spacing, id){
      var svgns = "http://www.w3.org/2000/svg";
      var rect = document.createElementNS(svgns, "rect");
      rect.setAttributeNS(null, "width", width);
      rect.setAttributeNS(null, "height", height);
      rect.setAttributeNS(null, "x", x);
      rect.setAttributeNS(null, "y", y);
      rect.setAttributeNS(null, "id", id);
      rect.setAttributeNS(null, "class", "single-board");
      boardElem.appendChild(rect);

      var mouseDown = function(game, piece){
        var id = piece.getAttributeNS(null, 'id');
        if(piece.getAttributeNS(null, 'class').includes('piece')){
          piece.setAttributeNS(null, 'class', "player" + game.currentPlayer);
          game.setPieceToPlayer(parseInt(id.charAt(0)), parseInt(id.charAt(1)), parseInt(id.charAt(2)), parseInt(id.charAt(3)));
        }else{
          console.log("Invalid move");
        }
      };

      //Create inner rectangles and lines
      for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
          var shape = document.createElementNS(svgns, "rect");
          shape.setAttributeNS(null, "width", (width/3) - 30);
          shape.setAttributeNS(null, "height", (height/3) - 30);
          shape.setAttributeNS(null, "x", ((width / 3)* j) + 15 + x);
          shape.setAttributeNS(null, "y", (height / 3) * i + 15 + y);
          shape.setAttributeNS(null, "id", id + i + j);
          shape.setAttributeNS(null, "class", "piece");
          boardElem.appendChild(shape);

          //Add event listener for clicks
          shape.addEventListener('click', function(game, elem){
            return function(event){
              mouseDown(game, elem);
            }
          }(this, shape), false);

          //Create lines
          if(i === 0 && j > 0){
            var line = document.createElementNS(svgns, "line");
            line.setAttributeNS(null, "x1", ((width/3) * j) + x);
            line.setAttributeNS(null, "x2", ((width/3) * j) + x);
            line.setAttributeNS(null, "y1", y + spacing);
            line.setAttributeNS(null, "y2", y + height - spacing);
            line.setAttributeNS(null, "stroke", "pink");
            line.setAttributeNS(null, "stroke-width", 2);

            boardElem.appendChild(line);
          }else if(i === 1 && j > 0){
            var line = document.createElementNS(svgns, "line");
            line.setAttributeNS(null, "x1", x + spacing);
            line.setAttributeNS(null, "x2", x + width - spacing);
            line.setAttributeNS(null, "y1", ((height/3) * j) + y);
            line.setAttributeNS(null, "y2", ((height/3) * j) + y);
            line.setAttributeNS(null, "stroke", "pink");
            line.setAttributeNS(null, "stroke-width", 2);

            boardElem.appendChild(line);
          }
        }
      }
    };

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

        if(this.gameOver()){ //Check if game is over
          if(this.gl){
            this.drawBoard();
          }

          this.gameDone = true;
          console.log("Game over. Player " + this.currentPlayer + " wins!");
          this.endScene();
          return;
        }

        this.currentPlayer = (this.currentPlayer%2) + 1;
        this.numOfMoves++;

        //If the next player is an AI, then get their move
        if(this.currentPlayer == 1 && this.player1AI){
          var move = this.ai1.getMove(this.board, null, null);
          if(!this.gl){
            //Perform click for AI only for SVG version
            var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
            elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
          }
          this.setPieceToPlayer(0, 0, move.innerX, move.innerY);

        }else if(this.currentPlayer == 2 && this.player2AI){
          var move = this.ai2.getMove(this.board, null, null);
          if(!this.gl){
            //Perform click for AI only for SVG version
            var elem = document.getElementById("00" + move.innerX + "" + move.innerY);
            elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
          }
          this.setPieceToPlayer(0, 0, move.innerX, move.innerY);
        }else{
          //If using opengl
          if(this.gl){
            this.drawBoard();
          }
        }
      }else if(this.gameMode == 2){
        if(this.board[outerX][outerY][innerX][innerY] != 0 || this.boardsWon[(outerX*3) + outerY] != 0 || (this.lastMove && (outerX != this.lastMove.innerX || outerY != this.lastMove.innerY))){ // Check for valid move
          if(!this.gl){
            //Reset puice
            var elem = document.getElementById(outerX + "" + outerY + "" + innerX + "" + innerY);
            elem.setAttributeNS(null, 'class', 'piece');
          }

          console.log("invalid move!");
          return;
        }

        this.board[outerX][outerY][innerX][innerY] = this.currentPlayer;
        //If single is won, mark it currentPlayer, if tied, mark it -1
        if(this.boardWon(outerX, outerY)){
          this.boardsWon[(outerX*3) + outerY] = this.currentPlayer;
          console.log("Single board won.");
          console.log(this.boardsWon);
        }else if(this.boardTied(outerX, outerY)){
          this.boardsWon[outerX*3 + outerY] = -1;
          console.log(this.boardsWon);
        }

        if(this.gameOver()){ // Check if game is over
          if(this.gl){ // Check if using OpenGL
            this.drawBoard();
          }
          this.gameDone = true;
          console.log("Game Over. Player "+ this.currentPlayer + " wins!");
          this.endScene();
          return;
        }

        //Check if next play gets to play anywhere.
        if(this.boardsWon[(innerX*3) + innerY] != 0){
          this.lastMove = null;
          innerX = -1;
          innerY = -1;
        }else{
          console.log(innerX*3 + innerY);
          this.lastMove = {outerX: outerX, outerY: outerY, innerX: innerX, innerY: innerY};
        }

        this.currentPlayer = (this.currentPlayer % 2) + 1;
        this.numOfMoves++;

        //If the next player is AI, then get their move, else set up next player's move.
        if(this.currentPlayer == 1 && this.player1AI){
          var move = this.ai1.getMove(this.board, innerX, innerY);
          if(!this.gl){
            //Perform click for AI only for SVG version
            var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
            elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
          }
          this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
        }else if(this.currentPlayer == 2 && this.player2AI){
          var move = this.ai2.getMove(this.board, innerX, innerY);
          if(!this.gl){
            //Perform click for AI only for SVG version
            var elem = document.getElementById("" + move.outerX + "" + move.outerY + "" + move.innerX + "" + move.innerY);
            elem.setAttributeNS(null, 'class', 'player' + this.currentPlayer);
          }
          this.setPieceToPlayer(move.outerX, move.outerY, move.innerX, move.innerY);
        }else{
          //Set up next player's move
          if(this.gl){
            this.drawBoard();
          }
          console.log(this.board);
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

    /* ! Ultimate mode only
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
                console.log(i,j);
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
     * WebGL, draws a line through the winning position
     */
    Game.prototype.endScene = function(){
      if(this.gl){ // WebGL

      }else{ // SVG, just display a rect over the board that say who won
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
        if(this.gameTied()){
          text.setAttribute("class", "tie");
          text2.setAttribute("class", "tie");
          text2.innerHTML = "Tie";
          rect.setAttribute("class", "background-tie");
        }else{
          rect.setAttribute("class", "background-winner" + this.currentPlayer);
          text.setAttribute("class", "winner" + this.currentPlayer);
          text2.setAttribute("class", "winner" + this.currentPlayer);
          text2.innerHTML = "Winner: Player " + this.currentPlayer;
        }

        boardSVG.appendChild(rect);
        boardSVG.appendChild(text);
        boardSVG.appendChild(text2);

      }
    };
  }
}
