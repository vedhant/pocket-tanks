var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth*0.95;
canvas.height = window.innerHeight*0.95;
var W = canvas.width;
var H = canvas.height;
var c = canvas.getContext('2d');


var gravity = 0.015;
var leftPressed = false;
var rightPressed = false;
var player1_state = false;
var player2_state = false;

var mouse = {
  x : undefined,
  y : undefined
};

window.addEventListener('keydown',function(e){
  if(e.key == 'ArrowLeft'){leftPressed = true;}
  if(e.key == 'ArrowRight'){rightPressed = true;}
});

window.addEventListener('keyup',function(e){
  if(e.key == 'ArrowLeft'){leftPressed = false;}
  if(e.key == 'ArrowRight'){rightPressed = false;}
});

window.addEventListener('mousemove', function(e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function Mountain(){
  this.x = [0, W];
  this.y = [H*3/4, H*3/4];
  this.roughness = 0.3;

  this.findLocus = function(start, displacement){
    var start_index;
    for(var i = 0; i<this.x.length; ++i){
      if(this.x[i] == start){
        start_index = i;
        break;
      }
    }
    if(this.x[start_index+1] - this.x[start_index] < 3){
      return;
    }
    var midx = (this.x[start_index] + this.x[start_index+1])/2;
    var midy = (this.y[start_index] + this.y[start_index+1])/2;
    if(this.x.length == 2){

      var rand = 0;
      while(rand < 0.5){
        rand = Math.random();
      }
      console.log(rand);
      midy += displacement*rand;
    }
    else{
      midy += displacement*Math.random();
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
    this.x.push(0);
    this.y.push(H);
    this.x.push(this.x[0]);
    this.y.push(this.y[0]);
    c.beginPath();
    c.moveTo(this.x[0],this.y[0]);
    for(var i = 1; i<this.x.length; ++i){
      c.lineTo(this.x[i],this.y[i]);
    }
    c.fillStyle = 'green';
    c.fill();
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
    c.drawImage(this.tank, 0, 0, 28, 10, 0, 0, this.width, this.height);
  }
  this.update = function(){
    if(rightPressed && this.state){
      this.dx = 1.3;
    }
    else if(leftPressed && this.state){
      this.dx = -1.3;
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
    this.y = slope*(this.x - mountain.x[i]) + mountain.y[i];
    this.angle = Math.atan(slope);
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

  this.calcAngle = function(){
    if(this.state){
      slope = (this.y + this.scale*14*Math.sin(this.tank_angle) + this.scale*10*Math.cos(this.tank_angle) - mouse.y)/(this.x + this.scale*14*Math.cos(this.tank_angle) + this.scale*10*Math.sin(this.tank_angle) -  mouse.x);
      this.angle = Math.atan(slope);
      if(mouse.x<this.x + this.scale*14*Math.cos(this.tank_angle) + this.scale*10*Math.sin(this.tank_angle)){
        this.angle += Math.PI;
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
    c.drawImage(this.gun, 0, 0, 12, 4, 0, 0, this.width, this.height);
    c.rotate(this.tank_angle - this.angle);
    c.translate(-this.scale*14, this.scale*10);
    c.rotate(-this.tank_angle);
    c.translate(-this.x,-this.y);
  }
}

function Bullet(src,x,y,dv,angle){
  this.bullet = new Image();
  this.bullet.src = src;
  this.scale = 1.5;
  this.width = 12*this.scale;
  this.height = 3*this.scale;
  this.x = x;
  this.y = y;
  this.speed = dv;
  this.angle = angle;
  this.dx = this.speed*Math.cos(this.angle);
  this.dy = this.speed*Math.sin(this.angle);

  this.draw = function() {
    this.angle = Math.atan(this.dy/this.dx);
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    c.drawImage(this.bullet, 0, 0, 12, 3, 0, 0, this.width, this.height);
    c.rotate(-this.angle);
    c.translate(-this.x, -this.y);

  }
  this.update = function() {
    this.x += this.dx;
    this.y += this.dy;
    this.dy += gravity;
    this.draw();
  }
}

// function init(){
//   mountain = new Mountain();
//   mountain.findLocus();
//   tank1 = new Tank("redTank.png",500);
//   gun1 = new Gun("gun.png");
//   bullet = new Bullet("bullet.png", 100, 300, 3,- Math.PI/4);
// }

function startGame(){
  mountain = new Mountain();
  mountain.findLocus(0, -3*H/4);
  tank1 = new Tank("redTank.png", W*Math.random()/3, false);
  tank2 = new Tank("yellowTank.png", W - W*Math.random()/3, false);
  gun1 = new Gun("gun.png", false);
  gun2 = new Gun("gun.png", false);
  playerTurn(2);
}

function playerTurn(player){
  if(player == 1){
    player1_state = true;
    player2_state = false;
  }
  else{
    player1_state = false;
    player2_state = true;
  }
  tank1.state = player1_state;
  tank2.state = player2_state;
  gun1.state = player1_state;
  gun2.state = player2_state;

}
function fire(){

}

startGame();

function animate(){
  requestAnimationFrame(animate);
  c.clearRect(0,0,innerWidth,innerHeight);
  if(mouse.x){
    gun1.calcAngle();
    gun2.calcAngle();
  }
  tank1.update();
  tank2.update();
  mountain.draw();
  gun1.draw(tank1.x, tank1.y, tank1.angle);
  gun2.draw(tank2.x, tank2.y, tank2.angle);
  // bullet.update();
}
animate();


//FIX
//tank2 out of frame
//background color and terrain color
//fix tank movement bounds
