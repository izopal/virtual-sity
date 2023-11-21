import * as utils  from './math/utils.js';
import {Point}     from './primitives/point.js';
import { timeAnimate } from './animateList.js'

const buttonZoom        = document.querySelectorAll(`.button[data-zoom]`);
const indicatorZoom     = document.querySelector('.indicator-zoom');
const zoomValue         = document.getElementById('zoomValue')

export class Vieport{
    constructor(canvas, toolsMeneger, data){
        this.canvas       = canvas;
        this.ctx          = this.canvas.getContext('2d');

        this.config       = data.vieport;
        this.configScale  = this.config.scale;

        this.toolsMeneger    = toolsMeneger;
        this.tools           = this.toolsMeneger.tools.graph
      
        // this.allToolFalse = Object.values(this.tools).every(value => value === false);

        this.timeAnimate  = timeAnimate;
        
        this.zoom         = utils.getValidValue(this.configScale.zoom, 0);
        this.step         = utils.getValidValue(this.configScale.step, 0);
        this.minZoom      = utils.getValidValue(this.configScale.minZoom, 0);
        this.maxZoom      = utils.getValidValue(this.configScale.maxZoom, 0);

        this.angle        = this.config.angle;

        this.point             = new Point();
        this.coordinatesCentre = {x: this.canvas.width * .5,
                                  y: this.canvas.height * .5}
        this.center            = new Point(this.coordinatesCentre);

        this.result            = utils.operate(this.center, '*', -1);
        this.offset            = new Point(this.result);
       
        this.drag   = {start:  this.point,
                       end:    this.point,
                       offset: this.point,
                       active: false};

        this.startDistance  = null;
        this.currentDistance = null;
        this.touchStartTime  = null;
        this.touchEndTime  = null;

        this.twoFingerTouch = false

        this.hideTimeout = null

        this.removeEventListener();
        this.addEventListener();
    };

    addEventListener(){
        this.boundZoomClick = this.getActiveZoom.bind(this)

        this.boundWeel       = this.inputMouseWheel.bind(this);
        this.boundMouseDown  = this.inputMouseDown.bind(this);
        this.boundMouseMove  = this.inputMouseMove.bind(this);
        this.boudMouseUp     = this.inputMouseUp.bind(this);
        this.boundTouchStart = this.inputTouchStart.bind(this);
        this.boundTouchMove  = this.inputTouchMove.bind(this);
        this.boundTouchEnd   = this.inputTouchEnd.bind(this);

        buttonZoom.forEach((button) => {
            button.removeEventListener('click', this.boundZoomClick);
            button.addEventListener('click',    this.boundZoomClick);
        });

        this.canvas.addEventListener('wheel',     this.boundWeel, {passive: true});
       
        this.canvas.addEventListener('mousedown',  this.boundMouseDown);
        this.canvas.addEventListener('mousemove',  this.boundMouseMove);
        this.canvas.addEventListener('mouseup',    this.boudMouseUp);

        this.canvas.addEventListener('touchstart', this.boundTouchStart, {passive: true});
        this.canvas.addEventListener('touchmove',  this.boundTouchMove, {passive: true});
        this.canvas.addEventListener('touchend',   this.boundTouchEnd, {passive: true});
    };
    removeEventListener(){
        this.canvas.addEventListener('wheel',      this.boundWeel, {passive: false});
        
        this.canvas.addEventListener('mousedown',  this.boundMouseDown);
        this.canvas.addEventListener('mousemove',  this.boundMouseMove);
        this.canvas.addEventListener('mouseup',    this.boudMouseUp);

        this.canvas.addEventListener('touchstart', this.boundTouchStart, {passive: false});
        this.canvas.addEventListener('touchmove',  this.boundTouchMove, {passive: false});
        this.canvas.addEventListener('touchend',   this.boundTouchEnd, {passive: false});
    };

    

    // функція zoom роликом
    inputMouseWheel(e){
        this.zoom += e.deltaY *.01 * this.step;
        this.getIndicatorZoom(this.zoom)
        return this.zoom  = this.#clampZoom(this.zoom)
    };
    // функція zoom кнопками
    getActiveZoom(event){
        const button = event.target.closest('button[data-zoom]');
        const buttonActive = button.getAttribute('data-zoom');
        this.zoom = this.zoomButton(buttonActive);
        this.getIndicatorZoom(this.zoom)
    };
    zoomButton(buttonActive){
        if(buttonActive === 'plus')  this.zoom += this.step;
        if(buttonActive === 'minus') this.zoom -= this.step;
        
        return this.#clampZoom(this.zoom);

    };    
    getIndicatorZoom(value){
        
        const corectZoom = Math.round((1 / value) * 4) / 4;
        const zoom = utils.getValidValue(corectZoom, this.minZoom, this.maxZoom)
        indicatorZoom.style.display   = 'flex';
        indicatorZoom.style.animation = `slideDouwn ${this.timeAnimate.zoomBar}s ease forwards`;
        zoomValue.innerHTML = `${zoom}x`;
        
        clearTimeout(this.hideTimeout);

        this.hideTimeout = setTimeout(() => indicatorZoom.style.animation = `slideUp ${this.timeAnimate.zoomBar}s ease forwards`, `${this.timeAnimate.setTimeoutFromZoomBar * 1000}`); 
    }
    // ======================== Блок керування мишкою ===============================>
    inputMouseDown(e){
        if(e.buttons === 4 || e.buttons === 3) this.inputStart(e);
    };
    inputMouseMove(e){
        if((e.buttons === 4 || e.buttons === 3) && this.drag.active)this.inputMove(e);
    };
    inputMouseUp(){
      this.inputEnd();
    };
    // ======================== Блок керування тачпадом ==============================>
    inputTouchStart(e){
        
        if (e.targetTouches.length >= 2) {
            this.inputStart(e.touches[0]) 
            this.startDistance = this.#getTouchDistance(e);
            this.tools = this.toolsMeneger.resetTools();
        }
    };
    inputTouchMove(e){
        if(this.drag.active){
            this.toolsMeneger.resetButtonStyles()        //деактивуємо всі кнопки інструментів

            this.inputMove(e.touches[0])
        };

        if (e.targetTouches.length >= 2){
            this.currentDistance = this.#getTouchDistance(e);
            const scale = this.startDistance / this.currentDistance;

                this.zoom *= scale;
        
            this.zoom = this.#clampZoom(this.zoom);
            this.getIndicatorZoom(this.zoom)
            this.startDistance = this.currentDistance;

            // Обчислюємо кут повороту
            this.angle = this.#getTouchAngle(e);

           
        } 
    };
    inputTouchEnd(e){
        this.inputEnd();       
        this.currentDistance = null;
    };

    inputStart(e){
        this.drag.active = true;
        this.drag.start  = this.getPoint(e); 
    };
    inputMove(e){
        this.drag.end    = this.getPoint(e); 
        const result     = utils.operate(this.drag.end, '-', this.drag.start)
        this.drag.offset = new Point(result);
    };
    inputEnd(){
        const result = utils.operate(this.offset, '+', this.drag.offset)
        this.offset  = new Point(result);
        this.drag    = {start:  this.point,
                        end:    this.point,
                        offset: this.point,
                        active: false};
    };

    
    // функція отримання точки
    getPoint(e, {subtractDragOffset = false} = {}){
        let centerX = null;
        let centerY = null;
           if (e.touches && e.touches.length >= 2) {
            
               // Знаходимо середню точку між двома дотиками
               centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
               centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
           } else{
               centerX = e.pageX;
               centerY = e.pageY;
           }
              
           
           const rotatedX = (centerX - this.coordinatesCentre.x) ;
           const rotatedY = (centerY - this.coordinatesCentre.y);
           // Повертаємо зміщення відносно кута повороту
           const x1 = rotatedX * Math.cos(this.angle) + rotatedY * Math.sin(this.angle);
           const y1 = -rotatedX * Math.sin(this.angle) + rotatedY * Math.cos(this.angle);
       
           // Повертаємо зміщення відносно кута повороту
           const x = (x1) * this.zoom - this.offset.x;
           const y = (y1)  * this.zoom - this.offset.y;
           const coordinates = { x, y };
          
           const point     = new Point(coordinates, {...this.tools});
           const result    = utils.operate(point, '-', this.drag.offset);
           const dragPoint = new Point(result, {...this.tools}); 
           return subtractDragOffset ? dragPoint : point;
    };
    // повертає значення зміщення
    getPointOffset(){
        const result  = utils.operate(this.offset, '+', this.drag.offset)
        return  new Point(result)
    };
    // отримання відстанні за допомогою двох точок дотику
    #getTouchDistance(e){
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        return Math.hypot(dy, dx)
    };
    // Отримання кута повороту за допомогою двох точок дотику
    #getTouchAngle(e) {
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) * .1;
        return angle;
    };
    // інтервал обмеження 
    #clampZoom(zoom) {
        return  Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    };

    draw(ctx){
        ctx.restore();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.translate(this.coordinatesCentre.x, this.coordinatesCentre.y);
        ctx.scale(1 / this.zoom, 1 / this.zoom);
        // Поворот канвасу
        ctx.rotate(this.angle);
        const offset  = this.getPointOffset();
        ctx.translate(offset.x, offset.y);  
    }
}
