import { getValidValue } from './math/utils.js';
import { setTool }       from './math/utils.js';

const nameGraph         = document.getElementById('nameEditor');
const barFromEditors    = document.querySelector('.btnEditor');
const buttonFromEditors = barFromEditors.querySelectorAll('button');

const arrowBar         = document.querySelector('.arrow-bar');

const navigBarTools    = document.querySelector('.navig-bar-tools');
const bars             = navigBarTools.querySelectorAll('.bar');
const allTools         = navigBarTools.querySelectorAll('[data-tool]');
const backgrounds      = navigBarTools.querySelectorAll('.background');

const rangeValue   = document.getElementById('rangeValue');
const inputValue   = document.getElementById('inputValue');

const prev         = document.getElementById('prev');
const next         = document.getElementById('next');   

export class ToolsMeneger{
    constructor(data, timeAnimate){
        this.data        = data;
        this.timeAnimate = timeAnimate;
        this.allTools    = allTools;
        
        this.tools= {
            graph: {
                dragging: false,        // параметри вкл.-викл. редактора (пересування точок)
                remove:   false,        // параметр вкл.-викл резинки
                curve:    false,        // парамет малювання кривої лінії
                point:    false,        // параметр малювання точки;
                polygon:  false,        // параметр малювання полігону;
                road:     false,        // параметр малювання дороги;
                tree:     false,        // параметр малювання дерев;
                building: false,        // параметр малювання будинків;
                city:     false,        // параметр малювання міста;
            },
            marking:{
                stop:          false,   // параметри розміщення розмітки STOP;
                start:         false,   // параметри розміщення машини;
                pedestrian:    false,   // параметри розміщення дорожніх зебр;
                trafficLights: false,   // параметри розміщення світлофорів;
                avtobus:       false,   // параметри розміщення автобусних зупинок;
                parking :      false,   // параметри розміщення парковки;
                remove:        false,   // параметр вкл.-викл резинки;
            },
        };
        this.editorState = {
            graph: false,
            marking:  false,
        };
 
        this.buttonsObject = {};
        this.buttonName    = ''

        this.degrees       = 0;
        this.touchY        = 0; 
        this.touchTreshold = 20;

       
      
        this.initialize();
    };
   
    initialize() {
        this.removeEventListeners() 
        this.addEventListeners();
    };
    removeEventListeners() {
        // Очистити обробники подій для всіх елементів
        prev.removeEventListener('click', this.boudPrevClick);
        next.removeEventListener('click', this.boudNextClick);
        inputValue.removeEventListener('mousemove', this.boudRangeSlider);
        navigBarTools.removeEventListener('touchmove', this.boudTouchMove);
        inputValue.removeEventListener('touchmove', this.boudRangeSlider);
    }
    addEventListeners(){
        this.boundEditorClick = this.getActiveEditor.bind(this);
        this.boundToolsClick  = this.getActiveTools.bind(this);
        this.boudPrevClick    = () =>   this.updateRotation(this.degrees += this.angle)
        this.boudNextClick    = () =>   this.updateRotation(this.degrees -= this.angle);
        this.boudTouchMove    = this.updateRotationSwipe.bind(this);
        this.boudRangeSlider  = this.#rangeSlider.bind(this);

        buttonFromEditors.forEach((button) => {
            button.removeEventListener('click', this.boundEditorClick);
            button.addEventListener('click', this.boundEditorClick);
        });
       
        this.allTools.forEach((button) => {
            button.removeEventListener('click', this.boundToolsClick);
            button.addEventListener('click', this.boundToolsClick );
            this.setupDomElements(button)
        });

        prev.addEventListener('click', this.boudPrevClick);
        next.addEventListener('click', this.boudNextClick);
        inputValue.addEventListener('mousemove',    this.boudRangeSlider);
        navigBarTools.addEventListener('touchmove', this.boudTouchMove);
        inputValue.addEventListener('touchmove',    this.boudRangeSlider);
    }
    setupDomElements(button){
        const classListName = button.classList[0]
        if (!this.buttonsObject[classListName]) this.buttonsObject[classListName] = [];   // Додати клас до об'єкта як ключ, якщо він ще не існує
        this.buttonsObject[classListName].push(button);                                   // Додати кнопку до відповідного масиву в об'єкті
    }

    getActiveEditor(event){
        const button = event.target.closest('button[data-tool]');
        this.buttonName = button.getAttribute('data-tool');

        this.resetTools();
        setTool(this.buttonName, this.editorState);
        this.#updateButtonStyles(buttonFromEditors, this.editorState)
        this.#getToolsBar(this.buttonName);
    };
    getActiveTools(event){
        const button = event.target.closest('button[data-tool]');
        const name = button.getAttribute('data-tool');
       
        setTool(name, this.tools[this.buttonName]);
        this.#updateButtonStyles(this.buttonsObject[this.buttonName], this.tools[this.buttonName]);
        this.#updateRangeValue(name);
    };
   
    // зміна стилю кнопок приактивації деактивації    
    #updateButtonStyles(buttons, state) {
        buttons.forEach(button => {
            const buttonName = button.getAttribute('data-tool');
            const isActive   = state[buttonName];
            button.classList.toggle('active', isActive);
        })
    };
    // функція появи панелі інструментів
    #getToolsBar(buttonName){
        this.getNameEditor(this.editorState[buttonName], buttonName);
        this.getArrowBar();
        this.getToolsBar(this.editorState[buttonName], buttonName)
    }
 
    getNameEditor(state, name) {
        // ДОРОБИТИ ПОЯВУ ІМЯ Editor
                // const spans = editorBar.querySelectorAll('span')
                // const buttons = barFromEditors.querySelectorAll('button')
                // if(spans.length <  buttons.length){
                //     const span = document.createElement("span");
                //     span.innerText = `${name} editor`
                //     editorBar.appendChild(span);
                // }
           
        if (state && name === 'graph') {
            nameGraph.style.animation = `slideRight ${this.timeAnimate.editorBar}s ease forwards`;
            nameGraph.innerHTML = 'Graph Editor';
        }else{
            nameGraph.style.animation = `slideLeft ${this.timeAnimate.editorBar}s ease forwards`;
        }   
    };
    getArrowBar(){
        const allFalse    = Object.values(this.editorState).every(value => value === false);
        arrowBar.style.animation = !allFalse ?
            `slideArrowUp ${this.timeAnimate.arrowBar}s ease forwards`    :
            `slideArrowDouwn ${this.timeAnimate.arrowBar}s ease forwards`;
    };
    getToolsBar(state, name){
        
        this.angle = 360 / this.buttonsObject[this.buttonName].length;
 
        bars.forEach(bar => {
            const barClasses = bar.classList;
            const animationClass = barClasses.contains(name) ?
                'toolsBarOn' : 'toolsBarOff';
            bar.style.animation = `${animationClass} ${this.timeAnimate.toolsBar}s ease forwards`;
        });
    
        this.buttonsObject[name].forEach((button) => {
            button.style.animation = state ?
                `slideAppear ${this.timeAnimate.toolsBar}s ease forwards` :
                `slideDisappear ${this.timeAnimate.toolsBar}s ease forwards`;
        });
    };

    // ======================================================================>
    updateRotation(degrees) {
       

        if (this.buttonName) {
            backgrounds.forEach(b => b.style.transform =  `rotatex(${degrees * -1}deg)`)
            const bar = document.querySelector(`.bar.${this.buttonName}`);
            if (bar) {
                bar.style.transform = `translateY(-50%)
                perspective(1000px) 
                rotatex(${degrees}deg)`;
                
                
            }
       };
    }
    updateRotationSwipe(e){
        const swipeDistance = e.targetTouches[0].pageY - this.touchY;

        if (swipeDistance < -this.touchTreshold)     this.updateRotation(this.degrees += this.angle)
        else if (swipeDistance > this.touchTreshold) this.updateRotation(this.degrees -= this.angle)
        
        this.touchY = e.targetTouches[0].pageY;
    };

    // функція отримання значення повзунка
    #rangeSlider(e) {
        const pageX = e.type === "mousemove" ? e.pageX : e.touches[0].clientX; 
        
        if(e.buttons === 1 ||(e.touches && e.touches.length === 1)){
            // Отримання min та max значень
            const minValue     = inputValue.min;
            const maxValue     = inputValue.max;
    
            const inputRect    = inputValue.getBoundingClientRect();
            const width        = inputRect.width;
            const validPageX   = pageX - inputRect.left;
            const percentage   = (validPageX / width) * 100;
            const value        = (percentage * (maxValue - minValue)) / 100 + minValue;
            const roundedValue = Math.floor(value);
            const validValue   = getValidValue(roundedValue, minValue, maxValue);
            
            this.#updateValue(validValue);

        }
    };
    #updateValue(value){
        rangeValue.innerHTML = value;
        if(this.tools.graph.curve) this.data.primitives.segment.curve.size = value;
        if(this.tools.graph.point) this.data.primitives.point.point.radius = value;
    };
    // обновлюємо значення повзунка при переключенні між інструментами
    #updateRangeValue(buttonActive) {
        if (buttonActive === 'curve') rangeValue.innerHTML = inputValue.value = Math.floor(this.data.primitives.segment.curve.size);
        if (buttonActive === 'point') rangeValue.innerHTML = inputValue.value = Math.floor(this.data.primitives.point.point.radius);
    };

    reset(){
        this.resetTools();
        this.resetEditors();
        this.resetToolsBar();
        this.resetArrowBar();
    };

    resetTools() {
       this.resetToolsFromEditor();
       this.resetButtonStylesTools();
    };
    resetToolsFromEditor(){
        Object.keys(this.tools).forEach(toolCategory => {
            Object.keys(this.tools[toolCategory]).forEach(tool => {
                this.tools[toolCategory][tool] = false;
            });
        });
    };
    resetButtonStylesTools(){
        this.allTools.forEach(button =>  button.classList.remove('active'));
    };

    resetEditors(){
        Object.keys(this.editorState).forEach(editor => {
            this.editorState[editor] = false;
        });
        buttonFromEditors.forEach(button =>  button.classList.remove('active'));
    };
    resetToolsBar(){
        bars.forEach(bar => {
            bar.style.animation = `toolsBarOff ${this.timeAnimate.toolsBar}s ease forwards`;
        });
    }
    resetArrowBar(){
        this.getArrowBar()
    };
}