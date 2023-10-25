
import GraphEditor      from './graphEditor.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
const ctx = canvas.getContext('2d');


const selectElement = document.getElementById('load');
const input         = document.querySelector('.controls .input-wrapper input');
const inputLine     = document.querySelector('.controls .input-wrapper .line');
const iconClose     = document.querySelector('.controls .input-wrapper .icon.close');


const saveNames  = Object.keys(localStorage);  // отримуємо всі ключі з localStorage і поміщаємо їх в окремий масив
// функція знайти ключ в масиві
function populateSelect() {
      for (let i = 0; i < saveNames.length; i++) {
            const option = document.createElement('option');
            option.value = saveNames[i]; // Значення може бути іншим, якщо потрібно
            option.text = saveNames[i];
            selectElement.appendChild(option);
      }
}
// Викликаємо функцію для заповнення вибірки
populateSelect();

let saveName = '';
let graphString = localStorage.getItem(`${saveName}`);
let saveInfo   = graphString ? JSON.parse(graphString) : null;
let graphEditor = new GraphEditor (canvas, saveInfo);


selectElement.addEventListener('change', function(e){
      saveName    = e.target.value;
      graphString = localStorage.getItem(`${saveName}`);
      saveInfo    = graphString ? JSON.parse(graphString) : null;
      console.log(saveInfo)
      graphEditor = new GraphEditor (canvas, saveInfo);
});


function animate(){
      graphEditor.draw(ctx);
      requestAnimationFrame(animate);
}
animate();







// Блок керування кнопками 
window.dispose = function(){
      graphEditor.dispose();
};
window.setTool = function(tool){
      graphEditor.setTool(tool);
};
window.zoom = function(key){
     if(key === 'plus')  graphEditor.vieport.zoom -= 5 * graphEditor.vieport.step;
     if(key === 'minus') graphEditor.vieport.zoom += 5 * graphEditor.vieport.step;
     graphEditor.vieport.zoom  = Math.max( graphEditor.vieport.minZoom, Math.min( graphEditor.vieport.maxZoom,  graphEditor.vieport.zoom))
}


let loadButton = false;

window.getGraph = function() {
      loadButton = !loadButton
      if(loadButton){
            selectElement.style.display   = 'block';
            selectElement.style.animation = 'slideRight 2s ease forwards';
      };
      if(!loadButton){
            selectElement.style.animation = 'slideLeft 2s ease forwards';
            setTimeout(function() {selectElement.style.display = 'none'}, 1000);
      }
}


// умова появи іконки закриття і лінії підкреслення(якщо рядок заповнений появляється)
let saveButton = false;

window.inputSave = function() {
      saveButton = !saveButton;
      
      if (saveButton) {
            input.style.display   = 'block'
            input.style.animation = 'slideRight 1s ease forwards';
      }
      if(!saveButton) {
            if(input.value.trim() !== ''){
                 save()
            }
            input.style.animation = 'slideLeft 1s ease forwards';
            setTimeout(function() {input.style.display = 'none'}, 1000);
      }     
};

input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){
            if(input.value.trim() !== '') save()
      }
 });

function save(){
      const saveName = input.value;
      localStorage.setItem(saveName, JSON.stringify(graphEditor.graph))
      clearInput();
}


input.addEventListener('input', function() {
      if(input.value.trim() !== '') {
            inputLine.style.transform       = 'scaleX(1)';
            inputLine.style.transformOrigin = 'left';
            iconClose.style.transform       = 'scale(1)';
      } else {
            clearInput()
      }
});

// очищаємо поле для введення "input" і зникнення лінії підкреслення при натисканні на іконку закриття
iconClose.addEventListener('click', () => {
      clearInput();
});

function clearInput(){
      iconClose.style.transform           = 'scale(0)';
      input.value = '';
      inputLine.style.transform           = 'scaleX(0)';
      inputLine.style.transformOrigin     = 'right';
}





