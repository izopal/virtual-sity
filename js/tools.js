import { getValidValue }       from './math/utils.js';

const buttonTools   = document.querySelectorAll(`.button[data-tool]`);
const tools         = document.querySelector('.tools');
const navigBarTools = document.querySelector('.navig-bar-tools');

const rangeValue   = document.getElementById('rangeValue');
const inputValue   = document.getElementById('inputValue');

const prev         = document.getElementById('prev');
const next         = document.getElementById('next');

export class ToolsMeneger{
    constructor(data){
        this.data = data
        this.buttonTools = buttonTools;

        this.inputValue = inputValue

        this.tools = {
            dragging: false,        // параметри вкл.-викл. редактора (пересування точок)
            remove:   false,        // параметр вкл.-викл резинки
            curve:    false,        // парамет малювання кривої лінії
            point:    false,        // параметр малювання точки;
            polygon:  false,        // параметр малювання полігону;
            road:     false,        // параметр малювання дороги;
            tree:     false,        // параметр малювання дерев;
            building: false,        // параметр малювання будинків;
            city:     false,        // параметр малювання міста;
        };

        this.validValue = null;

        this.degrees       = 0;
        this.angle         = 360 / this.buttonTools.length;
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
        
        this.buttonTools.forEach((button) => {
            button.addEventListener('click', () => this.setTool(button));
        });
    }
    
    // Блок керування кнопками 
    setTool(button) {
        
        const buttonActive = button.getAttribute('data-tool');
        this.#setTool(buttonActive);
        this.#updateButtonStyles();
        this.#updateRangeValue(buttonActive);
    };

    // зміна значення кнопок на true/false приактивації деактивації  
    #setTool(toolActive) {
        for (const tool in this.tools) {
            this.tools[tool] = tool === toolActive ? !this.tools[tool] : false
        };
    };
    
    // зміна стилю кнопок приактивації деактивації    
    #updateButtonStyles() {
        this.buttonTools.forEach((button) => {
            const tool = button.getAttribute('data-tool');
            const toolIsTrue = this.tools[tool];
            toolIsTrue ? button.classList.add('active') : button.classList.remove('active');
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

    resetTools() {
        for (const tool in this.tools) this.tools[tool] = false;
        return this.tools
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
        if(this.tools.curve) this.data.primitives.segment.curve.size = value;
        if(this.tools.point) this.data.primitives.point.point.radius = value;
    };

    #updateRangeValue(buttonActive) {
        if (buttonActive === 'curve') rangeValue.innerHTML = inputValue.value = Math.floor(this.data.primitives.segment.curve.size);
        if (buttonActive === 'point') rangeValue.innerHTML = inputValue.value = Math.floor(this.data.primitives.point.point.radius);
    };


   
}