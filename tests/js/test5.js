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
		var posicion = lvlWidth*row + col;
		this.map[posicion] = newValue;
	};

	this.getMapTile = function(row, col){
		var posicion = lvlWidth*row + col;		
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
		
				lvlWidth = lineas[0].split(" ")[2];
				lvlHeight = lineas[1].split(" ")[2];				
				var indiceLinea = 4;
				for(var fila = 0; fila < lvlHeight ; fila++){
					var valoresFila = lineas[indiceLinea].split(" ");
					for(var columna = 0; columna < lvlWidth; columna++){				
						var valor = valoresFila[columna];						
						thisLevel.setMapTile(fila,columna,valor);						
					}
					indiceLinea++;
				}
			} 
		});
		
		
	};
	

	}; // end Level 
	
	
	var Pacman = function() {
		this.radius = 15;
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
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24
	};

	// thisLevel global para poder realizar las pruebas unitarias
	thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	thisLevel.printMap(); 



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


test('Mapa correctamente cargado', function(assert) {

  	var done = assert.async();
  	setTimeout(function() {
			// console.log(player.x);
 		   assert.ok( thisLevel.getMapTile(0,9) == 113, "Line 0, Column 9: wall");
 		   assert.ok( thisLevel.getMapTile(24,20) == 106, "Line 24, Column 21: wall");
 		   assert.ok( thisLevel.getMapTile(23,1) == 2, "Line 23, Column 1 : pellet");
 		   assert.ok( thisLevel.getMapTile(22,1) == 3, "Line 22, Column 1: power pellet");

    		   done();
  }, 1000);

});

