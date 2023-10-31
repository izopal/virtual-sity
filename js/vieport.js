import {findObjData, operate}         from '../js/math/utils.js'
import {Point}    from './primitives/point.js';


export class Vieport{
    constructor(canvas){
        this.canvas       = canvas;
        this.vieportData  = findObjData('vieport')
        this.scale        = this.vieportData.scale;
        this.zoom         = this.scale.zoom;
        this.step         = this.scale.step;
        this.minZoom      = this.scale.min;
        this.maxZoom      = this.scale.max;

        this.point             = new Point();
        this.coordinatesCentre = {x: this.canvas.width * .5,
                                  y: this.canvas.height * .5}
        this.center            = new Point(this.coordinatesCentre);

        this.result            = operate(this.center, '*', -1);
        this.offset            = new Point(this.result);
       
        this.drag   = {start:  this.point,
                       end:    this.point,
                       offset: this.point,
                       active: false};
    
        this.#addEventListener();
    };
  

    #addEventListener(){
        this.canvas.addEventListener('mousewheel', this.#inputMouseWheel.bind(this), {passive: true});
        this.canvas.addEventListener('mousedown',  this.#inputMouseDown.bind(this));
        this.canvas.addEventListener('mousemove',  this.#inputMouseMove.bind(this));
        this.canvas.addEventListener('mouseup',    this.#inputMouseUp.bind(this));
    };
    #inputMouseWheel(e){
        this.dir   = Math.sign(e.deltaY);
        this.zoom += this.dir * this.step;
        this.zoom  = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom))  // вказуємо інтервал в якому буде збільшувати від 1 до 5
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
            const result     = operate(this.drag.end, '-', this.drag.start)
            this.drag.offset = new Point(result);
        }
    };
    #inputMouseUp(){
        const result = operate(this.offset, '+', this.drag.offset)
        this.offset  = new Point(result);
        this.drag    = {start:  this.point,
                        end:    this.point,
                        offset: this.point,
                        active: false};
    };

    loadPoint(saveInfo){
        return saveInfo.points.map((point) => new Point(point, point.tools));
    };

    getPoint(e, tools, {subtractDragOffset = false} = {}){
        const coordinates = {x: (e.pageX - this.coordinatesCentre.x) * this.zoom - this.offset.x,
                             y: (e.pageY - this.coordinatesCentre.y) * this.zoom - this.offset.y};
        // console.log(e.offsetX, this.zoom, this.coordinatesCentre.x, this.offset.x)
        const point     = new Point(coordinates, tools);
        const result    = operate(point, '-', this.drag.offset);
        const dragPoint = new Point(result, tools); 
        return subtractDragOffset ? dragPoint : point;
    };

    draw(ctx){
        ctx.restore();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.save();
        ctx.translate(this.coordinatesCentre.x, this.coordinatesCentre.y);
        ctx.scale(1 / this.zoom, 1 / this.zoom);
        const result  = operate(this.offset, '+', this.drag.offset)
        const offset  = new Point(result);
        ctx.translate(offset.x, offset.y);        
    }
}
