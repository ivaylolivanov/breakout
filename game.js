var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var ball_x = canvas.width / 2;
var ball_y = canvas.height / 2;
var ball_r = 10;

var step_x = 3;
var step_y = 3;

var paddle_step = 7;
var paddle_width  = 75;
var paddle_height = 10;
var paddle_x = (canvas.width - paddle_width)  / 2;
var paddle_y = canvas.height - paddle_height - 50;

var left_pressed  = false;
var right_pressed = false;

var brick_rows        = 5;
var brick_cols        = 9;
var brick_width       = 75;
var brick_height      = 20;
var brick_padding     = 10;
var brick_top_offset  = 30;
var brick_left_offset = 30;

var lives = 3;
var score = 0;

var bricks = [];
for(var c=0; c<brick_cols; c++) {
    bricks[c] = [];
    for(var r=0; r<brick_rows; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

document.addEventListener("keydown",   key_down_handler,   false);
document.addEventListener("keyup",     key_up_handler,     false);
document.addEventListener("mousemove", mouse_move_handler, false);

function key_down_handler(event) {
    if(event.key == "Right" || event.key == "ArrowRight") {
        right_pressed = true;
    }
    else if(event.key == "Left" || event.key == "ArrowLeft") {
        left_pressed = true;
    }
}

function key_up_handler(event) {
    if(event.key == "Right" || event.key == "ArrowRight") {
        right_pressed = false;
    }
    else if(event.key == "Left" || event.key == "ArrowLeft") {
        left_pressed = false;
    }
}

function mouse_move_handler(event) {
    var relative_x = event.clientX - canvas.offsetLeft;
    if(relative_x > (paddle_width/2) && relative_x < (canvas.width - paddle_width/2)) {
        paddle_x = relative_x - paddle_width/2;
    }
}

function draw_filled_circe(x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function draw_filled_rectangle(x, y, w, h, color) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function draw_rectangle(x, y, w, h, color) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
}

function draw_bricks() {
    for(var c = 0; c < brick_cols; c++) {
        for(var r = 0; r < brick_rows; r++) {
	    if(bricks[c][r].status == 1) {
		bricks[c][r].x = (c * (brick_width  + brick_padding)) + brick_left_offset;
		bricks[c][r].y = (r * (brick_height + brick_padding)) + brick_top_offset;
		draw_filled_rectangle(bricks[c][r].x, bricks[c][r].y, brick_width, brick_height, "blue");
	    }
	}
    }
}

function has_ball_hit_upper_wall(x, y, radius) {
    if((y + step_y) < radius) {
	return -1;
    }

    return 1;
}

function has_ball_hit_sides(x, radius) {
    if(((x + step_x) < radius) || ((x + step_x) > (canvas.width - radius))) {
	return -1;
    }

    return 1;
}

function has_ball_fallen(x, y, radius) {
    if((y + step_y) > (canvas.height - ball_r)) {
	return true;
    }
    return false;
}

function has_ball_hit_paddle(p_x, p_y, p_w, p_h, b_x, b_y) {
    if(((b_y == p_y)) && ((b_x >= p_x) && (b_x <= (p_x + p_w)))) {
	return -1;
    }

    return 1;
}

function has_ball_hit_brick(x, y, radius) {
    for(var c = 0; c < brick_cols; c++) {
        for(var r = 0; r < brick_rows; r++) {
            var b = bricks[c][r];
            if(x > b.x && x < b.x + brick_width && y > b.y && y < b.y + brick_height + radius && b.status == 1) {
		b.status = 0;
		score++;
                return -1;
            }
        }
    }

    return 1;
}

function display_score() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}

function display_lives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(lives + " lives ", canvas.width-65, 20);
}

function game() {
    // Move the paddle
    if(right_pressed) {
	paddle_x += paddle_step;

	if (paddle_x + paddle_width > canvas.width){
            paddle_x = canvas.width - paddle_width;
	}
    }
    else if(left_pressed) {
	paddle_x -= paddle_step;

	if (paddle_x < 0){
            paddle_x = 0;
	}
    }

    step_y *= has_ball_hit_paddle(paddle_x, paddle_y, paddle_width, paddle_height, ball_x, ball_y);
    step_y *= has_ball_hit_upper_wall(ball_x, ball_y, ball_r);
    step_x *= has_ball_hit_sides(ball_x, ball_r);
    step_y *= has_ball_hit_brick(ball_x, ball_y, ball_r);

    if(! has_ball_fallen(ball_x, ball_y, ball_r)) {
	ball_x += step_x;
	ball_y += step_y;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	draw_bricks();
	draw_filled_circe(ball_x, ball_y, ball_r, "purple");
	draw_filled_rectangle(paddle_x, paddle_y, paddle_width, paddle_height, "black");
    }
    else {
	if(lives) {
	    --lives;
	    ball_x = canvas.width / 2;
	    ball_y = canvas.height / 2;
	    step_x = step_x;
	    step_y = step_y;
	    paddle_x = (canvas.width - paddle_width)  / 2;
	    paddle_y = canvas.height - paddle_height - 50;
	}
	else{
	    step_x = 0;
	    step_y = 0;

	    ctx.font = '48px Serif';
	    ctx.fillText('Game over', 300, 300);

	    return;
	}
    }

    if(score >= (brick_rows * brick_cols)) {
	ctx.font = '48px Serif';
	ctx.fillText('You have won!', 300, 300);
	document.location.reload();
	return;
    }

    display_score();
    display_lives();

    window.requestAnimationFrame(game);
}

game();
