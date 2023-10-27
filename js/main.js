
import GraphEditor      from './graphEditor.js';

const canvas        = document.getElementById('canvasMS');
      canvas.width  = innerWidth;
      canvas.height = innerHeight;
const ctx = canvas.getContext('2d');


const selectElement = document.getElementById('load');
const input         = document.querySelector('.controls .input-wrapper input');
const inputLine     = document.querySelector('.controls .input-wrapper .line');
const iconClose     = document.querySelector('.controls .input-wrapper .icon.close');

const buttonInputSave    = document.getElementById('buttonInputSave');
const buttonSave         = document.getElementById('buttonSave');
const buttonload         = document.getElementById('buttonload');

let saveName   = '';
let saveNames  = Object.keys(localStorage);  // отримуємо всі ключі з localStorage і поміщаємо їх в окремий масив;


// фукція збереження нового graph при натисканні на кнопку
let saveButton = false;
window.inputSave = function() {
      saveButton = !saveButton;
      if (saveButton) {
            input.style.display   = 'block'
            input.style.animation = 'slideRight 1s ease forwards';
            buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
      }
      if(!saveButton) {
            if(input.value.trim() !== '') newSave();
            clearInput();
            input.style.animation = 'slideLeft 1s ease forwards';
            setTimeout(function() {input.style.display = 'none'}, 1000);
      }
};
// фукція збереження нового graph при натисканні на Enter
input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){
            if(input.value.trim() !== '') newSave();
            clearInput();
            input.style.animation = 'slideLeft 1s ease forwards';
            buttonInputSave.innerHTML = '<i class="bx bx-bookmark-alt-plus"></i>';
            setTimeout(function() {input.style.display = 'none'}, 1000);
            saveButton = false;
      }
 });

function newSave(){
      saveName = input.value;
      localStorage.setItem(saveName, JSON.stringify(graphEditor.graph));
      saveNames  = Object.keys(localStorage)
      clearInput();
};
// умова появи/зникнення лінії під полем для збереження
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
// функція очищення поля і зникнення лінії 
function clearInput(){
      input.value = '';
      iconClose.style.transform           = 'scale(0)';
      inputLine.style.transform           = 'scaleX(0)';
      inputLine.style.transformOrigin     = 'right';
}


// фукція загрузки graph
let loadButton = false;
window.load = function() {
      loadButton = !loadButton;
      if(loadButton  && saveNames.length !== 0){
            populateSelect();
            selectElement.style.display   = 'block';
            selectElement.style.animation = 'slideRight 2s ease forwards';
            buttonload.innerHTML = "<i class='bx bx-folder-open'></i>"
      }else{
            selectElement.style.animation = 'slideLeft 2s ease forwards';
            setTimeout(function() {selectElement.style.display = 'none'}, 1000);
            buttonload.innerHTML = "<i class='bx bx-folder'></i>"
      }
}
// функція створення списку з усіх отриманих ключів saveNames
function populateSelect() {
      selectElement.innerHTML = "";
      let option = document.createElement("option");
      option.text = 'Список загрузки';
      selectElement.appendChild(option)
      for (let name in saveNames) {
             if(saveNames[name] !== ''){
                  option = document.createElement("option");
                  option.value = saveNames[name];
                  option.text  = saveNames[name];
                  selectElement.appendChild(option);
            }
      }
}

let graphString = localStorage.getItem(`${saveName}`);
let saveInfo    = graphString ? JSON.parse(graphString) : null;
let graphEditor = new GraphEditor (canvas, saveInfo);

selectElement.addEventListener('change', function(e){
      console.log(e.target)
      saveName    = e.target.value;
      graphString = localStorage.getItem(`${saveName}`);
      saveInfo    = graphString ? JSON.parse(graphString) : null;
      graphEditor = new GraphEditor (canvas, saveInfo);
      // блок закриття меню загрузки
      selectElement.style.animation = 'slideLeft 2s ease forwards';
      buttonload.innerHTML = "<i class='bx bx-folder'></i>";
      loadButton = false;
 
      setTimeout(function() {selectElement.style.display = 'none'}, 1000);
});

const tools = graphEditor.tools
// Блок керування кнопками 
window.setTool = function(button){
      const tool = button.getAttribute('data-tool');
      graphEditor.setTool(tool);
      updateButtonStyles();
};

// Поелементне додавання/видалення класів для кнопок
function updateButtonStyles() {
      for (const tool in tools) {
            const button       = document.querySelector(`.button[data-tool='${tool}']`);
            const toolIsActive = tools[tool];
            toolIsActive ? button.classList.toggle('active') : button.classList.remove('active')
      }
}
    
window.zoom = function(key){
      if(key === 'plus')  graphEditor.vieport.zoom -= 5 * graphEditor.vieport.step;
      if(key === 'minus') graphEditor.vieport.zoom += 5 * graphEditor.vieport.step;
      graphEditor.vieport.zoom  = Math.max( graphEditor.vieport.minZoom, Math.min( graphEditor.vieport.maxZoom,  graphEditor.vieport.zoom))
};
// функція очи
let dispose = false;
window.dispose = function(){
      if(saveName === ''){
            buttonInputSave.innerHTML = "<i class='bx bx-bookmark-alt bx-tada'></i>";
      }
      if(saveName !== '' && !save){
            dispose = true
            buttonSave.innerHTML = "<i class='bx bx-save bx-burst'></i>";
      }
      if(save){
            saveName = ''
            graphEditor.dispose();
            localStorage.setItem(saveName, JSON.stringify(graphEditor.graph));
            saveNames  = Object.keys(localStorage)
            save = false;
      };
};
// функція збереження поточного graph
let save = false 
window.save = function() {
      if(dispose){
            save = true;
            buttonSave.innerHTML = "<i class='bx bx-save'></i>" ;
      }
      if (saveNames.includes(saveName) && saveName !== '') {
            localStorage.setItem(saveName, JSON.stringify(graphEditor.graph));
            dispose = false;
      }else if(saveName === ''){
            buttonInputSave.innerHTML = "<i class='bx bx-bookmark-alt bx-tada'></i>";
      }
};

function animate(){
      
      graphEditor.draw(ctx);
      requestAnimationFrame(animate);
}

animate(0);
