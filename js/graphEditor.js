import Graph            from './math/graph.js';
import {findObjData, 
        getNearestPoint} from '../js/math/utils.js'
import keys              from '../js/math/utils.js';

const body = document.body;


export default class GraphEditor {
    constructor(canvas, saveInfo){
        this.keys         = keys;
        this.canvas       = canvas;
        console.table(this.keys);
      
        this.vieportData  = findObjData(keys[0]);
        this.pointData    = findObjData(keys[1]);
        this.segmentData  = findObjData(keys[2]);
        this.polygontData = findObjData(keys[3]);

        // 
        this.vieportClas  = this.vieportData.class;
        this.pointClass   = this.pointData.class;
        this.segmentClass = this.segmentData.class;
        this.polygonClass = this.polygontData.class;
        
        
        
        this.minDicnance   = this.pointData.point.radius;
        this.sizeRemove    = this.minDicnance;
        
        // парметр обєкта який обираємо
        this.point         = null;
        this.lastPoint     = null;
        this.activePoint   = null;
        
        // параметри інструментів графічного редагування  
        this.tools          = {dragging: false,        // параметри вкл.-викл. редактора (пересування точок)
                               remove:   false,        // параметр вкл.-викл резинки
                               curve:    false,        // парамет малювання кривої лінії
                               point:    true,         // параметр малювання точки;
                               polygon:  false,        // параметр малювання полігону;
                            };
        this.#addEventListener(canvas);
        // підключаємо необхідні нам класи
        this.graph        = saveInfo ? this.#load(saveInfo) : new Graph();
        this.vieport       = new this.vieportClas(this);
        this.polygon       = new this.polygonClass(this.polygontData, this.graph.points, this.tools);

    };

   #load(saveInfo){
        const points = saveInfo.points.map((point) => new this.pointClass(point.x, point.y, this.pointData,  point.tools));
        const segments    = saveInfo.segments.map((line) => new this.segmentClass(
            points.find(point => point.equals(line.p1)),
            points.find(point => point.equals(line.p2)),
            this.segmentData,
            line.tools));
        return new Graph (points, segments);
        
    }
   
    //  функція вкл обраного інструмента (true) і викл решта неактивних (false)
    setTool(tool) {
        for (const key in this.tools) this.tools[key] = key === tool;
    }

    #addEventListener(canvas){
        body.addEventListener  ('keydown',    this.#inputKeydown.bind(this));
        canvas.addEventListener('mousedown',  this.#inputMouseDown.bind(this));
        canvas.addEventListener('mousemove',  this.#inputMouseMove.bind(this));
        canvas.addEventListener('mouseup',    this.#inputMouseUp.bind(this));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault())
    }
    #inputKeydown(e){
        if(['P', 'p', 'З', 'з'].includes(e.key)) this.setTool('point');
        if(['R', 'r', 'К', 'к'].includes(e.key)) this.setTool('remove');
        if(['D', 'd', 'В', 'в'].includes(e.key)) this.setTool('dragging');
        if(['C', 'c', 'С', 'с'].includes(e.key)) this.setTool('curve');
        if(['=', '+'].includes(e.key)) zoom('plus');
        if(['-', '_'].includes(e.key)) zoom('minus');
        if(e.key === 'Escape') this.lastPoint = null;
    };
    #inputMouseDown(e){
        // умова використання інструменту point
        if(this.tools.point && e.buttons === 1){
            this.point       = this.vieport.getPoint(e, {... this.tools}, {subtractDragOffset: true});
            // провірка якщо вибрали активну точку, вона стає послідньою
            if(this.activePoint){
                this.#addSegment(this.activePoint)
                return                           // при виконнанні умови код дальше не виконється
            };
            this.graph.addPoint(this.point);     // додаємо точку
            this.#addSegment(this.point);        // додаємо лінію 
        };
        if(this.tools.point && e.buttons === 2){
            // this.tools.point = false;
            this.lastPoint = null;
        };
        
        // умова використання інструменту remove
        if(this.tools.remove && e.buttons === 1){
            if(this.activePoint) this.#remove(getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)); 
        };

        // умова використання інструменту dragging
        if(this.tools.dragging && this.activePoint !== null && e.buttons === 1){
            this.activePoint.x = this.point.x;
            this.activePoint.y = this.point.y;
        };
        
        if(this.tools.curve) this.lastPoint = null;
    };
    #inputMouseMove(e){
        this.point       = this.vieport.getPoint(e, {... this.tools}, {subtractDragOffset: true});
        
        // умова використання інструменту curve
        if(this.tools.curve && e.buttons === 1){
            this.graph.addPoint(this.point);
            this.#addSegment(this.point)
        };
        // умова використання інструменту dragging
        if(this.tools.dragging && this.activePoint !== null && e.buttons === 1){
            this.activePoint.x = this.point.x;
            this.activePoint.y = this.point.y;
        }else{
            this.activePoint = getNearestPoint(this.point, this.graph.points, this.minDicnance);
        };
       // умова використання інструменту remove
        if(this.tools.remove && e.buttons === 1){
            if(this.activePoint) this.#remove(getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)); 
        };
    };
    #inputMouseUp(){
        if(this.tools.curve) this.lastPoint = null;
    };

    #addSegment(point){
        const Class    = this.segmentData.class;
        const line     = new Class(this.lastPoint, point, this.segmentData, {... this.tools})
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
        this.vieport.draw(ctx);
        this.graph.draw(ctx);
        // this.polygon.draw(ctx);
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.activePoint) this.activePoint.draw(ctx, {activePoint: true})
        
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.lastPoint && this.tools.point){
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