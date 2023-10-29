import {findObjData, getNearestPoint} from '../js/math/utils.js'
import keys              from '../js/math/utils.js';

import {Graph}    from './math/graph.js';
import {Vieport}  from './vieport.js';
import {Point}  from './primitives/point.js';
import {Segment}  from './primitives/segment.js';
import { Polygon } from './primitives/polygon.js';

import {World}  from './world.js';

const body               = document.body;

export class GraphEditor {
    constructor(canvas, saveInfo){
        this.keys         = keys;
        this.data         = findObjData('graphEditor');
        this.canvas       = canvas;
        console.table(this.keys);
        
        this.minDicnance   = this.data.minDistance;                   
        this.sizeRemove    = this.data.sizeRemove;
        
        // парметр обєкта який обираємо
        this.point         = null;
        this.lastPoint     = null;
        this.activePoint   = null;
        
        // параметри інструментів графічного редагування  
        this.tools          = {dragging: false,        // параметри вкл.-викл. редактора (пересування точок)
                               remove:   false,        // параметр вкл.-викл резинки
                               curve:    false,        // парамет малювання кривої лінії
                               point:    false,        // параметр малювання точки;
                               polygon:  false,        // параметр малювання полігону;
                               road:     false,        // параметр малювання дороги;
                            };
        this.#addEventListener(canvas);
        // підключаємо необхідні нам класи
        this.vieport       = new Vieport(canvas, saveInfo);
        this.graph         = !saveInfo ? new Graph() : this.#load(saveInfo);
        this.world         = new World(this.graph);
       
    };

   #load(saveInfo){
        const points      = saveInfo.points.map((point) => new Point(point, point.tools));
        const segments    = saveInfo.segments.map((line) => new Segment(
            points.find(point => point.equals(line.p1)),
            points.find(point => point.equals(line.p2)),
            line.tools));
        return new Graph (points, segments);
    }
   
    //  функція вкл обраного інструмента (true) і викл решта неактивних (false)
    setTool(tool) {
        // console.log('__________________________')
        for (const key in this.tools) {
            this.tools[key] = key === tool ? !this.tools[key] : false
            // console.log(tool, key, this.tools[key])
        };
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
        if((this.tools.point || this.tools.road || this.tools.polygon) && e.buttons === 1){
            this.point       = this.vieport.getPoint(e, {...this.tools}, {subtractDragOffset: true});
            // провірка якщо вибрали активну точку, вона стає послідньою
            if(this.activePoint ){
                this.#addSegment(this.activePoint)
                return                           // при виконнанні умови код дальше не виконється
            };
            this.graph.addPoint(this.point, {...this.tools});     // додаємо точку
            this.#addSegment(this.point);        // додаємо лінію         
        };
        if((this.tools.point || this.tools.road) && e.buttons === 2) this.lastPoint = null;
        if((this.tools.polygon) && e.buttons === 2) this.lastPoint = null;


        // умова використання інструменту remove
        if(this.tools.remove && e.buttons === 1){
            this.removePoint = getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove);
            if(this.activePoint) this.#remove(this.removePoint); 
        };
        // умова використання інструменту dragging
        if(this.tools.dragging && this.activePoint !== null && e.buttons === 1){
            this.activePoint.x = this.point.x;
            this.activePoint.y = this.point.y;
        };
        // 
        if(this.tools.curve) this.lastPoint = null;
    };
    #inputMouseMove(e){
        this.point       = this.vieport.getPoint(e, {...this.tools}, {subtractDragOffset: true});
        // умова використання інструменту curve
        if(this.tools.curve && e.buttons === 1){
            this.graph.addPoint(this.point, {...this.tools});
            this.#addSegment(this.point);
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
            this.removePoint = getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)
            if(this.activePoint) this.#remove(this.removePoint); 
        };
    };
    #inputMouseUp(){
        if(this.tools.curve) this.lastPoint = null;
    };

    #addSegment(point){
        const line       = new Segment(this.lastPoint, point, {... this.tools});
        if(this.lastPoint) this.graph.addSegment(line, {... this.tools});          // додаємо лінію
        this.lastPoint   = point;
    }
    #remove(point){
        this.world.remove();
        this.graph.removePoint(point);
        this.graph.removeSegment(point);
        if (this.lastPoint === point) this.lastPoint = null;
        this.activePoint   = null;
    }
    

    draw(ctx){

        this.pointsPolygon = this.graph.sortedPoints.polygon || [];
        this.vieport.draw(ctx);
      
        
        this.world.generate();
        this.world.draw(ctx);
        
        this.graph.draw(ctx);

        new Polygon(this.pointsPolygon).draw(ctx)
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.activePoint) this.activePoint.draw(ctx, {activePoint: true})
        
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.lastPoint && this.tools.point){
            new Segment (this.lastPoint, this.point).draw(ctx, {dash: true});
            this.lastPoint.draw(ctx, {lastPoint: true})
        }
    };

    dispose(){
        this.world.remove();
        this.graph.removeAll();
        this.lastPoint     = null;
        this.activePoint   = null;
        for (const key in this.tools) this.tools[key] = false;
    }


}