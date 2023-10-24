import Graph            from './math/graph.js';
import {getAllObj,
        findObjData, 
        getNearestPoint} from '../js/math/utils.js'
import keys              from '../js/math/utils.js';

const body = document.body;


export default class GraphEditor {
    constructor(canvas){
        this.canvas       =  canvas;
        this.keys         = keys;
        console.table(this.keys);
        this.graph        = new Graph();

        this.allObj       = getAllObj();
        this.vieportData  = findObjData(keys[0]);
        this.pointData    = findObjData(keys[1]);
        this.segmentData  = findObjData(keys[2]);

        this.vieportClas  = this.vieportData.class;
        this.vieport      = new this.vieportClas(this)
    
        
        this.minDicnance   = this.pointData.point.radius;
        this.sizeRemove    = this.minDicnance;
        
        // парметр обєкта який обираємо
        this.point         = null;
        this.lastPoint     = null;
        this.activePoint   = null;

        this.pressed       = false;

        // параметри інструментів графічного редагування  
        this.tools          = {dragging: false,        // параметри вкл.-викл. редактора (пересування точок)
                               remove:   false,        // параметр вкл.-викл резинки
                               curve:    false,        // парамет малювання кривої лінії
                               point:    true,        // параметр малювання точки
                            };
        this.#addEventListener(canvas);
    };

   
    //  функція вкл обраного інструмента (true) і викл решта неактивних (false)
    setTool(tool) {
        for (const key in this.tools) this.tools[key] = key === tool;
    }


    #addEventListener(canvas){
        body.addEventListener  ('keydown',    this.#inputKeydown.bind(this));
        // canvas.addEventListener('mousewheel', this.#inputMouseWheel.bind(this));
        canvas.addEventListener('mousedown',  this.#inputMouseDown.bind(this));
        canvas.addEventListener('mousemove',  this.#inputMouseMove.bind(this));
        canvas.addEventListener('mouseup',    this.#inputMouseUp.bind(this));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault() )
    }
    #inputKeydown(e){
        if(['P', 'p', 'З', 'з'].includes(e.key)) this.setTool('point');
        if(['R', 'r', 'К', 'к'].includes(e.key)) this.setTool('remove');
        if(['D', 'd', 'В', 'в'].includes(e.key)) this.setTool('dragging');
        if(['C', 'c', 'С', 'с'].includes(e.key)) this.setTool('curve');
        if(e.key === 'Escape') this.lastPoint = null;
    };
    #inputMouseWheel(e){
        const dir = - Math.sign(e.deltaY);
        const step = .1;
        this.sizeRemove  += dir * step;
        this.siseRemove = Math.max(1, Math.min(10, this.siseRemove));  

        this.widthCurve  += dir * step;     
        this.widthCurve = Math.max(1, Math.min(10, this.widthCurve));  

        this.radiusPoint += dir * step;
        this.radiusPoint = Math.max(1, Math.min(10, this.radiusPoint));  
    };
    #inputMouseDown(e){
        this.pressed = true;
        if(e.buttons == 1 && !Object.values(this.tools).some(Boolean)){
            this.point       = this.vieport.getPoint(e, this.pointData, {paint: false, subtractDragOffset: true});
            // провірка якщо вибрали активну точку, вона стає послідньою
            if(this.activePoint){
                this.#addSegment(this.activePoint)
                return                           // при виконнанні умови код дальше не виконється
            };
            this.graph.addPoint(this.point);     // додаємо точку
            this.#addSegment(this.point);        // додаємо лінію 
        };
        if(e.buttons === 2 && !Object.values(this.tools).some(Boolean)) {
            this.tools.point = false;
            this.lastPoint = null;
        };
        
        // умова видалення точки
        if(this.tools.remove){
            if(this.activePoint) this.#remove(getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)); 
        };

        // умова переміщення точки
        if(this.tools.dragging && this.activePoint !== null){
            this.activePoint.x = this.point.x;
            this.activePoint.y = this.point.y;
        };
        
        if(this.tools.curve) this.lastPoint = null;
    };
    #inputMouseMove(e){
        // умова переміщення точки
        this.tools.point = false;
        this.point       = this.vieport.getPoint(e, this.pointData, {paint: true, subtractDragOffset: true});
        if(this.tools.dragging && this.pressed && this.activePoint !== null){
            this.activePoint.x = this.point.x;
            this.activePoint.y = this.point.y;
        }else{
            // умова промальовки кривої лінії
            this.activePoint = getNearestPoint(this.point, this.graph.points, this.minDicnance);
            if(e.buttons == 1 && this.tools.curve){
                this.graph.addPoint(this.point);
                this.#addSegment(this.point)
            };
        };

        // умова видалення точки
        if(this.tools.remove && this.pressed){
            if(this.activePoint) this.#remove(getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)); 
        };
    };
    #inputMouseUp(){
        this.tools.point = false;
        this.pressed = false;
        this.paint   = false;
        if(this.tools.curve) this.lastPoint = null;
    };

    #addSegment(point){
        const Class    = this.segmentData.class;
        const line     = new Class(this.lastPoint, point, this.segmentData, this.tools)
        if(this.lastPoint) this.graph.addSegment(line);
        this.lastPoint = point;
    }

    #remove(point){
        this.graph.removePoint(point);
        this.graph.removeSegment(point);
        if (this.lastPoint === point) this.lastPoint = null;
        this.activePoint   = null;
    }
    

    draw(ctx){
        this.vieport.draw(ctx)
        this.graph.draw(ctx);
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.activePoint) this.activePoint.draw(ctx, {activePoint: true})
        
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.lastPoint && !Object.values(this.tools).some(Boolean)){
            const Segment    = this.segmentData.class;
            new Segment (this.lastPoint, this.point, this.segmentData).draw(ctx, {dash: true});
            
            this.lastPoint.draw(ctx, {lastPoint: true})
        }
    };

    dispose(){
        this.graph.removeAll();
        this.lastPoint     = null;
        this.activePoint   = null;
    }


}