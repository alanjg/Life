var lifeGrid = { isPaused: true, rows: 200, cols: 200, grid: [], nextGrid: [], lodGrid: [], zoomFactor: 2 };
var activeStamp = 0;
var stamps = [
	{ name: "pixel", width: 1, height: 1, pattern: ["x"] },
	{ name: "star", width: 3, height: 3, pattern: [".x.", "x.x", ".x."] },
    { name: "eraser", width: 8, height: 8, pattern: ["........", "........", "........", "........", "........", "........", "........", "........"] },
    { name: "glider", width: 3, height: 3, pattern: [".x.", "..x", "xxx"] },
    {
        name: "glider gun", width: 36, height: 10, pattern: [
            "........................x...........",
            "......................x.x...........",
            "............xx......xx............xx",
            "...........x...x....xx............xx",
            "xx........x.....x...xx..............",
            "xx........x...x.xx....x.x...........",
            "..........x.....x.......x...........",
            "...........x...x....................",
            "............xx......................",
            "....................................",
        ]
    },
    {
        name: "queen bee", width: 5, height: 7, pattern: [
            "x....",
            "x.x..",
            ".x.x.",
            ".x..x",
            ".x.x.",
            "x.x..",
            "x...."
        ]
    },
    {
        name: "figure eight", width: 6, height: 6, pattern: [
            "xx....",
            "xx.x..",
            "....x.",
            ".x....",
            "..x.xx",
            "....xx"
        ]
    },
    {
        name: "puffer", width: 9, height: 18, pattern: [
            "...x.....",
            ".x...x...",
            "x........",
            "x....x...",
            "xxxxx....",
            ".........",
            ".........",
            ".........",
            ".xx......",
            "xx.xxx...",
            ".xxxx....",
            "..xx.....",
            ".........",
            ".....xx..",
            "...x....x",
            "..x......",
            "..x.....x",
            "..xxxxxx."
        ]
    }
];
var hasTouch = false;

function onClick(args) {
    if (!hasTouch) {
        handleSet(args.x, args.y, true);
	}
}

function onTouchMove(args) {
	hasTouch = true;
	for (var i = 0; i < args.targetTouches.length; i++) {
		handleSet(args.targetTouches[i].clientX, args.targetTouches[i].clientY, true);
	}
}

function onTouchStart(args) {
	hasTouch = true;
	for (var i = 0; i < args.targetTouches.length; i++) {
		handleSet(args.targetTouches[i].clientX, args.targetTouches[i].clientY, true);
	}
}

function onMove(args) {
	if (lifeGrid.isPaused && args.buttons != 0) {
		handleSet(args.x, args.y, true);
	}
}

function handleSet(x, y, value) {
	if (lifeGrid.isPaused) {
		var grid = document.getElementById('canvas');
		var rect = grid.getBoundingClientRect();
		var xx = x - rect.left;
		var yy = y - rect.top;
		var col = Math.floor(xx / lifeGrid.zoomFactor);
		var row = Math.floor(yy / lifeGrid.zoomFactor);
		if (row >= 0 && row < lifeGrid.rows && col >= 0 && col < lifeGrid.cols) {
		//	lifeGrid.grid[row][col] = value;
			writeStamp(row, col, stamps[activeStamp]);
		}
		drawGrid();
	}
}

function writeStamp(row, col, stamp) {
	for (var r = 0; r < stamp.pattern.length; r++) {
		for (var c = 0; c < stamp.pattern[r].length; c++) {
			lifeGrid.grid[row + r][col + c] = (stamp.pattern[r][c] == 'x') ? true : false;
		}
	}
}

function createSetStamp(index) {
    return function () {
        activeStamp = index;
    }
}

function initGrid() {
	var container = document.getElementById('container');
	var rect = container.getBoundingClientRect();
	lifeGrid.cols = Math.floor(rect.width);
	lifeGrid.rows = Math.floor(rect.height * .9);
	var canvas = document.getElementById('canvas');
	canvas.width = lifeGrid.cols;
	canvas.height = lifeGrid.rows;
	canvas.addEventListener('click', onClick);
	canvas.addEventListener('mousemove', onMove);
	canvas.addEventListener('touchstart', onTouchStart);
	canvas.addEventListener('touchmove', onTouchMove);
	for (var i = 0; i < lifeGrid.rows; i++) {
		lifeGrid.grid.push([]);
		lifeGrid.nextGrid.push([]);
		for (var j = 0; j < lifeGrid.cols; j++) {
			lifeGrid.grid[i].push(false);
			lifeGrid.nextGrid[i].push(false);
		}
	}

	var stampContainer = document.getElementById('stampContainer');
	for(var i = 0;i<stamps.length;i++)
	{
		var button = document.createElement('button');
		button.innerText = stamps[i].name;
		button.onclick = createSetStamp(i);
		stampContainer.appendChild(button);
	}
}

function playPauseClick(e) {
	lifeGrid.isPaused = !lifeGrid.isPaused;
	if (!lifeGrid.isPaused) {
		window.requestAnimationFrame(animate);
	}
	document.getElementById('playPauseButton').innerText = lifeGrid.isPaused ? "play" : "pause";
}

function zoomInClick(e) {
	var newZoom = lifeGrid.zoomFactor * 2;
	if(newZoom <= 64) {
		lifeGrid.zoomFactor = newZoom;
		drawGrid();
	}
}

function zoomOutClick(e) {
	var newZoom = lifeGrid.zoomFactor / 2;
	if(newZoom >= 1) {
		lifeGrid.zoomFactor = newZoom;
		drawGrid();
	}
}

function animate() {
	updateGrid();
	drawGrid();
	if (!lifeGrid.isPaused) {
		window.requestAnimationFrame(animate);
	}
}

var dx = [0, 0, -1, -1, -1, 1, 1, 1];
var dy = [-1, 1, -1, 0, 1, -1, 0, 1];

function updateGrid() {
	for (var i = 0; i < lifeGrid.rows; i++) {
		for (var j = 0; j < lifeGrid.cols; j++) {
			var neighbors = 0;
			for (var k = 0; k < 8; k++) {
				var ii = i + dx[k];
				var jj = j + dy[k];
			    if (ii >= 0 && ii < lifeGrid.rows && jj >= 0 && jj < lifeGrid.cols) 
				{
					if (lifeGrid.grid[ii][jj]) {
						neighbors++;
					}
				}
			}
			var result = neighbors == 3 || neighbors == 2 && lifeGrid.grid[i][j] == true;
			lifeGrid.nextGrid[i][j] = result;
		}
	}
	var temp = lifeGrid.nextGrid;
	lifeGrid.nextGrid = lifeGrid.grid;
	lifeGrid.grid = temp;
}

function drawGrid() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, lifeGrid.cols, lifeGrid.rows);
	ctx.fillStyle = "#000000";
	for (var i = 0; i < lifeGrid.rows; i++) {
		for (var j = 0; j < lifeGrid.cols; j++) {
			if (lifeGrid.grid[i][j] == true) {
				ctx.fillRect(j * lifeGrid.zoomFactor, i * lifeGrid.zoomFactor, lifeGrid.zoomFactor, lifeGrid.zoomFactor);
			}
		}
	}
}

(function () {
	"use strict";

	document.addEventListener('deviceready', onDeviceReady.bind(this), false);

	function onDeviceReady() {
		// Handle the Cordova pause and resume events
		document.addEventListener('pause', onPause.bind(this), false);
		document.addEventListener('resume', onResume.bind(this), false);

		initGrid();

	};

	function onPause() {
		// TODO: This application has been suspended. Save application state here.
	};

	function onResume() {
		// TODO: This application has been reactivated. Restore application state here.
	};
})();