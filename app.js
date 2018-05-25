var canvas = document.querySelector('canvas');
canvas.width = window.innerWidth*0.95;
canvas.height = window.innerHeight*0.95;
var W = canvas.width;
var H = canvas.height;
var c = canvas.getContext('2d');
var leftPressed = false;
var rightPressed = false;

window.addEventListener('keydown',function(e){
  if(e.key == 'ArrowLeft'){leftPressed = true;}
  if(e.key == 'ArrowRight'){rightPressed = true;}
});

window.addEventListener('keyup',function(e){
  if(e.key == 'ArrowLeft'){leftPressed = false;}
  if(e.key == 'ArrowRight'){rightPressed = false;}
});

function Mountain(){
  this.x = [];
  this.y = [];
  this.maxSlope = -(24*H)*(0.7)/(5*W);
  this.findLocus = function(){
    this.x.push(0);
    this.y.push((H*4/5)*(1+Math.random()/4));
    this.x.push(W/6);
    var x = this.x[1];
    this.y.push(this.y[0]);
    var y = this.y[1];
    while(x<(W/2)){
      x = this.x[this.x.length-1] + Math.random()*(W/40);
      y = this.y[this.y.length-1] + (x-this.x[this.x.length-1])*this.maxSlope*Math.random();
      this.x.push(x);
      this.y.push(y);
    }
    while(x<(5*W/6)){
      x = this.x[this.x.length-1] + Math.random()*(W/40);
      var rand = Math.random();
      if((y + (x-this.x[this.x.length-1])*(-1)*this.maxSlope*rand) < H){
        y = this.y[this.y.length-1] + (x-this.x[this.x.length-1])*(-1)*this.maxSlope*rand;
      }
      this.x.push(x);
      this.y.push(y);
    }
    this.x.push(W);
    this.y.push(y);
    this.x.push(W);
    this.y.push(H);
    this.x.push(0);
    this.y.push(H);
    this.x.push(0);
    this.y.push(this.y[0]);
  }
  this.draw = function(){
    c.beginPath();
    c.moveTo(this.x[0],this.y[0]);
    for(var i = 1; i<this.x.length; ++i){
      c.lineTo(this.x[i],this.y[i]);
    }
    c.fillStyle = 'green';
    c.fill();
  }
}


function Tank(src, x, y){
  this.tank = new Image();
  this.tank.src = src;
  this.scale = 1.5;
  this.width = this.scale*28;
  this.height = this.scale*10;
  this.x = x;
  this.angle = 0;
  this.dx = 0;
  this.draw = function(){
    c.drawImage(this.tank, 0, 0, 28, 10, 0, 0, this.width, this.height);
  }
  this.update = function(){
    if(rightPressed){
      this.dx = 1;
    }
    else if(leftPressed){
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



function init(){
  mountain = new Mountain();
  mountain.findLocus();
  tank1 = new Tank("redTank.png",500,mountain.y[0]);
}

init();

function animate(){
  requestAnimationFrame(animate);
  c.clearRect(0,0,innerWidth,innerHeight);
  tank1.update();
  mountain.draw();
}
animate();
