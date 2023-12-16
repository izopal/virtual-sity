import * as utils       from './math/utils.js';
import { ToolsMeneger } from './tools.js';
import {Vieport}        from './vieport.js';
import { App }          from './myApp.js';
import { data }         from './constants.js';
import { timeAnimate }  from './animateList.js';

import { Polygon }      from './primitives/polygon.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;

const ctx           = canvas.getContext('2d');
//  параметри рамки в які будуть генеруватися наші обєктм
const canvasSize    = canvas.getBoundingClientRect();
const bbox =  [
      {x:canvasSize.right, y:canvasSize.bottom},
      {x:canvasSize.right, y:canvasSize.top},
      {x:canvasSize.left, y:canvasSize.top},
      {x:canvasSize.left, y:canvasSize.bottom},
]

console.log(bbox);






const renderRadius  = Math.hypot(canvas.width, canvas.height) * .5;
      


const barFromEditors    = document.querySelector('.btnEditor');
const buttonFromEditors = barFromEditors.querySelectorAll('button');

const config = {
      canvas,
      renderRadius,
      timeAnimate,
      data,
      toolsMeneger:     new ToolsMeneger(data, timeAnimate),
};


const vieport      = new Vieport(config);

const sceleton = [];
for(const point of bbox){
    const currentPoint = utils.operate(point, '*', vieport.zoom)
    console.log(currentPoint)
    sceleton.push(point);
}
const monitor = new Polygon(sceleton);



const myApp        = new App(vieport, config);


buttonFromEditors.forEach((button) => {
      button.removeEventListener('click', boundEditorClick);
      button.addEventListener('click', boundEditorClick);
});


function boundEditorClick(){
   for(const tool in config.toolsMeneger.editorState){
      config.toolsMeneger.editorState[tool]  ? 
            myApp[`${tool}Editor`].enable() :
            myApp[`${tool}Editor`].disable(); 
   }
}


window.addEventListener('load',  () => { 
      animate(0);
});

function animate(){
      const viewPoint    = utils.operate(vieport.getPointOffset(), '*', -1)
      vieport.draw(ctx);
      myApp.draw(ctx, viewPoint, vieport.zoom);

      if(data.debug.state) myApp.drawDebug(ctx);

      requestAnimationFrame(animate);
};