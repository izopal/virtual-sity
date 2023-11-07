import * as utils  from './math/utils.js';
import { data }    from './constants.js';

import {Graph}     from './math/graph.js';
import {Vieport}   from './vieport.js';
import {Point}     from './primitives/point.js';
import {Segment}   from './primitives/segment.js';

import {World}  from './world.js';

const canvas               = document.canvas;

export class GraphEditor {
    constructor(canvas, saveInfo){
        this.keys         = utils.keys;
        console.table(this.keys);

        this.canvas       = canvas;

        this.config         = data.graphEditor;
        this.configPoint    = data.primitives.point;
        this.configSegment  = data.primitives.segment;
        
        this.minDicnance   = this.config.minDistance;                   
        this.sizeRemove    = this.config.sizeRemove;
        
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
                               tree:     false,        // параметр малювання дерев;
                               building: false,        // параметр малювання будинків;
                               city:     false,        // параметр малювання міста;
                            };
        this.#addEventListener(canvas);
        // підключаємо необхідні нам класи
        this.vieport       = new Vieport(canvas, saveInfo);
        this.graph         = !saveInfo ? new Graph() : this.#load(saveInfo);
      
        this.world         = new World(this.graph);

        this.OldGraphHash  = this.graph.hash();    //параметри запуска малювання 
        this.counter = 0
    };

    #load(saveInfo){
        const points        = saveInfo.points.map((point) => new Point(point, point.tools));
       
        const segments    = saveInfo.segments.map((line) => new Segment(
            points.find(point => point.equals(line.p1)),
            points.find(point => point.equals(line.p2)),
            line.tools));
            
        const sortedPoints = {};
        points.forEach((point) => {
            for (const tool in point.tools) {
                if (point.tools[tool]) {
                    sortedPoints[tool] = sortedPoints[tool] || []
                    sortedPoints[tool].push(point);
                };
            }
        });

        const sortedSegments = {};
        for(const key in saveInfo.sortedSegments){
            sortedSegments[key]    = saveInfo.sortedSegments[key].map((line) => new Segment(
                points.find(point => point.equals(line.p1)),
                points.find(point => point.equals(line.p2)),
                line.tools));
        };
        return new Graph (points, sortedPoints, segments, sortedSegments);
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
        canvas.addEventListener  ('keydown',    this.#inputKeydown.bind(this));
        canvas.addEventListener('mousedown',  this.#inputMouseDown.bind(this));
        canvas.addEventListener('mousemove',  this.#inputMouseMove.bind(this));
        canvas.addEventListener('mouseup',    this.#inputMouseUp.bind(this));

        canvas.addEventListener('touchstart', (e) => this.#inputMouseDown(this.getMouseEventFromTouchEvent(e)));
        canvas.addEventListener('touchmove',  (e) => this.#inputMouseMove(this.getMouseEventFromTouchEvent(e)));
        canvas.addEventListener('touchend',   (e) => this.#inputMouseUp(this.getMouseEventFromTouchEvent(e)));

        canvas.addEventListener('contextmenu', (e) => e.preventDefault())
    };

    getMouseEventFromTouchEvent(e) {
        if (e.touches && e.touches.length > 0) {
          return {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
            buttons: 1,
            touches: true,
          };
        }
        return null;
      }

    #inputKeydown(e){
        if(['P', 'p', 'З', 'з'].includes(e.key)) this.setTool('point');
        if(['R', 'r', 'К', 'к'].includes(e.key)) this.setTool('remove');
        if(['D', 'd', 'В', 'в'].includes(e.key)) this.setTool('dragging');
        if(['C', 'c', 'С', 'с'].includes(e.key)) this.setTool('curve');
        if(['D', 'd', 'В', 'в'].includes(e.key)) data.debug.state = !data.debug.state;
        if(['=', '+'].includes(e.key)) zoom('plus');
        if(['-', '_'].includes(e.key)) zoom('minus');
        if(e.key === 'Escape') this.lastPoint = null;
    };
    #inputMouseDown(e){
        // умлви при настику лівої кнопки
        const isBtnLeft   = this.tools.point        || 
                            this.tools.polygon      || 
                            this.tools.road         || 
                            this.tools.tree         || 
                            this.tools.building     ||
                            this.tools.city;
        
        const isRemoveBtnLeft  = this.tools.remove  && e.buttons === 1;
    
        if (isBtnLeft && e.buttons === 1) {
            this.point = this.vieport.getPoint(e, { ...this.tools }, { subtractDragOffset: true });
            if (this.activePoint) {
                this.#addSegment(this.activePoint);
                return;
            }
            this.graph.addPoint(this.point, { ...this.tools });
            this.#addSegment(this.point);
        };
        // умова видалення точки
        if(isRemoveBtnLeft){
            this.removePoint = utils.getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)
            if(this.activePoint) this.#remove(this.removePoint); 
        };
        
        // умови при натиску правої кнопки
        const isBtnRight  = this.tools.point        || 
                            this.tools.road         || 
                            this.tools.city;

        if(isBtnRight && e.buttons   === 2) this.lastPoint = null;
    };

    #inputMouseMove(e){
        const isCurveBtnLeft   = this.tools.curve    && e.buttons === 1;
        const isTreeBtnLeft    = this.tools.tree     && e.buttons === 1;
        const isDragingBtnLeft = this.tools.dragging && e.buttons === 1;
        const isRemoveBtnLeft  = this.tools.remove   && e.buttons === 1;

        this.point       = this.vieport.getPoint(e, {...this.tools}, {subtractDragOffset: true});
        // умова використання інструменту curve
        if(isCurveBtnLeft){
            this.#addSegment(this.point);
            this.graph.addPoint(this.point, {...this.tools});
        };
        // умова використання інструменту tree
        if(isTreeBtnLeft && this.counter % 20 === 0){
            this.graph.addPoint(this.point, {...this.tools});
        }
        ++this.counter;
        
        // умова використання інструменту dragging
        if(isDragingBtnLeft && this.activePoint){
            this.activePoint.x = this.point.x;
            console.log(this.point, this.activePoint)
            this.activePoint.y = this.point.y;
        }else{
            this.activePoint = utils.getNearestPoint(this.point, this.graph.points, this.minDicnance);
        };
       // умова використання інструменту remove
        if(isRemoveBtnLeft){
            this.removePoint = utils.getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)
            if(this.activePoint) this.#remove(this.removePoint); 
        };
    };
    #inputMouseUp(e){
        if(this.tools.curve) this.lastPoint = null;
    };

    #addSegment(point){
        const line       = new Segment(this.lastPoint, point, {...this.tools});
        if(this.lastPoint) this.graph.addSegment(line, {...this.tools});          // додаємо лінію
        this.lastPoint   = point;
    }
    #remove(point){
        this.graph.remove(point);
        this.world.remove(point);

        if (this.lastPoint === point) this.lastPoint = null;
        this.activePoint   = null;
    }
    draw(ctx){
        this.vieport.draw(ctx);
        // перевіряємо чи змінилися параметри this в класі Graph
        if(this.OldGraphHash !== this.graph.hash()){
            this.world.generateCity();
            this.OldGraphHash = this.graph.hash()
        }
        // this.world.generate();
       
        const viewPoint = utils.operate(this.vieport.getOfFset(), '*', -1)
        this.world.draw(ctx, viewPoint, this.vieport.zoom);
        this.graph.draw(ctx);

        if(this.activePoint) this.activePoint.draw(ctx, this.configPoint.activePoint)
        
        if(this.lastPoint && this.tools.point){
            this.lastPoint.draw(ctx, this.configPoint.lastPoint);
            new Segment (this.lastPoint, this.point).draw(ctx, this.configSegment.dash);
        }
    };


    dispose(){
        this.world.removeAll();
        this.graph.removeAll();
        this.lastPoint     = null;
        this.activePoint   = null;
        for (const key in this.tools) this.tools[key] = false;
    }


}