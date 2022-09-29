const Client = require("./Client.js");
const proxies = [
"ws://mpp-proxy-server-1--bopit.repl.co",
"ws://mpp-proxy-server-4--bopit.repl.co",
"ws://mpp-proxy-server-5--bopit.repl.co"
]

const names = [
  "Player 1",
  "Player 2",
  "⚽"
];

let peeps = [];


proxies.forEach((proxy,num) => {
peeps[num] = new Client(proxy);
peeps[num].setChannel("bot test");
peeps[num].start();
peeps[num].on("hi",function() {
  peeps[num].setName(names[num]);
})
})

// Global Variables
var DIRECTION = {
	IDLE: 0,
	UP: 1,
	DOWN: 2,
	LEFT: 3,
	RIGHT: 4
};

var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

// The ball object (The cube that bounces back and forth)
var Ball = {
	new: function (incrementedSpeed) {
		return {
			width: 18,
			height: 18,
			x: ((this.canvas.width / 2) - 9) / 10,
			y: ((this.canvas.height / 2) - 9) / 10,
      changeX: function(xpos) {
        peeps[2].changePos(xpos,this.y)
      },
      changeY: function(ypos) {
        peeps[2].changePos(this.x,ypos)
      },
      moveX: DIRECTION.IDLE,
			moveY: DIRECTION.IDLE,
			speed: incrementedSpeed || 9
		};
	}
};

// The paddle object (The two lines that move up and down)
var Paddle = {
	new: function (side) {
		return {
			width: 18,
			height: 70,
			x: (side === 'left' ? (150 / 10) : (this.canvas.width - 150) / 10),
			y: ((this.canvas.height / 2) - 35) / 10,
			score: 0,
			move: DIRECTION.IDLE,
			speed: 10,
      changeX: function(xpos) {
        side === 'left' ? peeps[0].changePos(xpos,this.y) : peeps[1].changePos(xpos,this.y)
      },
      changeY: function(ypos) {
        side === 'left' ? peeps[0].changePos(this.x,ypos) : peeps[1].changePos(this.x,ypos)
      }
		};
	}
};

var Game = {
	initialize: function () {
		this.canvas = {width: 1400, height: 1000};
	//	this.context = this.canvas.getContext('2d');

	//	this.canvas.width = 1400;
	//	this.canvas.height = 1000;

	//	this.canvas.style.width = (this.canvas.width / 2) + 'px';
		//this.canvas.style.height = (this.canvas.height / 2) + 'px';

		this.player = Paddle.new.call(this, 'left');
		this.paddle = Paddle.new.call(this, 'right');
		this.ball = Ball.new.call(this);

		this.paddle.speed = 8;
		this.running = this.over = false;
		this.turn = this.paddle;
		this.timer = this.round = 0;
		this.color = '#2c3e50';

		Pong.menu();
		Pong.listen();
	},

	endGameMenu: function (text) {
		// Change the canvas font size and color
		//Pong.context.font = '50px Courier New';
		//Pong.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
		/*Pong.context.fillRect(
			Pong.canvas.width / 2 - 350,
			Pong.canvas.height / 2 - 48,
			700,
			100
		);*/

		// Change the canvas color;
	//	Pong.context.fillStyle = '#ffffff';

		// Draw the end game menu text ('Game Over' and 'Winner')
		peeps[0].sendChat(text);

		setTimeout(function () {
			Pong = Object.assign({}, Game);
			Pong.initialize();
		}, 3000);
	},

	menu: function () {
		// Draw all the Pong objects in their current state
		Pong.draw();

		// Change the canvas font size and color
		//this.context.font = '50px Courier New';
	//	this.context.fillStyle = this.color;

		// Draw the rectangle behind the 'Press any key to begin' text.
/*		this.context.fillRect(
			this.canvas.width / 2 - 350,
			this.canvas.height / 2 - 48,
			700,
			100
		);*/

		// Change the canvas color;
	//	this.context.fillStyle = '#ffffff';

		// Draw the 'press any key to begin' text
		peeps[0].sendChat("use /start to begin");
	},

	// Update all objects (move the player, paddle, ball, increment the score, etc.)
	update: function () {
		if (!this.over) {
			// If the ball collides with the bound limits - correct the x and y coords.
			if (this.ball.x <= 0) Pong._resetTurn.call(this, this.paddle, this.player);
			if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.paddle);
			if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
			if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

			// Move player if they player.move value was updated by a keyboard event
			if (this.player.move === DIRECTION.UP) this.player.changeX(this.player.x -= this.player.speed);
			else if (this.player.move === DIRECTION.DOWN) this.player.changeY(this.player.y += this.player.speed);

			// On new serve (start of each turn) move the ball to the correct side
			// and randomize the direction to add some challenge.
			if (Pong._turnDelayIsOver.call(this) && this.turn) {
				this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
				this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
				this.ball.y = (Math.floor(Math.random() * this.canvas.height - 200) + 200) / 10;
				this.turn = null;
			}

			// If the player collides with the bound limits, update the x and y coords.
			if (this.player.y <= 0) this.player.changeY(this.player.y = 0);
			else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.changeY((this.player.y = this.canvas.height - this.player.height));

			// Move ball in intended direction based on moveY and moveX values
			if (this.ball.moveY === DIRECTION.UP) this.ball.changeY(this.player.y -= (this.ball.speed / 1.5));
			else if (this.ball.moveY === DIRECTION.DOWN) this.ball.changeY(this.ball.y += (this.ball.speed / 1.5));
			if (this.ball.moveX === DIRECTION.LEFT) this.ball.changeX(this.ball.x -= this.ball.speed);
			else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.changeX(this.ball.x += this.ball.speed);

			// Handle paddle (AI) UP and DOWN movement
			if (this.paddle.y > this.ball.y - (this.paddle.height / 2)) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.changeY(this.paddle.y -= this.paddle.speed / 1.5);
				else this.paddle.changeY(this.paddle.y -= this.paddle.speed / 4);
			}
			if (this.paddle.y < this.ball.y - (this.paddle.height / 2)) {
				if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.changeY(this.paddle.y += this.paddle.speed / 1.5);
				else this.paddle.changeY(this.paddle.y += this.paddle.speed / 4);
			}

			// Handle paddle (AI) wall collision
			if (this.paddle.y >= this.canvas.height - this.paddle.height) this.paddle.changeY(this.paddle.y = this.canvas.height - this.paddle.height);
			else if (this.paddle.y <= 0) this.paddle.changeY(this.paddle.y = 0);

			// Handle Player-Ball collisions
			if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
				if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
					this.ball.changeX((this.ball.x = this.player.x + this.ball.width));
					this.ball.moveX = DIRECTION.RIGHT;

				//	beep1.play();
				}
			}

			// Handle paddle-ball collision
			if (this.ball.x - this.ball.width <= this.paddle.x && this.ball.x >= this.paddle.x - this.paddle.width) {
				if (this.ball.y <= this.paddle.y + this.paddle.height && this.ball.y + this.ball.height >= this.paddle.y) {
					this.ball.changeX((this.ball.x = this.paddle.x - this.ball.width));
					this.ball.moveX = DIRECTION.LEFT;

			//		beep1.play();
				}
			}
		}

		// Handle the end of round transition
		// Check to see if the player won the round.
		if (this.player.score === rounds[this.round]) {
			// Check to see if there are any more rounds/levels left and display the victory screen if
			// there are not.
			if (!rounds[this.round + 1]) {
				this.over = true;
				setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
			} else {
				// If there is another round, reset all the values and increment the round number.
				this.color = this._generateRoundColor();
				this.player.score = this.paddle.score = 0;
				this.player.speed += 0.5;
				this.paddle.speed += 1;
				this.ball.speed += 1;
				this.round += 1;

				beep3.play();
			}
		}
		// Check to see if the paddle/AI has won the round.
		else if (this.paddle.score === rounds[this.round]) {
			this.over = true;
			setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
		}
	},

	// Draw the objects to the canvas element
	draw: function () {
		// Clear the Canvas
	   peeps.forEach((peep) => {
       peep.changePos(180,180);
     })

		// Set the fill style to black
		//this.context.fillStyle = this.color;

		// Draw the background
	/*	this.context.fillRect(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);*/

		// Set the fill style to white (For the paddles and the ball)
	//	this.context.fillStyle = '#ffffff';

		// Draw the Player
		this.player.changeX(this.player.x);
    this.player.changeY(this.player.y);

		// Draw the Paddle
    this.paddle.changeX(this.paddle.x);
    this.paddle.changeY(this.paddle.y);


		// Draw the Ball
		if (Pong._turnDelayIsOver.call(this)) {
      this.ball.changeX(this.ball.x);
      this.ball.changeY(this.ball.y);
		}

		// Draw the net (Line in the middle)
		/*this.context.beginPath();
		this.context.setLineDash([7, 15]);
		this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
		this.context.lineTo((this.canvas.width / 2), 140);
		this.context.lineWidth = 10;
		this.context.strokeStyle = '#ffffff';
		this.context.stroke();*/

		// Set the default canvas font and align it to the center
	//	this.context.font = '100px Courier New';
	//	this.context.textAlign = 'center';

		// Draw the players score (left)
    setTimeout(() => {
		peeps[0].sendChat("Player Score " + this.player.score.toString());
    },200)
		// Draw the paddles score (right)
    setTimeout(() => {
		peeps[0].sendChat("AI Score " + this.paddle.score.toString());
    },400)
		// Change the font size for the center score text
	//	this.context.font = '30px Courier New';

		// Draw the winning score (center)
    setTimeout(() => {
		peeps[0].sendChat('Winning Score ' + (Pong.round + 1))
    },600)
		// Change the font size for the center score value
		//this.context.font = '40px Courier';

		// Draw the current round number
    setTimeout(() => {
		peeps[0].sendChat("Round Number " + rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1]);
    },800)
	},

	loop: function () {
		Pong.update();
		Pong.draw();

		// If the game is not over, draw the next frame.
		if (!Pong.over) Pong.loop();
	},

	listen: function () {
		peeps[0].on("a", function (key) {
      if (key.a == "/start") {
			// Handle the 'Press any key to begin' function and start the game.
			if (Pong.running === false) {
				Pong.running = true;
				Pong.loop();
			}
    }
      });
      var keypress = require('keypress');

          // make `process.stdin` begin emitting "keypress" events
          keypress(process.stdin);

          // listen for the "keypress" event
          process.stdin.on('keypress', function (ch, key) {
          //  console.log('got "keypress"', key);
            if (key && key.name == 'w') {
              Pong.player.move = DIRECTION.UP;
            } else if (key && key.name == 's') {
              Pong.player.move = DIRECTION.DOWN;
            } else {
              Pong.player.move = DIRECTION.IDLE;
            }

          });

        //  process.stdin.setRawMode(true);
        //  process.stdin.resume();
			// Handle up arrow and w key events
			//if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;

			// Handle down arrow and s key events
		//	if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;


		// Stop the player from moving when there are no keys being pressed.
	},

	// Reset the ball location, the player turns and set a delay before the next round begins.
	_resetTurn: function(victor, loser) {
		this.ball = Ball.new.call(this, this.ball.speed);
		this.turn = loser;
		this.timer = (new Date()).getTime();

		victor.score++;
	//	beep2.play();
	},

	// Wait for a delay to have passed after each turn.
	_turnDelayIsOver: function() {
		return ((new Date()).getTime() - this.timer >= 1000);
	},

	// Select a random color as the background of each level/round.
	_generateRoundColor: function () {
		var newColor = colors[Math.floor(Math.random() * colors.length)];
		if (newColor === this.color) return Pong._generateRoundColor();
		return newColor;
	}
};

var Pong = Object.assign({}, Game);
Pong.initialize();
