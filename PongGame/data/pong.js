var canvas = document.getElementById("pongGame");
var bot = document.getElementById("bot"); 
var multi = document.getElementById("select-p2");

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 5;
const BALL_SPEED_X_MAX = 50;
const BALL_SPEED_Y_MAX = 30;
const INITIAL_BALL_SPEED_X = 5;
const DEFAULT_PADDLE_SPEED = 5;
const SPEED_PADDLE_SPEED = 15;

var ctx	= canvas.getContext("2d");
var paddle_1_x;
var paddle_1_y;
var paddle_2_x;
var paddle_2_y;
var paddle_speed_p1 = 5;
var paddle_speed_p2 = 5;
var paddle_p1_dir;
var paddle_p2_dir;
var paddle_p1_speed;
var paddle_p2_speed;
var ball_x;
var ball_y;
var ball_speed_x;
var ball_speed_y;
var score1 = 0;
var score2 = 0;
var player_turn = true;
var paddle_collision = false;
var difficulty = 1;  // bot speed
var multiplayer = false;
var ball_speed_multiplier = 1.1;
var play_screen = true;
var timer = 0;
var winner = "";

// all text and shapes are white
ctx.strokeStyle = "#ffffff";
ctx.fillStyle = "#ffffff";

function draw_play_screen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "60px arial";
	ctx.textAlign = "center";
	ctx.fillText("Welcome to Pong", canvas.width/2, canvas.height/5);
}

function draw_win_screen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "60px arial";
	ctx.textAlign = "center";
	ctx.fillText(winner + " wins", canvas.width/2, canvas.height/2);
}

function check_winner() {
	if(score1 == 10) {
		winner = "Player 1";
	} else if(score2 == 10) {
		if(bot.checked) {
			winner = "Bot";
		} else {
			winner = "Player 2";
		}
	}
}

function draw_lines() {
	// draws dotted line down the middle
	ctx.beginPath();
	ctx.lineWidth = 3;
	ctx.setLineDash([canvas.height/20, 10]);
	ctx.moveTo(canvas.width/2, 0);
	ctx.lineTo(canvas.width/2, canvas.height);
	ctx.stroke();

	// scoreboard
	ctx.font = "60px arial";
	ctx.beginPath();
	ctx.direction = "ltr";
	ctx.fillText(score1, canvas.width/3, canvas.height/8);
	ctx.beginPath();
	ctx.direction = "rtl";
	ctx.fillText(score2, canvas.width/3*2, canvas.height/8);
}

// Set paddles on canvas
function set_paddle_p1() {
	if(paddle_1_y <= 0) {
		paddle_1_y = 0;
	} else if(paddle_1_y+PADDLE_HEIGHT >= canvas.height) {
		paddle_1_y = canvas.height - PADDLE_HEIGHT;
	}
	ctx.rect(paddle_1_x, paddle_1_y, PADDLE_WIDTH, PADDLE_HEIGHT);
	ctx.fill();
}

function set_paddle_p2() {
	if(paddle_2_y <= 0) {
		paddle_2_y = 0;
	} else if(paddle_2_y+PADDLE_HEIGHT >= canvas.height) {
		paddle_2_y = canvas.height - PADDLE_HEIGHT;
	}
	ctx.rect(paddle_2_x, paddle_2_y, PADDLE_WIDTH, PADDLE_HEIGHT);
	ctx.fill();
}

// bot functionality
function set_bot() {
	if(ball_y >= paddle_2_y+PADDLE_HEIGHT/2) {
		if(ball_y - paddle_2_y-PADDLE_HEIGHT/2 > difficulty) {
			paddle_2_y += difficulty;
		} else {
			paddle_2_y = ball_y - PADDLE_HEIGHT/2;
		}
	} else {
		if(paddle_2_y+PADDLE_HEIGHT/2 - ball_y > difficulty) {
			paddle_2_y -= difficulty;
		} else {
			paddle_2_y = ball_y - PADDLE_HEIGHT/2;
		}
	}	
	
	if(paddle_2_y <= 0) {
		paddle_2_y = 0;
	} else if(paddle_2_y+PADDLE_HEIGHT >= canvas.height) {
		paddle_2_y = canvas.height - PADDLE_HEIGHT;
	}
	ctx.rect(paddle_2_x, paddle_2_y, PADDLE_WIDTH, PADDLE_HEIGHT);
	ctx.fill();
}

function collision() {
    // paddle collisions
	var arbitrary_speed = 1;
    if(paddle_1_x+PADDLE_WIDTH >= ball_x-BALL_RADIUS && paddle_1_y <= ball_y && paddle_1_y+PADDLE_HEIGHT >= ball_y) {
		// "spin" functionality allowing more interesting game play
		paddle_collision = true;
		if(paddle_p1_speed == "1") {
			arbitrary_speed = 2;
		}
		
		if(paddle_p1_dir == "1") {
			ball_speed_y += arbitrary_speed;
			//ball_speed_x -= arbitrary_speed;
		} else if(paddle_p1_dir == "2") {
			ball_speed_y -= arbitrary_speed;
			//ball_speed_x -= arbitrary_speed;
		}
		//ball speedup for more interesting game play
		ball_speed_x = (-ball_speed_x) * ball_speed_multiplier; 
		
    } else if(paddle_2_x <= ball_x+BALL_RADIUS && paddle_2_y <= ball_y && paddle_2_y+PADDLE_HEIGHT >= ball_y) {
		paddle_collision = true;
		if(paddle_p2_speed == "1") {
			arbitrary_speed = 2;
		}
		if(paddle_p2_dir == "1") {
			ball_speed_y += arbitrary_speed;
			ball_speed_x += arbitrary_speed;
			console.log("down spin");
		} else if(paddle_p2_dir == "2") {
			ball_speed_y -= arbitrary_speed;
			ball_speed_x += arbitrary_speed;
			console.log("up spin");
		}
        ball_speed_x = (-ball_speed_x) * ball_speed_multiplier;
    }

    // wall collisions
    if(ball_y-BALL_RADIUS <= 0 || ball_y+BALL_RADIUS >= canvas.height) {
        ball_speed_y = 0 - ball_speed_y;
    }

    // max ball speed for x is 50    
    if(ball_speed_x > BALL_SPEED_X_MAX) {
    	ball_speed_x = BALL_SPEED_X_MAX;
    } else if(ball_speed_x < -BALL_SPEED_X_MAX) {
    	ball_speed_x = -BALL_SPEED_X_MAX;
    }
    // max ball speed for y is 30
    if(ball_speed_y > BALL_SPEED_Y_MAX) {
    	ball_speed_y = BALL_SPEED_Y_MAX;
    } else if(ball_speed_y < -BALL_SPEED_Y_MAX) {
    	ball_speed_y = -BALL_SPEED_Y_MAX;
    }
}

function set_ball() {
	ball_x += ball_speed_x;
	ball_y += ball_speed_y;
	// collision check
	paddle_collision = false;
	collision();
	// ball_y correction showing behind the paddle
	if(ball_y < 0) {
		ball_y = -ball_y;
	} else if(ball_y > canvas.height) {
		ball_y = canvas.height + (canvas.height - ball_y);
	}
	// ball_x correction showing behind the paddle
	if(ball_x > paddle_2_x && paddle_collision) {
		ball_x = paddle_2_x + (paddle_2_x - ball_x);
	} else if(paddle_collision && ball_x < paddle_1_x+PADDLE_WIDTH) {
		ball_x = paddle_1_x+PADDLE_WIDTH + (paddle_1_x+PADDLE_WIDTH - ball_x);
	}
	ctx.arc(ball_x, ball_y, BALL_RADIUS, 0, Math.PI*2);
	ctx.fill();
}

// Data from inputs 
function set_direction_p1(data) {
	var paddle_direction = data.substring(1,2);
	var paddle_speedup = data.substring(2);
	paddle_p1_dir = data.substring(1,2);
	paddle_p1_speed = data.substring(2);
	// 1 is down
	// 2 is up
	// button for speed up of the paddle for more interesting game play
	if (paddle_speedup == "1") {
		paddle_speed_p1 = SPEED_PADDLE_SPEED;
	} else {
		paddle_speed_p1 = DEFAULT_PADDLE_SPEED;
	}
	
	if (paddle_direction == "1") {
		paddle_1_y += paddle_speed_p1;
	} else if (paddle_direction == "2") {
		paddle_1_y -= paddle_speed_p1;
	} 
}

function set_direction_p2(data) {
	var paddle_direction = data.substring(1,2);
	var paddle_speedup = data.substring(2);
	paddle_p2_dir = data.substring(1,2);
	paddle_p2_speed = data.substring(2);
	
	if (paddle_speedup == "1") {
		paddle_speed_p2 = SPEED_PADDLE_SPEED;
	} else {
		paddle_speed_p2 = DEFAULT_PADDLE_SPEED;
	}
	
	if (paddle_direction == "1") {
		paddle_2_y += paddle_speed_p2;
	} else if (paddle_direction == "2") {
		paddle_2_y -= paddle_speed_p2;
	} 
}

function init() {
	timer = 0;
	if(winner != "") {
		score1 = 0;
		score2 = 0;
	}
	winner = "";
	play_screen = false;
	paddle_1_x = PADDLE_WIDTH;
	paddle_1_y = canvas.height/2 - PADDLE_HEIGHT/2;
	paddle_2_x = canvas.width - 2*PADDLE_WIDTH;
	paddle_2_y = canvas.height/2 - PADDLE_HEIGHT/2;
	ball_x = canvas.width/2;
	// ball_y = canvas.height/2;
	ball_y = Math.floor(Math.random() * canvas.height/2) + canvas.height/4;
	if(player_turn) {
		ball_speed_x = -INITIAL_BALL_SPEED_X;
	} else {
		ball_speed_x = INITIAL_BALL_SPEED_X;
	}
	ball_speed_y = Math.floor(Math.random() * 4) - 2;
}

function game_over() {
	// timer before next round
	if(timer != 0) {
		ball_x = -BALL_RADIUS;
		ball_speed_x = 0;
		ball_speed_y = 0;
		return true;
	}
	if(ball_x <= 0 && !paddle_collision) {
		score2 += 1;
		player_turn = false;
	} else if(ball_x >= canvas.width-BALL_RADIUS && !paddle_collision) {
		score1 += 1;
		player_turn = true;
	} else {
		return false;
	}
	return true;
}

function clear_game() {
	play_screen = true;
	score1 = 0;
	score2 = 0;
	ball_speed_x = 0;
	ball_speed_y = 0;
}

function play_game() {
	check_winner();
	if(winner != "") {
		draw_win_screen();
	} else if(play_screen) {
		draw_play_screen();
		if (multi.checked) { 
			document.getElementById("slidercontainer").style.display = "none"; 
			document.getElementById("p2selected").style.display = "block";
		} else if (bot.checked) { 
			document.getElementById("slidercontainer").style.display = "block";
			document.getElementById("p2selected").style.display = "none"; 
		} 
		
		output.innerHTML = slider.value;

		slider.oninput = function() {
		  output.innerHTML = this.value;
		  difficulty = parseInt(this.value);
		}
	} else {
		// clears canvas to imitate animation
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		draw_lines();
		ctx.beginPath();
		set_paddle_p1();
		if(bot.checked) {
			set_bot();
		} else {
			set_paddle_p2();
		}	
		set_ball();
	}
	// start new round
	if(game_over() && !winner) {
		timer += 1;
		if(timer > 50) {
			init();
		}
	}
}

var play = setInterval(play_game, 10);