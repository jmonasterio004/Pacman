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
  
    var Pacman = function() {
        this.radius = 15;
		this.posX = 0;
		this.posY = 0;
		this.speed = 5;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
    };
    
    pacman = new Pacman();
    
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
     function clearCanvas() {
       ctx.clearRect(0, 0, w, h);
     }
  
     // Función para pintar el Pacman
     function drawPacman(x, y) {
         
         // Pac Man		 
	    
		var radio = pacman.radius;

		ctx.beginPath();		
		ctx.arc(x+radio,y+radio,radio,0.25*Math.PI,1.75*Math.PI,false);
		ctx.lineTo(x+radio,y+radio);
		ctx.closePath();
		ctx.strokeStyle = "black";
		ctx.stroke();
		
		ctx.fillStyle = "yellow";
		ctx.fill();
		 
		

		         
    }
  
    var mainLoop = function(time){
        //main function, called each frame 
        measureFPS(time);
      
        // Clear the canvas
        clearCanvas();
        
        // draw pacman
        drawPacman(10, 100);
      
        // call the animation loop every 1/60th of second
		requestAnimationFrame(mainLoop);
    };

    var start = function(){
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);
        
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

 test('Testeando colores', function(assert) {  
   // canvas, x,y, r,g,b, a, mezua
   var done = assert.async();
 
//   ctx.fillStyle = 'red';
//   ctx.fillRect(20,110,4,4);    


	setTimeout(function() { 

	     	assert.pixelEqual( canvas, 25,110, 255, 255,0,255,"Passed!"); 
		done();
	}, 1000);

});
	


