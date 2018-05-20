var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth*0.95;
canvas.height = window.innerHeight*0.95;
var W = canvas.width;
var H = canvas.height;

var c = canvas.getContext('2d');

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

var mountain = new Mountain();
mountain.findLocus();


function animate(){
  requestAnimationFrame(animate);
  c.clearRect(0,0,innerWidth,innerHeight);
  mountain.draw();
}
animate();
