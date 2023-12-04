
import * as utils       from './math/utils.js';
import { ToolsMeneger } from './tools.js';
import {Vieport}        from './vieport.js';
import { App }          from './myApp.js';
import { data }         from './constants.js';
import { timeAnimate }  from './animateList.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
const ctx = canvas.getContext('2d');


const barFromEditors    = document.querySelector('.btnEditor');
const buttonFromEditors = barFromEditors.querySelectorAll('button');

const toolsMeneger = new ToolsMeneger(data, timeAnimate);

const vieport      = new Vieport(canvas, toolsMeneger, data, timeAnimate);
const myApp        = new App(canvas, toolsMeneger, data, timeAnimate, vieport);


buttonFromEditors.forEach((button) => {
      button.removeEventListener('click', boundEditorClick);
      button.addEventListener('click', boundEditorClick);
});


function boundEditorClick(){
   for(const tool in toolsMeneger.editorState){
      toolsMeneger.editorState[tool]  ? 
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
      myApp.draw(ctx, viewPoint);

      if(data.debug.state) myApp.drawDebug(ctx);

      requestAnimationFrame(animate);
};