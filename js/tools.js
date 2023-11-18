import { getValidValue } from './math/utils.js';
import { setTool }       from './math/utils.js';

const buttonToolsFromGraph  = document.querySelectorAll(`.button[data-tool]`);
const buttonToolsFromStop   = document.querySelectorAll(`.button[data-toolStop]`);
const tools         = document.querySelector('.tools');
const navigBarTools = document.querySelector('.navig-bar-tools');

const rangeValue   = document.getElementById('rangeValue');
const inputValue   = document.getElementById('inputValue');

const prev         = document.getElementById('prev');
const next         = document.getElementById('next');

export class ToolsMeneger{
    constructor(data){
        this.data = data
        this.buttonToolsFromGraph = buttonToolsFromGraph;

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
            },
        };

        this.validValue = null;

        this.degrees       = 0;
        this.angle         = 360 / this.buttonToolsFromGraph.length;
        this.touchY        = 0; 
        this.touchTreshold = 20;

        this.initialize();
       
    };
    initialize(){
        
        inputValue.addEventListener('mousemove',    this.#rangeSlider.bind(this));
        inputValue.addEventListener('touchmove',    this.#rangeSlider.bind(this));
        // перехід між згенерованими картинками вперед('next')/назад('prev')
        prev.addEventListener('click', () =>   this.updateRotation(this.degrees += this.angle));
        next.addEventListener('click', () =>   this.updateRotation(this.degrees -= this.angle));
        // перехід між згенерованими картинками задопомогою swipe вліво/вправо
        navigBarTools.addEventListener('touchmove',    this.updateRotationSwipe.bind(this));
        
        this.buttonToolsFromGraph.forEach((button) => {
            button.addEventListener('click', () => this.getActiveTool(button));
        });
    }
    
    // Блок керування кнопками 
    getActiveTool(button) {
      const buttonActive = button.getAttribute('data-tool');
        setTool(buttonActive, this.tools.graph)
        this.#updateButtonStyles(buttonActive);
        this.#updateRangeValue(buttonActive);
    };
    
    // зміна стилю кнопок приактивації деактивації    
    #updateButtonStyles() {
        this.buttonToolsFromGraph.forEach((button) => {
            const buttonName = button.getAttribute('data-tool');
            const isActive = this.tools.graph[buttonName];
            button.classList.toggle('active', isActive);
        });
    };

    updateRotation(degrees) {
        tools.style.transform = `translateY(-50%)
                                 perspective(1000px) 
                                 rotatex(${degrees}deg)`;
    };
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
    #updateRangeValue(buttonActive) {
        if (buttonActive === 'curve') rangeValue.innerHTML = inputValue.value = Math.floor(this.data.primitives.segment.curve.size);
        if (buttonActive === 'point') rangeValue.innerHTML = inputValue.value = Math.floor(this.data.primitives.point.point.radius);
    };

    resetTools() {
        // Встановлення всіх значень в this.tools на false
        Object.keys(this.tools).forEach(category => {
            Object.keys(this.tools[category]).forEach(tool => {
                this.tools[category][tool] = false;
            });
        });
    };
    resetButtonStyles(){
        const allToolsButton = [...buttonToolsFromGraph, ...buttonToolsFromStop];
        allToolsButton.forEach(button =>  button.classList.remove('active'));
    }
}