var canvas = document.getElementById('main');
var canvas_mountain = document.getElementById('mountain');

var reload = document.getElementById('restart');
var instructions = document.getElementById('instructions');
var inst_text = document.getElementById('inst_text');
var close = document.getElementById('close');
var pause = document.querySelectorAll('i');
var pause_div = document.getElementById('pause');
var play_again = document.getElementById('play_again');
pause[0].style.display = 'none';
pause[1].style.display = 'block';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas_mountain.width = window.innerWidth;
canvas_mountain.height = window.innerHeight;
var W = canvas.width;
var H = canvas.height;
var c = canvas.getContext('2d');
var cm = canvas_mountain.getContext('2d');

var gravity = 0.04;
var leftPressed = false;
var rightPressed = false;
var spacePressed = false;
var downPressed = false;
var upPressed = false;
var player1_state = false;
var player2_state = false;
var next_turn = false;
var redraw_mountain = false;
var paused = false;
var game_over = false

var health = {
  p1 : 100,
  p2 : 100
}
var weapon = {
  radius : [W/35, W/15],
  damage : [20, 30],
  amount1 : [7, 3],
  amount2 : [7, 3],
  p1_choice : 0,
  p2_choice : 0
}

var mouse = {
  x : undefined,
  y : undefined
};

window.addEventListener('keydown',function(e){
  if(e.key == 'ArrowLeft' && !paused){leftPressed = true;}
  if(e.key == 'ArrowRight' && !paused){rightPressed = true;}
  if(e.key == ' ' && !paused){spacePressed = true;}
  if(e.key == 'ArrowDown' && !paused){downPressed = true;}
  if(e.key == 'ArrowUp' && !paused){upPressed = true;}
});

window.addEventListener('keyup',function(e){
  if(e.key == 'ArrowLeft'){leftPressed = false;}
  if(e.key == 'ArrowRight'){rightPressed = false;}
  if(e.key == ' '){spacePressed = false;}
  if(e.key == 'ArrowDown'){downPressed = false;}
  if(e.key == 'ArrowUp'){upPressed = false;}
});

window.addEventListener('mousemove', function(e){
  if(!paused){
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }
});

pause_div.addEventListener('click',function(){

  if(pause[0].style.display == 'none'){
    paused = true;
    pause[0].style.display = 'block';
    pause[1].style.display = 'none';
  }
  else{
    paused = false;
    pause[1].style.display = 'block';
    pause[0].style.display = 'none';
  }
});

reload.addEventListener('click', function() {
  location.reload();
});

play_again.addEventListener('click', function() {
  location.reload();
});

instructions.addEventListener('click', function() {
  inst_text.style.display = 'block';
});

close.addEventListener('click', function() {
  inst_text.style.display = 'none';
});

function Mountain(){
  this.x = [0, W];
  this.y = [H*3/4, H*3/4];
  this.roughness = 0.35;

  this.findLocus = function(start, displacement){
    var start_index;
    for(var i = 0; i<this.x.length; ++i){
      if(this.x[i] == start){
        start_index = i;
        break;
      }
    }
    if(this.x[start_index+1] - this.x[start_index] < 5){
      return;
    }
    var midx = (this.x[start_index] + this.x[start_index+1])/2;
    var midy = (this.y[start_index] + this.y[start_index+1])/2;
    if(this.x.length == 2){

      var rand = 0;
      while(rand < 0.5){
        rand = Math.random();
      }
      midy += displacement*rand;
    }
    else{
      midy += displacement*(Math.random() - 0.5)*2;
    }
    this.x.splice(start_index+1, 0, midx);
    this.y.splice(start_index+1, 0, midy);
    displacement *= this.roughness;
    this.findLocus(start, displacement);
    this.findLocus(midx, displacement);
  }
  this.draw = function(){
    this.x.push(W);
    this.y.push(H);
    // this.x.push(0);
    // this.y.push(H);
    this.x.splice(0,0,0);
    this.y.splice(0,0,H);
    // this.x.push(this.x[0]);
    // this.y.push(this.y[0]);
    cm.beginPath();
    cm.moveTo(this.x[0],this.y[0]);
    for(var i = 1; i<this.x.length; ++i){
      cm.lineTo(Math.floor(this.x[i]),Math.floor(this.y[i]));
    }
    cm.fillStyle = 'green';
    cm.fill();
  }
}

function Tank(src, x, state){
  this.tank = new Image();
  this.tank.src = src;
  this.scale = 1.5;
  this.width = this.scale*28;
  this.height = this.scale*10;
  this.x = x;
  this.angle = 0;
  this.dx = 0;
  this.state = state;
  this.draw = function(){
    c.beginPath();
    c.drawImage(this.tank, 0, 0, 28, 10, 0, 0, this.width, this.height);
  }
  this.update = function(){
    if(rightPressed && this.state && this.x < W-25){
      this.dx = 1;
    }
    else if(leftPressed && this.state && this.x > 5){
      this.dx = -1;
    }
    else{
      this.dx = 0;
    }
    this.x += this.dx*Math.cos(this.angle);
    this.findY();
    this.rotate();
  }
  this.findY = function(){
    var i = 0;
    for(var i = 0; i<mountain.x.length; ++i){
      if((this.x+this.width/2 >= mountain.x[i]) && (this.x+this.width/2 < mountain.x[i+1])){
        break;
      }
    }
    var slope = (mountain.y[i+1] - mountain.y[i])/(mountain.x[i+1] - mountain.x[i]);
    if(slope < -2.7 && rightPressed){
      this.x -= 1;
    }
    else if(slope > 2.7 && leftPressed){
      this.x += 1;
    }
    else{
      this.y = slope*(this.x - mountain.x[i]) + mountain.y[i];
      this.angle = Math.atan(slope);
    }

  }
  this.rotate = function(){
    c.translate(this.x,this.y);
    c.rotate(this.angle);
    c.translate(0,-this.height);
    this.draw();
    c.translate(0,this.height);
    c.rotate(-this.angle);
    c.translate(-this.x,-this.y);
  }
}

function Gun(src, state){
  this.gun = new Image();
  this.gun.src = src;
  this.scale = 1.5;
  this.width = 12*this.scale;
  this.height = 4*this.scale;
  this.angle = -Math.PI/4;
  this.state = state;
  this.max_speed = 8;

  this.calcAngle = function(){
    if(this.state){
      slope = (this.y + this.scale*14*Math.sin(this.tank_angle) - this.scale*10*Math.cos(this.tank_angle) - mouse.y)/(this.x + this.scale*14*Math.cos(this.tank_angle) + this.scale*10*Math.sin(this.tank_angle) -  mouse.x);
      this.angle = Math.atan(slope);
      if(mouse.x<this.x + this.scale*14*Math.cos(this.tank_angle) + this.scale*10*Math.sin(this.tank_angle)){
        this.angle += Math.PI;
      }
      this.aim();
      if(spacePressed){
        fire(this.x + this.scale*14*Math.cos(this.tank_angle) + this.scale*10*Math.sin(this.tank_angle) + Math.cos(this.angle)*this.width,
        this.y + this.scale*14*Math.sin(this.tank_angle) - this.scale*10*Math.cos(this.tank_angle) + Math.sin(this.angle)*this.width,
        this.speed, this.angle);
        this.state = false;
      }
    }
  }

  this.draw = function(x,y,tank_angle){
    this.tank_angle = tank_angle;
    this.x = x;
    this.y = y;
    c.translate(this.x,this.y);
    c.rotate(this.tank_angle);
    c.translate(this.scale*14, -this.scale*10);
    c.rotate(this.angle-this.tank_angle);
    // c.translate(-this.height*Math.sin(this.angle), -this.height*Math.cos(this.angle));
    c.drawImage(this.gun, 0, 0, 12, 4, 0, -this.height/2, this.width, this.height);
    // c.translate(this.height*Math.sin(this.angle), this.height*Math.cos(this.angle));
    c.rotate(this.tank_angle - this.angle);
    c.translate(-this.scale*14, this.scale*10);
    c.rotate(-this.tank_angle);
    c.translate(-this.x,-this.y);
  }

  this.aim = function() {
    var x = this.x + this.scale*14*Math.cos(this.tank_angle) + this.scale*10*Math.sin(this.tank_angle) + Math.cos(this.angle)*this.width;
    var y = this.y + this.scale*14*Math.sin(this.tank_angle) - this.scale*10*Math.cos(this.tank_angle) + Math.sin(this.angle)*this.width;
    var distance = Math.sqrt(Math.pow(mouse.x - x, 2) + Math.pow(mouse.y - y, 2));
    var no_of_dots = 9;
    if(distance > W/4){
      var radius = 2.5;
      var x_gap = (W/4)*Math.cos(this.angle)/no_of_dots;
      var y_gap = (W/4)*Math.sin(this.angle)/no_of_dots;
      this.speed = this.max_speed;
    }
    else{
      var radius = 1.8*(distance*4/W)+0.7;
      var x_gap = (mouse.x - x)/no_of_dots;
      var y_gap = (mouse.y - y)/no_of_dots;
      this.speed = this.max_speed*(distance*4/W);
    }
    for(var i = 0; i<no_of_dots; ++i){
      c.beginPath();
      c.arc(x + x_gap/2 + i*x_gap, y + y_gap/2 + i*y_gap, radius, 0, Math.PI*2, true);
      c.fillStyle = 'white';
      c.fill();
    }

  }
}

function Bullet(src){
  this.bullet = new Image();
  this.bullet.src = src;
  this.scale = 1.5;
  this.width = 12*this.scale;
  this.height = 3*this.scale;
  this.x = 0;
  this.y = 0;
  this.speed = 0;
  this.angle = 0;
  this.init = function() {
    this.dx = this.speed*Math.cos(this.angle);
    this.dy = this.speed*Math.sin(this.angle);
  }
  this.state = false;

  this.draw = function() {
    this.angle = Math.atan(this.dy/this.dx);
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    c.drawImage(this.bullet, 0, 0, 12, 3, 0, 0, this.width, this.height);
    c.rotate(-this.angle);
    c.translate(-this.x, -this.y);

  }
  this.update = function() {
    if(this.state)
    {
      this.x += this.dx;
      this.y += this.dy;
      this.dy += gravity;
      this.draw();
      this.collisionDetect();
      if(this.x > W || this.x < 0){
        this.state = false;
        next_turn = true;
      }
    }
  }
  this.collisionDetect = function() {
    var cornersx1 = [tank1.x, tank1.width*Math.cos(tank1.angle) + tank1.x, tank1.x + tank1.height*Math.sin(tank1.angle), tank1.x + tank1.height*Math.sin(tank1.angle) + tank1.width*Math.cos(tank1.angle)];
    var cornersy1 = [tank1.y, tank1.width*Math.sin(tank1.angle) + tank1.y, tank1.y - tank1.height*Math.cos(tank1.angle), tank1.y - tank1.height*Math.cos(tank1.angle) + tank1.width*Math.sin(tank1.angle)];
    var cornersx2 = [tank2.x, tank2.width*Math.cos(tank2.angle) + tank2.x, tank2.x + tank2.height*Math.sin(tank2.angle), tank2.x + tank2.height*Math.sin(tank2.angle) + tank2.width*Math.cos(tank2.angle)];
    var cornersy2 = [tank2.y, tank2.width*Math.sin(tank2.angle) + tank2.y, tank2.y - tank2.height*Math.cos(tank2.angle), tank2.y - tank2.height*Math.cos(tank2.angle) + tank2.width*Math.sin(tank2.angle)];
    var A = tank1.width*tank1.height;
    var a1 = this.area(cornersx1[0], cornersy1[0], cornersx1[1], cornersy1[1], this.x, this.y) + this.area(cornersx1[3], cornersy1[3], cornersx1[1], cornersy1[1], this.x, this.y) + this.area(cornersx1[3], cornersy1[3], cornersx1[2], cornersy1[2], this.x, this.y) + this.area(cornersx1[2], cornersy1[2], cornersx1[0], cornersy1[0], this.x, this.y);
    var a2 = this.area(cornersx2[0], cornersy2[0], cornersx2[1], cornersy2[1], this.x, this.y) + this.area(cornersx2[3], cornersy2[3], cornersx2[1], cornersy2[1], this.x, this.y) + this.area(cornersx2[3], cornersy2[3], cornersx2[2], cornersy2[2], this.x, this.y) + this.area(cornersx2[2], cornersy2[2], cornersx2[0], cornersy2[0], this.x, this.y);
    if(a1 <= A){
      this.state = false;
      explosion.x = this.x;
      explosion.y = this.y;
      explosion.state = true;
      explosion.setRadius();
      health.p1 -= weapon.damage[weapon.p1_choice];
    }
    if(a2 <= A){
      this.state = false;
      explosion.x = this.x;
      explosion.y = this.y;
      explosion.state = true;
      explosion.setRadius();
      health.p2 -= weapon.damage[weapon.p2_choice];
    }
    for(var i = 1; i<mountain.x.length - 3; ++i){
      if(this.x >= mountain.x[i-1] && this.x < mountain.x[i]){
        var slope = (mountain.y[i] - mountain.y[i-1])/(mountain.x[i] - mountain.x[i-1]);
        if(this.y >= mountain.y[i-1] + slope*(this.x - mountain.x[i-1]))
        {
          this.state = false;
          explosion.x = this.x;
          explosion.y = this.y;
          explosion.state = true;
          explosion.setRadius();
          calcDamage(this.x, this.y);
        }
      }
    }
  }
  this.area = function(x1, y1, x2, y2, x3, y3) {
    a = 0.5*(x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2));
    if(a>0){
      return a;
    }
    else{
      return -a;
    }
  }
}

function Explosion(src){
  this.x = 0;
  this.y = 0;
  this.max_radius = W/30;
  this.radius = 3;
  this.explosion = new Image();
  this.explosion.src = src;
  this.speed = 3;
  this.state = false;
  this.draw = function() {
    if(this.state){
      c.drawImage(this.explosion, 0, 0, 246, 244, this.x - this.radius, this.y - this.radius,this.radius*2 ,this.radius*2 );
      if(this.radius < this.max_radius){
        this.radius += this.speed;
      }
      else{
        for(var i=1; i<(mountain.x.length - 2); ++i){
          if(mountain.x[i] >= this.x - this.radius && mountain.x[i] <= this.x + this.radius){
            var y = Math.sqrt(Math.pow(this.radius, 2) - Math.pow(this.x - mountain.x[i], 2)) + this.y;
            if(y > mountain.y[i]){
              mountain.y[i] = y;
            }
          }
        }
        mountain.y[mountain.y.length-1] = mountain.y[0];
        this.state = false;
        next_turn = true;
        redraw_mountain = true;
        console.log(mountain.x);
        console.log(mountain.y);
      }
    }
    else{
      this.radius = 3;
    }
  }
  this.setRadius = function() {
    if(player1_state){
      this.max_radius = weapon.radius[weapon.p1_choice];
    } else if(player2_state){
      this.max_radius = weapon.radius[weapon.p2_choice];
    }
  }
}

function startGame(){
  mountain = new Mountain();
  mountain.findLocus(0, -3*H/4);
  tank1 = new Tank("redTank.png", W*Math.random()/3+25, false);
  tank2 = new Tank("yellowTank.png", W - W*Math.random()/3 -25, false);
  gun1 = new Gun("gun.png", false);
  gun2 = new Gun("gun.png", false);
  bullet = new Bullet("bullet.png");
  explosion = new Explosion("explosion.png");
  playerTurn(1);
}

function playerTurn(player){
  if(player == 1){
    player1_state = true;
    player2_state = false;
    if(weapon.amount1[0]==0){
      weapon.p1_choice = 1;
    }
    if(weapon.amount1[1]==0){
      weapon.p1_choice = 0;
    }
  }
  else{
    player1_state = false;
    player2_state = true;
    if(weapon.amount2[0]==0){
      weapon.p2_choice = 1;
    }
    if(weapon.amount2[1]==0){
      weapon.p2_choice = 0;
    }
  }
  tank1.state = player1_state;
  tank2.state = player2_state;
  gun1.state = player1_state;
  gun2.state = player2_state;
}
function fire(x, y, v, angle){
  bullet.speed = v;
  bullet.x = x;
  bullet.y = y;
  bullet.angle = angle;
  bullet.state = true;
  bullet.init();
  tank1.state = false;
  tank2.state = false;
  if(player1_state){
    weapon.amount1[weapon.p1_choice]--;
  }
  else if(player2_state){
    weapon.amount2[weapon.p2_choice]--;
  }
}

function calcDamage(x, y){
  var d1 = Math.sqrt(Math.pow(x - tank1.x - tank1.width*Math.cos(tank1.angle)/2, 2) + Math.pow(y - tank1.y - tank1.width*Math.sin(tank1.angle), 2)) - 10;
  var d2 = Math.sqrt(Math.pow(x - tank2.x - tank2.width*Math.cos(tank2.angle)/2, 2) + Math.pow(y - tank2.y - tank2.width*Math.sin(tank2.angle), 2)) - 10;
  if(d1 <= explosion.max_radius){
    health.p1 -= weapon.damage[weapon.p1_choice]*(1 - (d1/explosion.max_radius));
  }
  if(d2 <= explosion.max_radius){
    health.p2 -= weapon.damage[weapon.p2_choice]*(1 - (d2/explosion.max_radius));
  }
}

startGame();

function drawMountain(){
  mountain.draw();
}

drawMountain();

function drawStats(){
  c.font = '20px custom';
  c.fillStyle = 'white';
  c.fillText("Weapon :", W/16, 40);
  c.fillText("Weapon :", W*15/16 - 250, 40);
  if(weapon.p1_choice == 0){
    c.fillStyle = 'rgba(255, 255, 255, 1)';
    c.fillText('Single Shot  X'+weapon.amount1[0], W/16, 80);
    c.fillStyle = 'rgba(255, 255, 255, 0.5)';
    c.fillText('Big Shot     X'+weapon.amount1[1], W/16, 120);
  }
  else{
    c.fillStyle = 'rgba(255, 255, 255, 0.5)';
    c.fillText('Single Shot  X'+weapon.amount1[0], W/16, 80);
    c.fillStyle = 'rgba(255, 255, 255, 1)';
    c.fillText('Big Shot     X'+weapon.amount1[1], W/16, 120);
  }
  if(weapon.p2_choice == 0){
    c.fillStyle = 'rgba(255, 255, 255, 1)';
    c.fillText('Single Shot  X'+weapon.amount2[0], 15*W/16 - 250, 80);
    c.fillStyle = 'rgba(255, 255, 255, 0.5)';
    c.fillText('Big Shot     X'+weapon.amount2[1], 15*W/16 - 250, 120);
  }
  else{
    c.fillStyle = 'rgba(255, 255, 255, 0.5)';
    c.fillText('Single Shot  X'+weapon.amount2[0], 15*W/16 - 250, 80);
    c.fillStyle = 'rgba(255, 255, 255, 1)';
    c.fillText('Big Shot     X'+weapon.amount2[1], 15*W/16 - 250, 120);
  }
  healthBar();
  c.font = '15px custom';
  c.fillStyle = 'white';
  if(gun1.angle*180/Math.PI <= 90){
    var a1 = -gun1.angle*180/Math.PI;
  }else{
    var a1 = 360 - gun1.angle*180/Math.PI;
  }
  if(a1>180){a1 -= 360;}
  if(gun2.angle*180/Math.PI <= 90){
    var a2 = -gun2.angle*180/Math.PI;
  }else{
    var a2 = 360 - gun2.angle*180/Math.PI;
  }
  if(a2>180){a2 -= 360;}
  c.fillText('Angle : ' + a1.toFixed(2), W/16, H - 60);
  c.fillText('Angle : ' + a2.toFixed(2), 15*W/16-200, H - 60);
  c.fillText('Power : ' + (gun1.speed/gun1.max_speed*100).toFixed(2), W/16, H - 30);
  c.fillText('Power : ' + (gun2.speed/gun2.max_speed*100).toFixed(2), 15*W/16-200, H - 30);
}

function healthBar(){
  c.beginPath();
  c.rect(W/16, 160, 200, 20);
  c.rect(15*W/16 - 250, 160, 200, 20);
  c.strokeStyle = 'rgba(255, 255, 255, 1)';
  c.stroke();
  var g1 = 255*health.p1/100;
  var g2 = 255*health.p2/100;
  var r1 = 255 - g1;
  var r2 = 255 - g2;
  if(health.p1 > 0){
    c.beginPath();
    c.rect(W/16, 160, 2*health.p1, 20);
    c.fillStyle = 'rgba('+r1+','+g1+',0,1)';
    c.fill();
  }
  if(health.p2 > 0){
    c.beginPath();
    c.rect(15*W/16 - 250, 160, 2*health.p2, 20);
    c.fillStyle = 'rgba('+r2+','+g2+',0,1)';
    c.fill();
  }
}

function gameOver() {
  paused = true;
  c.fillStyle = 'white';
  c.font = '40px custom';
  c.fillText('GAME OVER!', W/3+50, H/3);
  c.font = '30px custom';
  if(health.p1 > health.p2){
    c.fillText('Player 1 WINS!', W/3+50, H/2);
  }
  else if(health.p2 > health.p1){
    c.fillText('Player 2 WINS!', W/3+50, H/2);
  }
  else{
    c.fillText('Its a DRAW!', W/3+60, H/2);
  }
  reload.style.display = 'none';
  play_again.style.display = 'block';
  instructions.style.display = 'none';
  pause_div.style.display = 'none';
}

function animate(){
  requestAnimationFrame(animate);
  c.clearRect(0,0,innerWidth,innerHeight);
  if(mouse.x){
    gun1.calcAngle();
    gun2.calcAngle();
  }
  if(redraw_mountain){
    cm.clearRect(0,0,innerWidth,innerHeight);
    drawMountain();
    redraw_mountain  = false;
  }
  if(upPressed){
    if(tank1.state && weapon.amount1[0]>0){
      weapon.p1_choice = 0;
    }
    if(tank2.state && weapon.amount2[0]>0){
      weapon.p2_choice = 0;
    }
  }
  if(downPressed){
    if(tank1.state && weapon.amount1[1]>0){
      weapon.p1_choice = 1;
    }
    if(tank2.state && weapon.amount2[1]>0){
      weapon.p2_choice = 1;
    }
  }
  tank1.update();
  tank2.update();

  gun1.draw(tank1.x, tank1.y, tank1.angle);
  gun2.draw(tank2.x, tank2.y, tank2.angle);
  try{
    bullet.update();
  }
  catch(err){}
  explosion.draw();
  if(next_turn){
    next_turn = false;
    if(player1_state){
      playerTurn(2);
    }
    else{
      playerTurn(1);
    }
  }
  drawStats();
  if(health.p1 <= 0 || health.p2 <= 0){
    if(explosion.state){
      game_over = true;
    }
  }
  if(weapon.amount2[0]==0 && weapon.amount2[1]==0){
    if(explosion.state){
      game_over = true;
    }
  }
  if(game_over){
    gameOver();
  }
}

animate();
