// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;


// GAME FRAMEWORK 
var GF = function(){

 // variables para contar frames/s, usadas por measureFPS
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps; 
 
    //  variable global temporalmente para poder testear el ejercicio
    inputStates = {};


	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		
		this.map = [];
		
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

	this.setMapTile = function(row, col, newValue){
		var posicion = thisLevel.lvlWidth*row + col;
		this.map[posicion] = newValue;
	};

	this.getMapTile = function(row, col){
		var posicion = thisLevel.lvlWidth*row + col;
		return this.map[posicion];
	};

	this.printMap = function(){
		// tu código aquí
	};

	this.loadLevel = function(){
		// leer res/levels/1.txt y guardarlo en el atributo map	
		// haciendo uso de setMapTile		
		$.ajax({ url: './res/levels/1.txt', 
         async: false,         
         success: function(data) {
              var lineas = data.split("\n");
		
				thisLevel.lvlWidth = lineas[0].split(" ")[2];
				thisLevel.lvlHeight = lineas[1].split(" ")[2];
				
				var indiceLinea = 4;
				for(var fila = 0; fila < thisLevel.lvlHeight ; fila++){
					var valoresFila = lineas[indiceLinea].split(" ");
					for(var columna = 0; columna < thisLevel.lvlWidth; columna++){				
						var valor = valoresFila[columna];						
						thisLevel.setMapTile(fila,columna,valor);						
						if(valor == 4){							
							player.homeX = columna*thisGame.TILE_WIDTH+(thisGame.TILE_WIDTH/2);							
							player.homeY = fila*thisGame.TILE_HEIGHT+(thisGame.TILE_WIDTH/2);							
						}
					}
					indiceLinea++;
				}				
            }
        });
		
			
	};
		
		
		

         this.drawMap = function(){

	    	var TILE_WIDTH = thisGame.TILE_WIDTH;
	    	var TILE_HEIGHT = thisGame.TILE_HEIGHT;

    		var tileID = {
	    		'door-h' : 20,
			'door-v' : 21,
			'pellet-power' : 3
		};

		 for(var fila = 0; fila < thisLevel.lvlHeight; fila++){
			  for(var col = 0; col < thisLevel.lvlWidth; col++){
					var valor = thisLevel.getMapTile(fila,col);
					
					if(valor >= 100 && valor <= 199){
						//Si es pared
						
						var x = col*TILE_WIDTH;
						var y = fila*TILE_HEIGHT;
						ctx.beginPath();
						ctx.fillStyle = "rgba(0,0,255,255)";
						ctx.fillRect(x,y,TILE_WIDTH,TILE_HEIGHT);
						ctx.fill();
						
					}else if(valor == 2){
						//Si es pildora
						var x = col*TILE_WIDTH+(TILE_WIDTH/2);
						var y = fila*TILE_HEIGHT+(TILE_HEIGHT/2);
						ctx.beginPath();
						ctx.arc(x,y,3,0,2*Math.PI,false);
						ctx.strokeStyle = "white";
						ctx.stroke();
						ctx.fillStyle = "rgba(255,255,255,255)";
						ctx.fill();
						
					}else if(valor == 3){
						//Si es pildora poder
						var x = col*TILE_WIDTH+(TILE_WIDTH/2);
						var y = fila*TILE_HEIGHT+(TILE_HEIGHT/2);
						
						ctx.beginPath();
						ctx.arc(x,y,3,0,2*Math.PI,false);
						ctx.strokeStyle = "red";
						ctx.stroke();
						ctx.fillStyle = "rgba(255,0,0,255)";
						ctx.fill();
						
					}else if(valor == 20 || valor == 21){
						//Puerta 
						var x = col*TILE_WIDTH;
						var y = fila*TILE_HEIGHT;
						ctx.beginPath();
						ctx.fillStyle = "black";
						ctx.fillRect(x,y,TILE_WIDTH,TILE_HEIGHT);
						ctx.fill();
					}else{
						//Valdosa vacia
						var x = col*TILE_WIDTH;
						var y = fila*TILE_HEIGHT;
						ctx.beginPath();
						ctx.fillStyle = "black";
						ctx.fillRect(x,y,TILE_WIDTH,TILE_HEIGHT);
						ctx.fill();
					}
			}
		 }
	};


		this.isWall = function(row, col) {
			var v = thisLevel.getMapTile(row,col);			
			if(v >= 100 && v <= 199){
				return true;
			}else{
				return false;
			}
		};


		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
				// Tu código aquí
				// Determinar si el jugador va a moverse a una fila,columna que tiene pared 
				// Hacer uso de isWall				
				
				//Comprobamos cada esquina
				
				var col1 = Math.floor((possiblePlayerX-player.radius)/thisGame.TILE_WIDTH);
				var fila1 = Math.floor((possiblePlayerY-player.radius)/thisGame.TILE_HEIGHT);
				
				var col2 = Math.floor((possiblePlayerX+player.radius)/thisGame.TILE_WIDTH);
				var fila2 = Math.floor((possiblePlayerY+player.radius)/thisGame.TILE_HEIGHT);
				
				var col3 = Math.floor((possiblePlayerX+player.radius)/thisGame.TILE_WIDTH);
				var fila3 = Math.floor((possiblePlayerY-player.radius)/thisGame.TILE_HEIGHT);
				
				var col4 = Math.floor((possiblePlayerX-player.radius)/thisGame.TILE_WIDTH);
				var fila4 = Math.floor((possiblePlayerY+player.radius)/thisGame.TILE_HEIGHT);				
				
				//Comprobamos si hay muro
				var hayMuro = thisLevel.isWall(fila1,col1) || thisLevel.isWall(fila2,col2) || thisLevel.isWall(fila3,col3) || thisLevel.isWall(fila4,col4) ;
				return hayMuro;
		};

	}; // end Level 

	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.homeX = 0;
		this.homeY = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;		
	};
	Pacman.prototype.move = function() {

		//Obtenemos la posicion donde se mueve		
		var nuevaX = player.x + player.velX;
		var nuevaY = player.y + player.velY;
		
		//Comprobamos si puede moverse
		var puedeMoverse = !thisLevel.checkIfHitWall(nuevaX,nuevaY,nuevaX/thisGame.TILE_WIDTH,nuevaY/thisGame.TILE_WIDTH);		
		if(puedeMoverse){
			//Si puede actualizamos posicion
			player.x = nuevaX;
			player.y = nuevaY;
		}	
		
	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
         
        // Pac Man
	    var radio = player.radius;
		var pX = player.x;
		var pY = player.y;		
		ctx.beginPath();		
		ctx.arc(pX,pY,radio,player.angle1*Math.PI,player.angle2*Math.PI,false);
		ctx.lineTo(pX,pY);
		ctx.closePath();
		ctx.strokeStyle = "black";
		ctx.stroke();
		
		ctx.fillStyle = "yellow";
		ctx.fill();  	             
    };

	var player = new Pacman();

	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		screenTileSize: [24, 21],
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24
	};

	// thisLevel global para poder realizar las pruebas unitarias
	thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	// thisLevel.printMap(); 



	var measureFPS = function(newTime){
		// la primera ejecución tiene una condición especial

		if(lastTime === undefined) {
			lastTime = newTime; 
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		var diffTime = newTime - lastTime; 

		if (diffTime >= 1000) {

			fps = frameCount;    
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps; 
		frameCount++;
	};

	// clears the canvas content
	var clearCanvas = function() {
		ctx.clearRect(0, 0, w, h);
	};

	var checkInputs = function(){
		// tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7
		
		//Actualizamos la direccion en funcion de la tecla pulsada
		if(inputStates.up == true){
			//Obtenemos la posicion donde se mueve		
			var nuevaX = player.x;
			var nuevaY = player.y-player.speed;		
			//Comprobamos si puede moverse
			var puedeMoverse = !thisLevel.checkIfHitWall(nuevaX,nuevaY,nuevaX/thisGame.TILE_WIDTH,nuevaY/thisGame.TILE_WIDTH);		
			if(puedeMoverse){
				//Si puede actualizamos la velocidad
				player.velX = 0;
				player.velY = -player.speed;
			}			
		}else if(inputStates.down == true){
			//Obtenemos la posicion donde se mueve		
			var nuevaX = player.x;
			var nuevaY = player.y+player.speed;		
			//Comprobamos si puede moverse
			var puedeMoverse = !thisLevel.checkIfHitWall(nuevaX,nuevaY,nuevaX/thisGame.TILE_WIDTH,nuevaY/thisGame.TILE_WIDTH);		
			if(puedeMoverse){
				//Si puede actualizamos la velocidad
				player.velX = 0;
				player.velY = player.speed;	
			}
					
		}else if(inputStates.left == true){
			//Obtenemos la posicion donde se mueve		
			var nuevaX = player.x-player.speed;
			var nuevaY = player.y;		
			//Comprobamos si puede moverse
			var puedeMoverse = !thisLevel.checkIfHitWall(nuevaX,nuevaY,nuevaX/thisGame.TILE_WIDTH,nuevaY/thisGame.TILE_WIDTH);		
			if(puedeMoverse){
				//Si puede actualizamos la velocidad
				player.velX = -player.speed;
				player.velY = 0;
			}
						
		}else if(inputStates.right == true){
			//Obtenemos la posicion donde se mueve		
			var nuevaX = player.x+player.speed;
			var nuevaY = player.y;		
			//Comprobamos si puede moverse
			var puedeMoverse = !thisLevel.checkIfHitWall(nuevaX,nuevaY,nuevaX/thisGame.TILE_WIDTH,nuevaY/thisGame.TILE_WIDTH);		
			if(puedeMoverse){
				//Si puede actualizamos la velocidad
				player.velX = player.speed;
				player.velY = 0;		
			}				
		}
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
	checkInputs();
 
	player.move();
        // Clear the canvas
    clearCanvas();
   
	thisLevel.drawMap();

 
	player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
	   //add the listener to the main, window object, and update the states
		window.addEventListener( "keydown", teclaPulsada, false );
		function teclaPulsada(e){
			if(e.keyCode == 37){
				inputStates.left = true;
			}else if(e.keyCode == 38){
				inputStates.up = true;
			}else if(e.keyCode == 39){
				inputStates.right = true;
			}else if(e.keyCode == 40){
				inputStates.down = true;
			}
		}
		window.addEventListener( "keyup", teclaLiberada, false );
		function teclaLiberada(e){
			if(e.keyCode == 37){
				inputStates.left = false;
			}else if(e.keyCode == 38){
				inputStates.up = false;
			}else if(e.keyCode == 39){
				inputStates.right = false;
			}else if(e.keyCode == 40){
				inputStates.down = false;
			}
		}
    };

    var reset = function(){
	// Tu código aquí
	// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
	// inicializa la posición inicial de Pacman tal y como indica el enunciado
		
		player.velX = player.speed;
		player.velY = 0;		
		player.x = player.homeX;
		player.y = player.homeY;		
    };

    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
       
	addListeners();

	reset();

        // start the animation
        requestAnimationFrame(mainLoop);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
};



  var game = new GF();
  game.start();


test('checkIfHitWall bien implementado', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		//Sumo o resto radio del jugador dependiendo la direccion para obtener la posicion centrada 
		var x = 315-10, y = 384, speed = 5, nearestRow = 16, nearestCol = 13;
		assert.ok( thisLevel.checkIfHitWall( x, y - speed, nearestRow, nearestCol ) == true , "entrar demasiado pronto por la primera salida hacia arriba de la pos. original" );
		x = 312 +10; 
		assert.ok( thisLevel.checkIfHitWall( x, y - speed, nearestRow, nearestCol ) == false , "entrar OK por la primera salida hacia arriba de la pos. original" );	
		x = 240 , y = 144+10, nearestRow = 6, nearestCol = 10;
		assert.ok( thisLevel.checkIfHitWall( x - speed, y , nearestRow, nearestCol ) == false , "apertura horizontal superior izquierda, entrando correctamente hacia la izquierda, no hay pared");
		y = 147 -10;			
		assert.ok( thisLevel.checkIfHitWall( x - speed, y , nearestRow, nearestCol ) == true , "apertura horizontal superior izquierda, entrando demasiado tarde hacia la izquierda, hay pared");
    		   done();
  }, 1000);

});

