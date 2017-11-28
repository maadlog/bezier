GameBox = function()
{
    this.lastFrameTime = Date.now();
    this.currentFrameTime = Date.now();
    this.timeElapsed = 0;

    this.gameObjects = [];
}

GameBox.prototype.gameLoop = function()
{
    window.requestAnimationFrame(this.gameLoop.bind(this));
    this.lastFrameTime = this.currentFrameTime;
    this.currentFrameTime = Date.now();
    this.timeElapsed =  this.currentFrameTime - this.lastFrameTime ;


    if (!!dragging) 
    {
    	//
    }


    this.update(this.timeElapsed); //modify data which is used to render
    this.render();
}

//GAME DATA

var ctx;
var canvasWidth;
var canvasHeight;
var colors = [
"red",	"green", "blue", "black",
"rgb( 61,118,149)",	"rgb(129, 63,156)",	"rgb(225,232, 87)",	"rgb(234,167, 88)",
"rgb( 37,100,134)",	"rgb(111, 38,140)",	"rgb(201,209, 49)",	"rgb(212,138, 50)",
"rgb( 20, 79,111)",	"rgb( 89, 20,116)",	"rgb(165,172, 23)",	"rgb(174,105, 24)",
"rgb(  5, 58, 86)",	"rgb( 66,  5, 90)",	"rgb(128,134,  1)",	"rgb(136, 74,  1)"
];

var points = [
 	new Vector(20,500),
	new Vector(170,30),
	new Vector(250,70),
	new Vector(360,100),
	new Vector(420,200),
	new Vector(475,200),
	new Vector(550,100)
	];
var trace = [];
var FinalOnly = false;
var PrintTrace = false;
var dragging = false;
var dragging_index = -1;
var creating = false;

var mouse = Vector.Zero;
var game = null;

BezierPoint = function(point) {
    this.point = point;
	this.time = 0;
	this.length = 2500;
}

BezierPoint.prototype.update = function(elapsed_ms)
{  
	this.time += elapsed_ms;
	if (this.time >= this.length) { this.time = 0; }
};

BezierPoint.prototype.render = function()
{
};

BezierGeneral = function (points,final) {

	this.FINAL = final;
	if (points.length > 2) {
		this.bezier_a = new BezierGeneral(   points.filter(function (x,idx) { return idx < points.length-1; }));
		this.bezier_b = new BezierGeneral(points.filter(function (x,idx) { return idx >= 1; }));
		
	}
	else {
		this.bezier_a = new BezierPoint(points[0]);
		this.bezier_b = new BezierPoint(points[1]);		
	}

	this.line = new Line(this.bezier_a.point,this.bezier_b.point);
	this.point = this.bezier_a.point;

	this.time = this.bezier_a.time;
	this.length = this.bezier_a.length;

	this.color = colors[points.length - 2];

}

BezierGeneral.prototype.update = function(elapsed_ms)
{  
	this.bezier_a.update(elapsed_ms);
	this.bezier_b.update(elapsed_ms);

	this.time = this.bezier_a.time;
	this.length = this.bezier_a.length;

	this.line = new Line(this.bezier_a.point,this.bezier_b.point,this.color);
	this.point = new Vector(this.bezier_b.point.x - this.bezier_a.point.x,this.bezier_b.point.y - this.bezier_a.point.y).Dot(this.bezier_a.time / this.bezier_a.length).Plus(this.bezier_a.point);


	if (this.FINAL && trace.length <= 250){
		trace.push(this.point);
	}
};

BezierGeneral.prototype.render = function()
{
	if (this.FINAL && PrintTrace){
		//Print Trace
		for (var i = trace.length - 1; i >= 0; i--) {
			ctx.fillStyle = "red";
		    ctx.beginPath();
		    ctx.arc(trace[i].x, trace[i].y, 2, 0, 2 * Math.PI, true);
		    ctx.fill();
		}
		if (FinalOnly) {
			this.point.render();	
		}
	}

	if (FinalOnly) {
		this.bezier_a.render();
		this.bezier_b.render();
	}
	else
	{
		this.point.render();	
		this.line.render();
		this.bezier_a.render();
		this.bezier_b.render();
	}

};

// GAME DATA END

GameBox.prototype.register = function(aGameObject) {
    this.gameObjects = [];
    this.gameObjects.push(aGameObject);
};

GameBox.prototype.update = function(timeElapsed)
{
    this.gameObjects.forEach( function (value,index,array) {
            value.update(timeElapsed);
        });
}

GameBox.prototype.render= function()
{
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	if (!!dragging || !!creating) {
		ctx.strokeStyle = "green";
	}
	 else {
		ctx.strokeStyle = "black";
	}
    ctx.strokeRect(0 , 0, canvasWidth, canvasHeight);

    this.gameObjects.forEach( function (value,index,array) {
        value.render();
    });

    points.forEach(function (value,index) {
    	value.render("green");
    });

    ctx.resetTransform();
}

function MousePosition(a_canvas, evt) {
        var rect = a_canvas.getBoundingClientRect();
        return new  Vector( evt.clientX - rect.left, evt.clientY - rect.top );
      }


function Init(){
    var canvas = document.getElementById('canvas')
    ctx = canvas.getContext("2d");
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

 
	canvas.addEventListener('mousedown', function(evt) {
		dragging_index = points.findIndex(function(point) { return point.Near(MousePosition(canvas, evt),10); } );
		
		dragging = dragging_index != (-1);
		if (!dragging) creating = true;
	}, false);
	 

	canvas.addEventListener('mouseup', function(evt) {
		
		if (creating){
			addPoint(MousePosition(canvas, evt));
			creating = false;
		}

		if (dragging){
			if(evt.shiftKey){
				deletePoint(dragging_index);
			}
			else {
				updatePoint(dragging_index);
			}
			
			dragging = false;
		}

	}, false);

    canvas.addEventListener('mousemove', function(evt) {
		if (!!dragging || !!creating)
		{
		    mouse = MousePosition(canvas, evt);
		}
	}, false);


    game = new GameBox();

	var line = new BezierGeneral(points,true);

    game.register(line);

    game.gameLoop();
}

function addPoint(aVector) {
	points.push(aVector);
}

function updatePoint(anIndex) {
	points[anIndex] = mouse;
}

function deletePoint(anIndex){
	points = points.filter(function (elem,index) {
		return index != anIndex;
	});
}


function SwapTrace() {
	PrintTrace = !PrintTrace;
}

function SwapFinal() {
	FinalOnly = !FinalOnly;
}

function Restart() {
	if (points.length < 2) { return; }
	trace = [];
	var line = new BezierGeneral(points,true);
    game.register(line);
}
