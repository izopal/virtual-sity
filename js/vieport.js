import {operate}         from '../js/math/utils.js'



export default class Vieport{
    constructor(grafEditor){
        this.grafEditor   = grafEditor;
        this.canvas       = this.grafEditor.canvas;

        this.pointData    = this.grafEditor.pointData;
        this.point        = this.grafEditor.pointClass;
        
        this.vieportData  = this.grafEditor.vieportData
        this.scale        = this.vieportData.scale;
        this.zoom         = this.scale.zoom;
        this.step         = this.scale.step;
        this.minZoom      = this.scale.min;
        this.maxZoom      = this.scale.max;

        this.center  = new this.point (this.canvas.width * .5, 
                                 this.canvas.height * .5, 
                                 this.pointData);
        this.offset = operate(this.center, '*', -1);
       
        this.drag   = {start:  new this.point (0, 0, this.pointData),
                       end:    new this.point (0, 0, this.pointData),
                       offset: new this.point (0, 0, this.pointData),
                       active: false};
    
        this.#addEventListener();
    };
   
    #addEventListener(){
        this.canvas.addEventListener('mousewheel', this.#inputMouseWheel.bind(this), {passive: true});
        this.canvas.addEventListener('mousedown',  this.#inputMouseDown.bind(this));
        this.canvas.addEventListener('mousemove',  this.#inputMouseMove.bind(this));
        this.canvas.addEventListener('mouseup',   this.#inputMouseUp.bind(this));
    };
    #inputMouseWheel(e){
        this.dir   = Math.sign(e.deltaY);
        this.zoom += this.dir * this.step;
        this.zoom  = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom))  // вказуємо інтервал в якому буде збільшувати від 1 до 5
    };
    #inputMouseDown(e){
        if(e.buttons === 4 || e.buttons === 3){
            this.drag.active = true;
            this.drag.start  = this.getPoint(e, this.pointData); 
        }
    };
    #inputMouseMove(e){
        if((e.buttons === 4 || e.buttons === 3) && this.drag.active){
            this.drag.end    = this.getPoint(e, this.pointData); 
            this.drag.offset = operate(this.drag.end, '-', this.drag.start);
        }
    };
    #inputMouseUp(){
        this.offset = operate(this.offset, '+', this.drag.offset);
        this.drag   = {start:   new this.point (0, 0, this.pointData),
                       end:    new this.point (0, 0, this.pointData),
                       offset: new this.point (0, 0, this.pointData),
                       active: false};
    }

    getPoint(e, {paint = false, subtractDragOffset = false} = {}){
        this.x       = (e.offsetX - this.center.x) * this.zoom - this.offset.x;
        this.y       = (e.offsetY - this.center.y) * this.zoom - this.offset.y;
        const point  = new this.point (this.x, this.y, this.pointData, {paint});
        return subtractDragOffset ? operate(point, '-', this.drag.offset, {paint}) : point;
    };

    draw(ctx){
        ctx.restore();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.translate(this.center.x, this.center.y);
        ctx.scale(1 / this.zoom, 1 / this.zoom);
        const offset = operate(this.offset, '+', this.drag.offset);
        ctx.translate(offset.x, offset.y);        
    }
}
