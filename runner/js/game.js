var Colors = {
	cherry: 0xe35d6a,
	blue: 0x1560bd,
	white: 0xd8d0d1,
	black: 0x000000,
	brown: 0x59332e,
	peach: 0xffdab9,
	yellow: 0xffff00,
	red: 0xF08080,
	orange: 0xFFA500,
	grey: 0x696969,
	sand: 0xc2b280,
	brownDark: 0x23190f,
	green: 0x669900,
};

var deg2Rad = Math.PI / 180;

// Make a new world when the page is loaded.
window.addEventListener('load', function(){
	new World();
});

function World() {

	// Explicit binding of this even in changing contexts.
	var self = this;

	// Scoped variables in this world.
	var element, scene, camera, ball, renderer, light,
		objects, paused, keysAllowed, score,
		obstaclePresenceProb, maxObstacleSize, fogDistance, gameOver;

	// Initialize the world.
	init();

	function init() {

		// Locate where the world is to be located on the screen.
		element = document.getElementById('world');

		// Initialize the renderer.
		renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
		renderer.setSize(element.clientWidth, element.clientHeight);
		renderer.shadowMap.enabled = true;
		element.appendChild(renderer.domElement);
		// Initialize the scene.
		scene = new THREE.Scene();
		fogDistance = 40000;
		scene.fog = new THREE.Fog(0xbadbe4, 1, fogDistance);

		// Initialize the camera with field of view, aspect ratio,
		// near plane, and far plane.
		camera = new THREE.PerspectiveCamera(60, element.clientWidth / element.clientHeight, 1, 120000);
		camera.position.set(0, 1500, -2000);
		camera.lookAt(new THREE.Vector3(0, 600, -5000));
		window.camera = camera;

		// Set up resizing capabilities.
		window.addEventListener('resize', handleWindowResize, false);

		// Initialize the lights.
		light = new THREE.DirectionalLight(0xffffff, 1);
		light.position.set(1, 2, 0);
		light.castShadow = true;
		scene.add(light);

		// Initialize the ball and add it to the scene.
		ball = new Ball();
		scene.add(ball.element);

		var ground = createBox(3000, 20, 120000, Colors.sand, 0, -400, -60000);
		scene.add(ground);

		objects = [];
		obstaclePresenceProb = 0.2;
		for (var i = 10; i < 40; i++) {
			createRowOfObstacles(i * -3000, obstaclePresenceProb, 0.5, maxObstacleSize);
		}

		// The game is paused to begin with and the game is not over.
		gameOver = false;
		paused = true;

		// Start receiving feedback from the player.
		var left = 37;
		var up = 38;
		var right = 39;
		var p = 80;
		
		keysAllowed = {};
		document.addEventListener(
			'keydown',
			function(e) {
				if (!gameOver) {
					var key = e.keyCode;
					if (keysAllowed[key] === false) return;
					keysAllowed[key] = false;
					if (paused && !collisionsDetected() && key > 18) {
						paused = false;
						ball.onUnpause();
						document.getElementById(
							"variable-content").style.visibility = "hidden";
						document.getElementById(
							"controls").style.display = "none";
					} else {
						if (key == p) {
							paused = true;
							ball.onPause();
							document.getElementById(
								"variable-content").style.visibility = "visible";
							document.getElementById(
								"variable-content").innerHTML = 
								"بازی استاپ شده، برای ادامه یه دکمه کلیک کن";
						}
						if (key == up && !paused) {
							ball.onUpKeyPressed();
						}
						if (key == left && !paused) {
							ball.onLeftKeyPressed();
						}
						if (key == right && !paused) {
							ball.onRightKeyPressed();
						}
					}
				}
			}
		);
		document.addEventListener(
			'keyup',
			function(e) {
				keysAllowed[e.keyCode] = true;
			}
		);
		document.addEventListener(
			'focus',
			function(e) {
				keysAllowed = {};
			}
		);

		// Initialize the scores .
		score = 0;
		document.getElementById("score").innerHTML = score;

		// Begin the rendering loop.
		loop();

	}

	function loop() {

		// Update the game.
		if (!paused) {

			// Add more obstacles
			if ((objects[objects.length - 1].mesh.position.z) % 3000 == 0) {

				createRowOfObstacles(-120000, 0.5 , 0.5);
			}

			// Move the obstacles closer to the ball.
			objects.forEach(function(object) {
				object.mesh.position.z += 100;
			});

			// Remove obstacles that are outside of the world.
			objects = objects.filter(function(object) {
				return object.mesh.position.z < 0;
			});

			// Make the ball move according to the controls.
			ball.update();

			// Check for collisions between the ball and objects.
			if (collisionsDetected()) {
				gameOver = true;
				paused = true;
				document.addEventListener(
        			'keydown',
        			function(e) {
        				if (e.keyCode == 40)
            			document.location.reload(true);
        			}
    			);
    			var variableContent = document.getElementById("variable-content");
    			variableContent.style.visibility = "visible";
    			variableContent.innerHTML = 
    				"خیلی لوزری. برای شروع دوباره دکمه ی پایین رو فشار بده";
    			var table = document.getElementById("ranks");
    			var rankIndex = Math.floor(score / 15000);
			}

			// Update the scores.
			score += 10;
			document.getElementById("score").innerHTML = score;

		}

		// Render the page and repeat.
		renderer.render(scene, camera);
		requestAnimationFrame(loop);
	}

	function handleWindowResize() {
		renderer.setSize(element.clientWidth, element.clientHeight);
		camera.aspect = element.clientWidth / element.clientHeight;
		camera.updateProjectionMatrix();
	}

	function createRowOfObstacles(position, probability, scale) {
		for (var lane = -1; lane < 2; lane++) {
			var randomNumber = Math.random();
			if (randomNumber < probability) {
				var scale = scale;
				var obstacle = new Obstacle(lane * 800, -400, position, scale);
				objects.push(obstacle);
				scene.add(obstacle.mesh);
			}
		}
	}

 	function collisionsDetected() {
 		var charMinX = ball.element.position.x - 115;
 		var charMaxX = ball.element.position.x + 115;
 		var charMinY = ball.element.position.y - 310;
 		var charMaxY = ball.element.position.y + 320;
 		var charMinZ = ball.element.position.z - 40;
 		var charMaxZ = ball.element.position.z + 40;
 		for (var i = 0; i < objects.length; i++) {
 			if (objects[i].collides(charMinX, charMaxX, charMinY, 
 					charMaxY, charMinZ, charMaxZ)) {
 				return true;
 			}
 		}
 		return false;
 	}
	
}


function Ball() {

	// Explicit binding of this even in changing contexts.
	var self = this;

	// Ball defaults that don't change throughout the game.
	this.sphereColor = Colors.red;
	this.jumpDuration = 0.6;
	this.jumpHeight = 2000;

	// Initialize the ball.
	init();
	
	function init() {

		// Build the ball.
		
		self.sphere = createSphere(150, 150, 150, self.sphereColor, 50, -180, 0);

		self.element = createGroup(0, 0, -4000);
		self.element.add(self.sphere);

		// Initialize the player's changing parameters.
		self.isJumping = false;
		self.isSwitchingLeft = false;
		self.isSwitchingRight = false;
		self.currentLane = 0;
		self.runningStartTime = new Date() / 1000;
		self.pauseStartTime = new Date() / 1000;
		self.stepFreq = 2;
		self.queuedActions = [];

	}




	this.update = function() {

		// Obtain the curren time for future calculations.
		var currentTime = new Date() / 1000;

		// Apply actions to the ball if none are currently being
		// carried out.
		if (!self.isJumping &&
			!self.isSwitchingLeft &&
			!self.isSwitchingRight &&
			self.queuedActions.length > 0) {
			switch(self.queuedActions.shift()) {
				case "up":
					self.isJumping = true;
					self.jumpStartTime = new Date() / 1000;
					break;
				case "left":
					if (self.currentLane != -1) {
						self.isSwitchingLeft = true;
					}
					break;
				case "right":
					if (self.currentLane != 1) {
						self.isSwitchingRight = true;
					}
					break;
			}
		}

		// If the ball is jumping, update the height of the ball.
		// Otherwise, the ball continues running.
		if (self.isJumping) {
			var jumpClock = currentTime - self.jumpStartTime;
			self.element.position.y = self.jumpHeight * Math.sin(
				(1 / self.jumpDuration) * Math.PI * jumpClock) +
				sinusoid(2 * self.stepFreq, 0, 20, 0,
					self.jumpStartTime - self.runningStartTime);
			if (jumpClock > self.jumpDuration) {
				self.isJumping = false;
				self.runningStartTime += self.jumpDuration;
			}
		} else {
			var runningClock = currentTime - self.runningStartTime;
			self.element.position.y = sinusoid(2 * self.stepFreq, 1, 20, 0, runningClock);
			// If the ball is not jumping, it may be switching lanes.
			if (self.isSwitchingLeft) {
				self.element.position.x -= 200;
				var offset = self.currentLane * 800 - self.element.position.x;
				if (offset > 800) {
					self.currentLane -= 1;
					self.element.position.x = self.currentLane * 800;
					self.isSwitchingLeft = false;
				}
			}
			if (self.isSwitchingRight) {
				self.element.position.x += 200;
				var offset = self.element.position.x - self.currentLane * 800;
				if (offset > 800) {
					self.currentLane += 1;
					self.element.position.x = self.currentLane * 800;
					self.isSwitchingRight = false;
				}
			}
		}
	}

	this.onLeftKeyPressed = function() {
		self.queuedActions.push("left");
	}

	this.onUpKeyPressed = function() {
		self.queuedActions.push("up");
	}

	this.onRightKeyPressed = function() {
		self.queuedActions.push("right");
	}

	this.onPause = function() {
		self.pauseStartTime = new Date() / 1000;
	}

	this.onUnpause = function() {
		var currentTime = new Date() / 1000;
		var pauseDuration = currentTime - self.pauseStartTime;
		self.runningStartTime += pauseDuration;
		if (self.isJumping) {
			self.jumpStartTime += pauseDuration;
		}
	}

}

function Obstacle(x, y, z, s) {

	// Explicit binding.
	var self = this;

	// The object portrayed in the scene.
	this.mesh = new THREE.Object3D();
    var trunk = createCone(830, 2300,42, Colors.orange, 0, 125, 0);
    this.mesh.add(trunk);
    this.mesh.position.set(x, y, z);
	this.mesh.scale.set(s, s, s);
	this.scale = s;

    this.collides = function(minX, maxX, minY, maxY, minZ, maxZ) {
    	var obstacleMinX = self.mesh.position.x - this.scale * 250;
    	var obstacleMaxX = self.mesh.position.x + this.scale * 250;
    	var obstacleMinY = self.mesh.position.y;
    	var obstacleMaxY = self.mesh.position.y + this.scale * 1150;
    	var obstacleMinZ = self.mesh.position.z - this.scale * 250;
    	var obstacleMaxZ = self.mesh.position.z + this.scale * 250;
    	return obstacleMinX <= maxX && obstacleMaxX >= minX
    		&& obstacleMinY <= maxY && obstacleMaxY >= minY
    		&& obstacleMinZ <= maxZ && obstacleMaxZ >= minZ;
    }

}

function sinusoid(frequency, minimum, maximum, phase, time) {
	var amplitude = 0.5 * (maximum - minimum);
	var angularFrequency = 2 * Math.PI * frequency;
	var phaseRadians = phase * Math.PI / 180;
	var offset = amplitude * Math.sin(
		angularFrequency * time + phaseRadians);
	var average = (minimum + maximum) / 2;
	return average + offset;
}

function createGroup(x, y, z) {
	var group = new THREE.Group();
	group.position.set(x, y, z);
	return group;
}

function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader().load('img/1.jpg'),
			// color: Colors.yellow,
    });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = true;
    box.position.set(x, y, z);
    return box;
}

function createSphere(radius, widthSegments, heightSegments, color, x, y, z, notFlatShading) {
	var geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
	var material = new THREE.MeshPhongMaterial( {
		color: color,
	});
	var sphere = new THREE.Mesh( geometry, material );
	sphere.receiveShadow = true;
	sphere.castShadow = true;
	sphere.position.set(x, y, z);
	return sphere;
}

function createCone(radiusTop, height, radialSegments,
						color, x, y, z) {
    var geom = new THREE.ConeGeometry(
    	radiusTop, height, radialSegments);
    var mat = new THREE.MeshPhongMaterial({
    	color: 0xffffff,
    });
	var laoder1 = new THREE.TextureLoader();
	mat.map = laoder1.load('img/cone.jpg');

    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;
}
