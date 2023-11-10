import * as utils  from './math/utils.js';
import { data }    from './constants.js';
import {Point}     from './primitives/point.js';



export class Vieport{
    constructor(canvas){
        this.canvas       = canvas;
        this.config       = data.vieport;
        this.configScale        = this.config.scale;
        this.zoom         = utils.getValidValue(this.configScale.zoom, 0);
        this.step         = utils.getValidValue(this.configScale.step, 0);
        this.minZoom      = utils.getValidValue(this.configScale.min, 0);
        this.maxZoom      = utils.getValidValue(this.configScale.max, 0);

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

        this.touchInProgress = false;
        this.startDistance  = null;
        this.currentDistance = null;
    
        this.#addEventListener();
        
        this.flag  = false;
        this.touchStartTime  = null;
        this.touchEndTime    = null;
    };
  

    #addEventListener(){
        this.canvas.addEventListener('wheel',      this.#inputMouseWheel.bind(this), {passive: true});
        this.canvas.addEventListener('mousedown',  this.#inputMouseDown.bind(this));
        this.canvas.addEventListener('mousemove',  this.#inputMouseMove.bind(this));
        this.canvas.addEventListener('mouseup',    this.#inputMouseUp.bind(this));

        this.canvas.addEventListener('gesturestart', this.#inputTouchStart.bind(this), { passive: true });
        this.canvas.addEventListener('touchmove',  this.#inputTouchMove.bind(this), { passive: true });
        this.canvas.addEventListener('touchend',   this.#inputTouchEnd.bind(this), { passive: true });
    };
    #inputMouseWheel(e){
        this.dir   = Math.sign(e.deltaY);
        this.zoom += this.dir * this.step;
        this.zoom  = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom))  // вказуємо інтервал в якому буде збільшувати від 1 до 5
        return this.zoom
    };
    #inputMouseDown(e){
        if(e.buttons === 4 || e.buttons === 3){
            this.drag.active = true;
            this.drag.start  = this.getPoint(e); 
        }
    };
    #inputMouseMove(e){
        if((e.buttons === 4 || e.buttons === 3) && this.drag.active){
            this.drag.end    = this.getPoint(e); 
            const result     = utils.operate(this.drag.end, '-', this.drag.start)
            this.drag.offset = new Point(result);
        }
    };
    #inputMouseUp(){
        const result = utils.operate(this.offset, '+', this.drag.offset)
        this.offset  = new Point(result);
        this.drag    = {start:  this.point,
                        end:    this.point,
                        offset: this.point,
                        active: false};
    };

    #inputTouchStart(e) {
        // e.preventDefault()
        if (e.targetTouches.length >= 2) {
            this.startDistance = this.#getTouchDistance (e);
        }
    };
    #inputTouchMove(e) {
        if (e.targetTouches.length >= 2) {
            this.currentDistance = this.#getTouchDistance (e);
            const scale = this.currentDistance / this.startDistance || 1;
            
            this.zoom *= scale;
            this.zoom = this.#clampZoom();
            
        }
        return this.zoom  
    }   
    #inputTouchEnd(e) {
        this.startDistance = this.currentDistance;
    }

    #getTouchDistance(e){
        const dx = e.touches[0].pageX - e.touches[1].pageX;
        const dy = e.touches[0].pageY - e.touches[1].pageY;
        return Math.hypot(dy, dx)
    };
    #clampZoom() {
        return Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
    }

    loadPoint(saveInfo){
        return saveInfo.points.map((point) => new Point(point, point.tools));
    };

    getPoint(e, tools, {subtractDragOffset = false} = {}){
        const coordinates = {x: (e.pageX - this.coordinatesCentre.x) * this.zoom - this.offset.x,
                             y: (e.pageY - this.coordinatesCentre.y) * this.zoom - this.offset.y};
       
        const point     = new Point(coordinates, tools);
        const result    = utils.operate(point, '-', this.drag.offset);
        const dragPoint = new Point(result, tools); 
        return subtractDragOffset ? dragPoint : point;
    };
    // повертає значення зміщення
    getOfFset(){
        const result  = utils.operate(this.offset, '+', this.drag.offset)
        return  new Point(result)
    }

    draw(ctx){
        ctx.restore();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.translate(this.coordinatesCentre.x, this.coordinatesCentre.y);
        ctx.scale(1 / this.zoom, 1 / this.zoom);

        const offset  = this.getOfFset();
        ctx.translate(offset.x, offset.y);  
        
    }
}
