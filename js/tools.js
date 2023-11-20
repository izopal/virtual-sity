import { getValidValue } from './math/utils.js';
import { setTool }       from './math/utils.js';
import { timeAnimate } from './animateList.js';

const nameGraph        = document.getElementById('nameEditor');

const arrowBar           = document.querySelector('.arrow-bar');


const barFromEditors   = document.querySelector('.btnEditor');

const navigBarTools    = document.querySelector('.navig-bar-tools');
const allTools         = navigBarTools.querySelectorAll('[data-tool]');

const graphBar         = document.querySelector('.bar.graph');
const stopBar          = document.querySelector('.bar.stop');

const rangeValue   = document.getElementById('rangeValue');
const inputValue   = document.getElementById('inputValue');

const prev         = document.getElementById('prev');
const next         = document.getElementById('next');   

export class ToolsMeneger{
    constructor(data){
        this.data = data;
       

        this.allTools = allTools;
        
        this.timeAnimate = timeAnimate;
        this.barFromEditors       = barFromEditors;
        this.buttonFromEditors    = this.barFromEditors.querySelectorAll('button');

        this.graphBar             = graphBar;
        this.graphButtons         = this.graphBar.querySelectorAll('button');
        
        this.stopBar              = stopBar;
        this.stopButtons          = this.stopBar.querySelectorAll('button');

        this.inputValue = inputValue

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
            stop:{
                pedestrian:    false,   // параметри розміщення дорожніх зебр;
                trafficLights: false,   // параметри розміщення світлофорів;
                taxsi:         false,   // параметри розміщення атомобільних зупинок;
                avtobus:       false,   // параметри розміщення автобусних зупинок;
                avtobus1:      false,   // параметри розміщення автобусних зупинок;
                avtobus2:      false,   // параметри розміщення автобусних зупинок;
            },
        };
        this.editorState = {
            graph: false,
            stop:  false,
        }
        this.buttonsObject = {};

        this.allFalse    = false;
        this.validValue = null;

        this.degrees       = 0;
        this.touchY        = 0; 
        this.touchTreshold = 20;
        this.buttonName = ''
        this.initialize();
       
        if(this.editorState.graph){
            this.angle         = 360 / this.graphButtons.length;
        }else{
            this.angle         = 360 / this.stopButtons.length;
        }
        
    };
    initialize() {
        this.removeEventListeners() 
        this.addEventListeners();
        this.setupDomElements();
    };
    removeEventListeners() {
        this.buttonFromEditors.forEach((button) => {
            button.removeEventListener('click', this.boundButtonClick);
        });
        // Очистити обробники подій для всіх елементів
        prev.removeEventListener('click', this.boudPrevClick);
        next.removeEventListener('click', this.boudNextClick);
        navigBarTools.removeEventListener('touchmove', this.boudTouchMove);
        inputValue.removeEventListener('mousemove', this.boudRangeSlider);
        inputValue.removeEventListener('touchmove', this.boudRangeSlider);
    }
    
    addEventListeners(){
        this.boundButtonClick = this.getActiveEditor.bind(this);
        this.boudPrevClick    = () =>   this.updateRotation(this.degrees += this.angle)
        this.boudNextClick    = () =>   this.updateRotation(this.degrees -= this.angle);
        this.boudTouchMove    = this.updateRotationSwipe.bind(this);
        this.boudRangeSlider  = this.#rangeSlider.bind(this);

        this.buttonFromEditors.forEach((button) => {
            button.addEventListener('click', this.boundButtonClick);
        });
       
        prev.addEventListener('click', this.boudPrevClick);
        next.addEventListener('click', this.boudNextClick);
        navigBarTools.addEventListener('touchmove', this.boudTouchMove );
        inputValue.addEventListener('mousemove',    this.boudRangeSlider);
        inputValue.addEventListener('touchmove',    this.boudRangeSlider);
    }

   
  
    setupDomElements(){
        this.allTools.forEach(button => {
            const classListName = button.classList[0]
            if (!this.buttonsObject[classListName]) this.buttonsObject[classListName] = [];   // Додати клас до об'єкта як ключ, якщо він ще не існує
            this.buttonsObject[classListName].push(button);                                   // Додати кнопку до відповідного масиву в об'єкті
        });
    }


    getActiveEditor(event){
        const button = event.target.closest('button[data-tool]');
        this.buttonName = button.getAttribute('data-tool');
        this.#reset();
        
        setTool(this.buttonName, this.editorState);
   
        this.#updateButtonStyles(this.buttonFromEditors, this.editorState)

        this.#getToolsBar(this.buttonName);
        
        this.buttonClickHandler = (button) => {
            const name = button.getAttribute('data-tool');
           
            setTool(name, this.tools[this.buttonName]);
            this.#updateButtonStyles(this.buttonsObject[this.buttonName], this.tools[this.buttonName]);
            this.#updateRangeValue(name);
            console.log(this.buttonName, name, this.tools[this.buttonName]);
        };

        this.buttonsObject[this.buttonName].forEach((button) => {
            button.removeEventListener('click', () => this.buttonClickHandler(button));
            button.addEventListener('click', () => this.buttonClickHandler(button));
        });
        
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

        // анімація стилю nameEditor
        this.getNameEditor(this.editorState[buttonName]);

        // анімація стилю стрілок 
        const allFalse    = Object.values(this.editorState).every(value => value === false);
        
        arrowBar.style.animation = !allFalse ?
            `slideArrowUp ${this.timeAnimate.arrowBar}s ease forwards`    :
            `slideArrowDouwn ${this.timeAnimate.arrowBar}s ease forwards`;
     
        // анімацію стилю панелі інструментів graphEditor
        this.getToolsBar(this.editorState[buttonName], buttonName)
    }
 
    getNameEditor(state) {
        if (state) {
            nameGraph.style.animation = `slideRight ${this.timeAnimate.editorBar}s ease forwards`;
            nameGraph.innerHTML = 'Graph Editor';
        }else{
            nameGraph.style.animation = `slideLeft ${this.timeAnimate.editorBar}s ease forwards`;
        }   
    }
    getToolsBar(state, name){
        const bars = document.querySelectorAll('.bar');
    
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
    }
    

        
 

   
    // ======================================================================>
    updateRotation(degrees) {
        if (this.buttonName) {
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
            const minValue     = this.inputValue.min;
            const maxValue     = this.inputValue.max;
    
            const inputRect    = this.inputValue.getBoundingClientRect();
            const width        = inputRect.width;
            const validPageX   = pageX - inputRect.left;
            const percentage   = (validPageX / width) * 100;
            const value        = (percentage * (maxValue - minValue)) / 100 + minValue;
            const roundedValue = Math.floor(value);
            this.validValue   = getValidValue(roundedValue, minValue, maxValue);
            
            this.#updateValue(this.validValue);

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




    #reset(){
        // прибираємо з панелі активну кнопку
        this.resetTools();
        this.resetButtonStyles();
    };
    resetTools() {
        Object.keys(this.tools).forEach(toolCategory => {
            Object.keys(this.tools[toolCategory]).forEach(tool => {
                this.tools[toolCategory][tool] = false;
            });
        });
    }
    resetButtonStyles(){
        this.allTools.forEach(button =>  button.classList.remove('active'));
    }
}