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

    const TILE_WIDTH=24, TILE_HEIGHT=24;
        var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost


	// hold ghost objects
	var ghosts = {};

    var Ghost = function(id, ctx){

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;
		
		this.nearestRow = 0;
		this.nearestCol = 0;
	
		this.ctx = ctx;
	
		this.id = id;
		this.homeX = 0;
		this.homeY = 0;
		
		this.radius = 9;
		
		//Variables para controlar la ultima bifurcacion tomada
		this.lastRow = 0;
		this.lastCol = 0;

	this.draw = function(){
		// Pintar cuerpo de fantasma		
		var radio = this.radius;
		// Pintar cuerpo de fantasma
		this.ctx.beginPath();
		this.ctx.moveTo(this.x - radio, this.y + radio);		
		this.ctx.quadraticCurveTo(this.x , this.y - (radio*3), this.x,this.y + radio);
		this.ctx.moveTo(this.x + radio, this.y + radio);		
		this.ctx.quadraticCurveTo(this.x , this.y - (radio*3), this.x,this.y + radio);		
		this.ctx.closePath();
		this.ctx.strokeStyle = "black";
		this.ctx.stroke();		
		this.ctx.fillStyle = ghostcolor[this.id];
		this.ctx.fill();		
		// Pintar ojos
		this.ctx.beginPath();
		this.ctx.arc(this.x - (radio/3),this.y -(radio/2),3,0,2*Math.PI,true);
		this.ctx.arc(this.x + (radio/3),this.y -(radio/2),3,0,2*Math.PI,true);
		this.ctx.closePath();
		this.ctx.strokeStyle = "black";
		this.ctx.stroke();		
		this.ctx.fillStyle = "white";
		this.ctx.fill();   

	}; // draw

	    	this.move = function() {

				var tileID = {
	    			'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3,
				'pellet': 2
				};
				var filaOrigen = Math.floor(this.y/thisGame.TILE_HEIGHT);
				var colOrigen = Math.floor(this.x/thisGame.TILE_WIDTH);
				//Comprobamos si estamos en puerta teletransportadora
				var idTile = thisLevel.getMapTile(filaOrigen,colOrigen);
				if(idTile == tileID['door-h']){						
					if(this.x < thisGame.TILE_WIDTH){
						//Si esta en la izquierda lo ponemos en la derecha					
						this.x = thisGame.TILE_WIDTH*thisLevel.lvlWidth - thisGame.TILE_WIDTH -this.radius -5;
					}else{
						//Si esta a la derecha lo ponemos en la izquierda
						this.x = thisGame.TILE_WIDTH + this.radius +5;						
					}				
				}else if(idTile == tileID['door-v']){					
					if(this.y < thisGame.TILE_HEIGHT){
						//Si esta arriba lo ponemos abajo
						this.y = thisGame.TILE_HEIGHT*thisLevel.lvlHeight -thisGame.TILE_HEIGHT - this.radius -5;
					}else{
						//Si esta abajo lo ponemos arriba
						this.y = thisGame.TILE_HEIGHT + this.radius +5;
					}
				}
				
				//Comprobamos si ya hemos buscado solucion en esta posicion 				
				if((filaOrigen != this.lastRow) || (colOrigen != this.lastCol)){					
					//Comprobamos si estamos sobra una baldosa					
					var fila2 = Math.floor((this.y + this.radius)/thisGame.TILE_HEIGHT);
					var fila3 = Math.floor((this.y - this.radius)/thisGame.TILE_HEIGHT);					
					var col2 = Math.floor((this.x + this.radius)/thisGame.TILE_WIDTH);
					var col3 = Math.floor((this.x - this.radius)/thisGame.TILE_WIDTH);
					var estaSobreBaldosa = (filaOrigen == fila2 && fila2 == fila3) && (colOrigen == col2 && col2 == col3);					
					
					if(estaSobreBaldosa){						
						var soluciones = [];						
						
						//Calculamos movimientos y si son posibles
						var filaM1 = filaOrigen+1;
						var colM1 = colOrigen;
						if(!thisLevel.isWall(filaM1,colM1) && this.velY >= 0){							
							soluciones.push(filaM1);
							soluciones.push(colM1);							
						}
						var filaM2 = filaOrigen-1;
						var colM2 = colOrigen;
						if(!thisLevel.isWall(filaM2,colM2) && this.velY <= 0){							
							soluciones.push(filaM2);
							soluciones.push(colM2);								
						}
						var filaM3 = filaOrigen;
						var colM3 = colOrigen+1;
						if(!thisLevel.isWall(filaM3,colM3) && this.velX >= 0){							
							soluciones.push(filaM3);
							soluciones.push(colM3);							
						}
						var filaM4 = filaOrigen;
						var colM4 = colOrigen-1;
						if(!thisLevel.isWall(filaM4,colM4) && this.velX <= 0){
							soluciones.push(filaM4);
							soluciones.push(colM4);							
						}						
						//Comprobamos cuantas soluciones hay
						var numSoluciones = soluciones.length/2;						
						this.lastRow = Math.floor(this.y/thisGame.TILE_HEIGHT);
						this.lastCol = Math.floor(this.x/thisGame.TILE_WIDTH);
						
						if(numSoluciones > 0){							
							//Obtenemos una aleatoria
							var numRandom = Math.floor(Math.random() * numSoluciones);
							var indice = numRandom * numSoluciones;
							//Obtenemos la solucion
							var filaSolucion = soluciones[indice];
							var colSolucion = soluciones[indice+1];	
							
							//Actualizamos las velocidades
							if(filaSolucion != filaOrigen){								
								if((filaSolucion > filaOrigen) && this.velY >=0){
									this.velY = this.speed;
								}else if(this.velY <=0){
									
									this.velY = -this.speed;
								}
								this.velX = 0;
							}else{								
								if((colSolucion > colOrigen) && this.velX >= 0){
									this.velX = this.speed;
								}else if(this.velX <= 0){
									this.velX = -this.speed;
								}
								this.velY = 0;
							}
						}else{
							//Si no hay soluciones invertimos la direccion
							
							if(this.velX > 0){
								this.velX = -this.speed;
							}else if(this.velX < 0){
								this.velX = this.speed;
							}else if(this.velY > 0){
								this.velY = -this.speed;
							}else{
								this.velY = this.speed;
							}
						}					
					}
				}
				//Actualizamos posicion				
				this.x +=this.velX;
				this.y +=this.velY;		
		};

	};

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
						if(valor == 2){
							thisLevel.pellets +=1;
						}
						if(valor == 4){							
							player.homeX = columna*thisGame.TILE_WIDTH+(thisGame.TILE_WIDTH/2);							
							player.homeY = fila*thisGame.TILE_HEIGHT+(thisGame.TILE_WIDTH/2);							
						}
						//Fantasmas
						if(valor == 10){
							ghosts[0].homeX = columna*thisGame.TILE_WIDTH+(thisGame.TILE_WIDTH/2);
							ghosts[0].homeY = fila*thisGame.TILE_HEIGHT+(thisGame.TILE_WIDTH/2);
						}else if(valor == 11){
							ghosts[1].homeX = columna*thisGame.TILE_WIDTH+(thisGame.TILE_WIDTH/2);
							ghosts[1].homeY = fila*thisGame.TILE_HEIGHT+(thisGame.TILE_WIDTH/2);
						}else if(valor == 12){
							ghosts[2].homeX = columna*thisGame.TILE_WIDTH+(thisGame.TILE_WIDTH/2);
							ghosts[2].homeY = fila*thisGame.TILE_HEIGHT+(thisGame.TILE_WIDTH/2);
						}else if(valor == 13){
							ghosts[3].homeX = columna*thisGame.TILE_WIDTH+(thisGame.TILE_WIDTH/2);
							ghosts[3].homeY = fila*thisGame.TILE_HEIGHT+(thisGame.TILE_WIDTH/2);
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

		//Actualizamos la variable de las pildoras
		thisLevel.powerPelletBlinkTimer +=1;
		if(thisLevel.powerPelletBlinkTimer > 60){
			thisLevel.powerPelletBlinkTimer =0;
		}
		
		//Dibujamos
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
						//Comprobamos si pintamos o no
						if(thisLevel.powerPelletBlinkTimer < 30){
							var x = col*TILE_WIDTH+(TILE_WIDTH/2);
							var y = fila*TILE_HEIGHT+(TILE_HEIGHT/2);
						
							ctx.beginPath();
							ctx.arc(x,y,3,0,2*Math.PI,false);
							ctx.strokeStyle = "red";
							ctx.stroke();
							ctx.fillStyle = "rgba(255,0,0,255)";
							ctx.fill();	
						}						
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

		this.checkIfHit = function(playerX, playerY, x, y, holgura){
			var diferenciaX = Math.abs(playerX - x);
			var diferenciaY = Math.abs(playerY - y);
			if((diferenciaX < holgura) && (diferenciaY < holgura)){
				return true;
			}else{
				return false;
			}
				
		};


		this.checkIfHitSomething = function(playerX, playerY, row, col){
			var tileID = {
	    			'door-h' : 20,
				'door-v' : 21,
				'pellet-power' : 3,
				'pellet': 2
			};

			// Tu código aquí
			//  Gestiona la recogida de píldoras
			var id = thisLevel.getMapTile(row,col);
			
			if(id == tileID['pellet']){
				//Restamos el numero pildoras y actualizamos el mapa
				thisLevel.pellets -= 1;
				thisLevel.setMapTile(row,col,0);
			}else if(id == tileID['pellet-power']){
				//Restamos el numero pildoras y actualizamos el mapa
				thisLevel.pellets -= 1;
				thisLevel.setMapTile(row,col,0);
			}
			// Tu código aquí (test9)
			//  Gestiona las puertas teletransportadoras
			if(id == tileID['door-h']){				
				if(player.x < thisGame.TILE_WIDTH){
					//Si esta en la izquierda lo ponemos en la derecha					
					player.x = thisGame.TILE_WIDTH*thisLevel.lvlWidth - thisGame.TILE_WIDTH -player.radius;
				}else{
					//Si esta a la derecha lo ponemos en la izquierda
					player.x = thisGame.TILE_WIDTH + player.radius;
					
				}
				
			}else if(id == tileID['door-v']){
				if(player.y < thisGame.TILE_HEIGHT){
					//Si esta arriba lo ponemos abajo
					player.y = thisGame.TILE_HEIGHT*thisLevel.lvlHeight -thisGame.TILE_HEIGHT - player.radius;
				}else{
					//Si esta abajo lo ponemos arriba
					player.y = thisGame.TILE_HEIGHT + player.radius;
				}
			}
		};

	}; // end Level 

	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	Pacman.prototype.move = function() {

		// Tu código aquí
		//Obtenemos la posicion donde se mueve		
		var nuevaX = player.x + player.velX;
		var nuevaY = player.y + player.velY;
		var col = Math.floor(nuevaX/thisGame.TILE_WIDTH);
		var fila = Math.floor(nuevaY/thisGame.TILE_HEIGHT);
		
		//Comprobamos si puede moverse
		var puedeMoverse = !thisLevel.checkIfHitWall(nuevaX,nuevaY,fila,col);		
		if(puedeMoverse){
			//Si puede actualizamos posicion
			player.x = nuevaX;
			player.y = nuevaY;
		}	
		// tras actualizar this.x  y  this.y... 
		 // check for collisions with other tiles (pellets, etc)
		col = Math.floor(player.x/thisGame.TILE_WIDTH);
		fila = Math.floor(player.y/thisGame.TILE_HEIGHT);
		thisLevel.checkIfHitSomething(player.x, player.y, fila, col);
		
		//Comprobamos colision con fantasmas
		for(var i = 0; i < numGhosts ;i++){
			var gX = ghosts[i].x;
			var gY = ghosts[i].y;
			if(thisLevel.checkIfHit(this.x,this.y,gX,gY,10)){
				console.log("choque con fantasma");
			}
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
	for (var i=0; i< numGhosts; i++){
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}


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

	// Mover fantasmas
	for (var i=0; i< numGhosts; i++){
		ghosts[i].move();
	}

	player.move();
        // Clear the canvas
        clearCanvas();
   
	thisLevel.drawMap();

	// Pintar fantasmas
	for (var i=0; i< numGhosts; i++){
		ghosts[i].draw();
	}


 
	player.draw();
        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
    };

    var addListeners = function(){
	    //add the listener to the main, window object, and update the states
	    // Tu código aquí
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
	// Tu código aquí (test10)
	// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente
	player.velX = player.speed;
	player.velY = 0;		
	player.x = player.homeX;
	player.y = player.homeY;
	// Tu código aquí (test10)
	// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente
	
	for (var i=0; i< numGhosts; i++){
		ghosts[i].speed = 2;		
		ghosts[i].x = ghosts[i].homeX;
		ghosts[i].y = ghosts[i].homeY;
		ghosts[i].lastRow = Math.floor(ghosts[i].y/thisGame.TILE_HEIGHT);
		ghosts[i].lastCol = Math.floor(ghosts[i].x/thisGame.TILE_HEIGHT);		
	}	
	ghosts[0].velX = ghosts[0].speed;
	ghosts[0].velY = 0;
	ghosts[1].velX = ghosts[1].speed;
	ghosts[1].velY = 0;
	ghosts[2].velX = 0;
	ghosts[2].velY = -ghosts[2].speed;
	ghosts[3].velX = -ghosts[3].speed;
	ghosts[3].velY = 0;
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
        start: start,		 
    };
};



  var game = new GF();
  game.start();

test('Choque con fantasmas', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
		var playerX = 240, playerY = 555, x = 23, y = 10, holgura = 10;
		assert.ok( thisLevel.checkIfHit(playerX, playerY, x, y, holgura) == false, "NO hay choque");

		playerX = 240, playerY = 555, x = 235, y = 550, holgura = 10;
		assert.ok( thisLevel.checkIfHit(playerX, playerY, x, y, holgura) == true, "Hay choque");

  		playerX = 240, playerY = 555, x = 235, y = 566, holgura = 10;
		assert.ok( thisLevel.checkIfHit(playerX, playerY, x, y, holgura) == false, "No hay choque");

	 done();

  }, 1000);

});
