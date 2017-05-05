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
		
		$.get('./res/levels/1.txt', function(data) {
			if (data == 'ON') {				
			}else{
				
				var lineas = data.split("\n");
		
				thisLevel.lvlWidth = lineas[0].split(" ")[2];
				thisLevel.lvlHeight = lineas[1].split(" ")[2];
				
				var indiceLinea = 4;
				for(var fila = 0; fila < thisLevel.lvlHeight ; fila++){
					var valoresFila = lineas[indiceLinea].split(" ");
					for(var columna = 0; columna < thisLevel.lvlWidth; columna++){				
						var valor = valoresFila[columna];						
						thisLevel.setMapTile(fila,columna,valor);						
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
						ctx.fillStyle = "rgba(0,0,0,0)";
						ctx.fillRect(x,y,TILE_WIDTH,TILE_HEIGHT);
						ctx.fill();
					}else{
						//Valdosa vacia
						var x = col*TILE_WIDTH;
						var y = fila*TILE_HEIGHT;
						ctx.beginPath();
						ctx.fillStyle = "rgba(0,0,0,0)";
						ctx.fillRect(x,y,TILE_WIDTH,TILE_HEIGHT);
						ctx.fill();
					}
			}
		 }
	};

	}; // end Level 

	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 5;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
	};
	Pacman.prototype.move = function() {

		//Actualizamos posicion
		player.x += player.velX;
		player.y += player.velY;
				
		//Si se choca contra el muro derecho
		if(player.x+(player.radius*2) > w){
			//Establecemos nueva posicion
			player.x = w - player.radius*2;
			
		}
		//Si se choca contra el muro izquierdo
		if(player.x < 0){
			player.x = 0;
		}
		//Si se choca contra el muro arriba
		if(player.y < 0){
			player.y = 0;
		}
		//Si se choca contra el muro abajo
		if(player.y+(player.radius*2) > h){
			//Establecemos nueva posicion
			player.y = h - player.radius*2;			
		}
	};


     // Función para pintar el Pacman
     Pacman.prototype.draw = function(x, y) {
         
            // Pac Man
	    var radio = player.radius;
		var pX = player.x;
		var pY = player.y;
		ctx.beginPath();		
		ctx.arc(pX+radio,pY+radio,radio,player.angle1*Math.PI,player.angle2*Math.PI,false);
		ctx.lineTo(pX+radio,pY+radio);
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
		//Actualizamos la direccion en funcion de la tecla pulsada
		if(inputStates.up == true){
			player.velX = 0;
			player.velY = -player.speed;
		}else if(inputStates.down == true){
			player.velX = 0;
			player.velY = player.speed;			
		}else if(inputStates.left == true){
			player.velX = -player.speed;
			player.velY = 0;			
		}else if(inputStates.right == true){
			player.velX = player.speed;
			player.velY = 0;			
		}else{
			player.velX = 0;
			player.velY = 0;	
		}
	
	};


 
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
     
	checkInputs();
 
        // Clear the canvas
        clearCanvas();
   
	thisLevel.drawMap();

	player.move();
 
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


    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
       
	addListeners();

	player.x = 0;
	player.y = 0; 
	player.velY = 0;
	player.velX = player.speed;
 
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

test('Mapa correctamente dibujado en pantalla', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {


	     	   assert.pixelEqual( canvas,  35,35, 0, 0, 255, 255,"esquina superior izquierda azul"); 
	     	   assert.pixelEqual( canvas, 250,35, 0, 0, 0, 0,"puerta superior negra");
	     	   assert.pixelEqual( canvas, 465,35, 0, 0, 255, 255,"esquina superior derecha azul");
	     	   assert.pixelEqual( canvas, 58,58, 255, 255, 255,255,"primera pi'ldora esquina superior izquierda blanca");
	     	   assert.pixelEqual( canvas, 58,82, 255, 0,0,255,"pi'ldora de poder esquina superior izquierda roja");
	     	   assert.pixelEqual( canvas, 442,82, 255, 0,0,255,"pi'ldora de poder esquina superior derecha roja");

	     	   assert.pixelEqual( canvas, 35,300, 0, 0,0,0 ,"puerta lateral izquierda negra");
	     	   assert.pixelEqual( canvas, 252,300, 0, 0,0, 0,"centro de casa de los fantasmas negro");
	     	   assert.pixelEqual( canvas, 482, 300, 0, 0,0, 0,"puerta lateral derecha negra");
		
		   assert.pixelEqual( canvas, 12, 585, 0, 0,255,255,"esquina inferior izquierda azul"); 
	     	   assert.pixelEqual( canvas, 60, 538, 0, 0,255,255,"cuadrado interior esquina inferior izquierda azul");
	     	   assert.pixelEqual( canvas, 250,538, 255, 255,255,255,"pi'ldora central lateral inferior blanca");
	     	   assert.pixelEqual( canvas, 442,538, 0, 0,255,255,"cuadrado interior esquina inferior derecha azul");
		   assert.pixelEqual( canvas, 488,582, 0, 0,255,255,"esquina inferior derecha azul"); 

    		   done();
  }, 1000);

});

