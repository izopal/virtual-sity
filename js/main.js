import { ToolsMeneger } from './tools.js';
import { App } from './myApp.js';
import { data }         from './constants.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
const ctx = canvas.getContext('2d');


const toolsMeneger = new ToolsMeneger(data);
const myApp        = new App(canvas, toolsMeneger, data)

window.addEventListener('load',  () => { 
      animate(0);
});

function animate(){
      // console.log(Object.values(toolsMeneger.tools).every(value => value === false));
      myApp.draw(ctx);
      requestAnimationFrame(animate);
};