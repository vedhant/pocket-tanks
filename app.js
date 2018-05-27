var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth*0.95;
canvas.height = window.innerHeight*0.95;
var W = canvas.width;
var H = canvas.height;
var c = canvas.getContext('2d');


var gravity = 0.04;
var leftPressed = false;
var rightPressed = false;
var spacePressed = false;
var player1_state = false;
var player2_state = false;

var mouse = {
  x : undefined,
  y : undefined
};

window.addEventListener('keydown',function(e){
  if(e.key == 'ArrowLeft'){leftPressed = true;}
  if(e.key == 'ArrowRight'){rightPressed = true;}
  if(e.key == ' '){spacePressed = true;}
});

window.addEventListener('keyup',function(e){
  if(e.key == 'ArrowLeft'){leftPressed = false;}
  if(e.key == 'ArrowRight'){rightPressed = false;}
  if(e.key == ' '){spacePressed = false;}
});

window.addEventListener('mousemove', function(e){
  mouse.x = e.clientX;
  mouse.y = e.clientY;
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
    if(this.x[start_index+1] - this.x[start_index] < 2){
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
    }
  }
  this.collisionDetect = function() {
    for(var i = 1; i<mountain.x.length - 3; ++i){
      if(this.x >= mountain.x[i-1] && this.x < mountain.x[i]){
        var slope = (mountain.y[i] - mountain.y[i-1])/(mountain.x[i] - mountain.x[i-1]);
        if(this.y >= mountain.y[i-1] + slope*(this.x - mountain.x[i-1]))
        {
          this.state = false;
          explosion.x = this.x;
          explosion.y = this.y;
          explosion.state = true;
        }
      }
    }
  }
}

function Explosion(src){
  this.x = 0;
  this.y = 0;
  this.max_radius = W/20;
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
        for(var i=0; i<mountain.x.length - 3; ++i){
          if(mountain.x[i] >= this.x - this.radius && mountain.x[i] <= this.x + this.radius){
            var y = Math.sqrt(Math.pow(this.radius, 2) - Math.pow(this.x - mountain.x[i], 2)) + this.y;
            if(y > mountain.y[i]){
              mountain.y[i] = y;
            }
          }
        }
        this.state = false;
      }
    }
  }
}

function startGame(){
  mountain = new Mountain();
  mountain.findLocus(0, -3*H/4);
  tank1 = new Tank("redTank.png", W*Math.random()/3, false);
  tank2 = new Tank("yellowTank.png", W - W*Math.random()/3, false);
  gun1 = new Gun("gun.png", false);
  gun2 = new Gun("gun.png", false);
  bullet = new Bullet("bullet.png");
  explosion = new Explosion("explosion.png");
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
function fire(x, y, v, angle){
  bullet.speed = v;
  bullet.x = x;
  bullet.y = y;
  bullet.angle = angle;
  bullet.state = true;
  bullet.init();
  player1_state = false;
  player2_state = false;
  tank1.state = false;
  tank2.state = false;
}

startGame();

function animate(){
  requestAnimationFrame(animate);
  c.clearRect(0,0,innerWidth,innerHeight);
  mountain.draw();
  if(mouse.x){
    gun1.calcAngle();
    gun2.calcAngle();
  }
  tank1.update();
  tank2.update();

  gun1.draw(tank1.x, tank1.y, tank1.angle);
  gun2.draw(tank2.x, tank2.y, tank2.angle);
  try{
    bullet.update();
  }
  catch{}
  explosion.draw();

}
animate();


//FIX
//tank2 out of frame
//background color and terrain color
//fix tank movement bounds
//mouse scope out of window
