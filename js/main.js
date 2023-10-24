
import GraphEditor      from './graphEditor.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
const ctx = canvas.getContext('2d');



const graphEditor = new GraphEditor (canvas)


function animate(){
      graphEditor.draw(ctx);
      requestAnimationFrame(animate);
}
animate();



// Блок керування кнопками 
window.dispose = function(){
      graphEditor.dispose();
};
window.save = function(){
      localStorage.setItem('graph', JSON.stringify(graphEditor.graph))
};
window.setTool = function(tool){
      graphEditor.setTool(tool);
};
window.zoom = function(key){
     if(key === 'plus')  graphEditor.vieport.zoom -= 5 * graphEditor.vieport.step;
     if(key === 'minus') graphEditor.vieport.zoom += 5 * graphEditor.vieport.step;
     graphEditor.vieport.zoom  = Math.max( graphEditor.vieport.minZoom, Math.min( graphEditor.vieport.maxZoom,  graphEditor.vieport.zoom))
}


