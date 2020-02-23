class Whiteboard {

  constructor(canvas, ctx, socket) {
    this.color = 'black';
    this.canvas = canvas;
    this.positions = [];
    this.ctx = ctx;
    this.ctx.lineWidth = 1;
    this.isDrawing = false;
    this.socket = socket;
  }

  setColor(color) {
    this.color = color;
    this.ctx.strokeStyle = this.getColor();
  }

  getColor() {
    return this.color;
  }

  startDrawing(e) {
    this.isDrawing = true;
  }

  draw(e) {
    if(!this.isDrawing) return;
    const position = {x: e.offsetX, y: e.offsetY};
    this.positions.push(position);
    this.drawOnCanvas(this.positions);
  }

  stopDrawing(e) {
    this.isDrawing = false;
    this.positions = [];
  }

  drawOnCanvas(positions) {
    this.ctx.beginPath();
    this.ctx.moveTo(this.positions[0].x, this.positions[0].y);
    this.positions.forEach((position) => {
      this.ctx.lineTo(position.x, position.y);
    })
    this.ctx.stroke();
    this.socket.emit('drawing', { data: { positions, color: this.getColor() } });
  }

  resetCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawOnCanvasFromOthers(data) {
    if (this.isDrawing) return;
    const receivedPositions = data.data.positions;
    this.ctx.strokeStyle = data.data.color;
    this.ctx.beginPath();
    this.ctx.moveTo(receivedPositions[0].x, receivedPositions[0].y);
    receivedPositions.forEach((position) => {
      this.ctx.lineTo(position.x, position.y);
    })
    this.ctx.stroke();
  }

}

const buttons = document.querySelectorAll('.color');
const canvas = document.getElementById('whiteboard');
const reset = document.getElementById('reset');
const ctx = canvas.getContext('2d');
const socket = io();
const whiteboard = new Whiteboard(canvas, ctx, socket);

buttons.forEach( button => {
  button.addEventListener('click', (e) => {
    const color = button.classList[1];
    whiteboard.setColor(color);
  });
});

reset.addEventListener('click', (e) => {
  socket.emit('resetCanvas');
  whiteboard.resetCanvas();
});

canvas.addEventListener('mousedown', (e) => { whiteboard.startDrawing(e) }, false);
canvas.addEventListener('mouseup', (e) => { whiteboard.stopDrawing(e) }, false);
canvas.addEventListener('mousemove', (e) => { whiteboard.draw(e)}, false);

socket.on('drawing', (data) => {
  whiteboard.drawOnCanvasFromOthers(data);
});

socket.on('resetCanvas', () => {
  whiteboard.resetCanvas();
})