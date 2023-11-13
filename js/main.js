import * as utils       from './math/utils.js';
import { data }         from './constants.js';
import { ToolsMeneger } from './tools.js';

import { App } from './myApp.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
const ctx = canvas.getContext('2d');


const toolsMeneger  = new ToolsMeneger();
const tools         = toolsMeneger.tools;
const buttonTools   = toolsMeneger.buttonTools

const myApp = new App(canvas, buttonTools)

window.addEventListener('load',  () => { 
      animate(0);
});

function animate(){
      myApp.draw(ctx);
      requestAnimationFrame(animate);
};





// функція отримання значення повзунка

let rangeValue   = document.getElementById('rangeValue');
let inputValue   = document.getElementById('inputValue');


window.rangeSliderMouse = function(input) {
      const value = input.value
      updateValue(value);
  }
window.rangeSliderTouch = function(event, input) {
      const inputRect = input.getBoundingClientRect();
      const width = inputRect.width;
      const touchX = event.touches[0].clientX - inputRect.left;
      const percentage = (touchX / width) * 100;
      const value = (percentage * (input.max - input.min)) / 100 + input.min;
      const roundedValue = Math.floor(value);
      const validValue = utils.getValidValue(roundedValue, input.min, input.max);
      
      updateValue(validValue);
}


function updateValue(value){
      inputValue = 10
      console.log(inputValue.value)
      rangeValue.innerHTML = value;
      if(tools.curve){
            data.primitives.segment.curve.size = value;
            inputValue= data.primitives.segment.curve.size; 
      }
      else if(tools.point){
            data.primitives.point.point.radius = value;
            inputValue = data.primitives.point.point.radius;
      };
}