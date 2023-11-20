import * as utils       from './math/utils.js';

import {Graph}     from './math/graph.js';
import {Vieport}   from './vieport.js';
import {Point}     from './primitives/point.js';
import {Segment}   from './primitives/segment.js';

import {World}  from './world.js';

const body               = document.body;

export class GraphEditor {
    constructor(canvas, saveInfo,  toolsMeneger, data){
        this.keys         = utils.keys;
        console.table(this.keys);

        this.canvas       = canvas;

        // параметри інструментів графічного редагування  
        this.toolsMeneger          = toolsMeneger;
        this.tools                 = this.toolsMeneger.tools.graph

        this.data           = data;
        this.config         = this.data.graphEditor;
        this.configPoint    = this.data.primitives.point;
        this.configSegment  = this.data.primitives.segment;
        
        this.minDicnance   = this.config.minDistance;                   
        this.sizeRemove    = this.config.sizeRemove;
        
        // парметр обєкта який обираємо
        this.point         = null;
        this.lastPoint     = null;
        this.activePoint   = null;
        
        // підключаємо необхідні нам класи
        this.vieport       = new Vieport(canvas, toolsMeneger, this.data);
        
        this.graph         = !saveInfo ? new Graph(this.tools, this.data) : this.#load(saveInfo);
        this.OldGraphHash  = this.graph.hash();    //параметри запуска малювання 
        this.world         = new World(this.data, this.graph);
        
        this.#removeEventListeren(canvas)
        this.#addEventListener(canvas);
        this.counter       = 0
    };

    #load(saveInfo){
        const points        = saveInfo.points.map((point) => new Point(point, point.tools, point.radius));
       
        const segments    = saveInfo.segments.map((line) => new Segment(
            points.find(point => point.equals(line.p1)),
            points.find(point => point.equals(line.p2)),
            line.tools,
            line.size));
            
        const sortedPoints = {};
        points.forEach((point) => {
            for (const tool in point.tools) {
                if (point.tools[tool]) {
                    sortedPoints[tool] = sortedPoints[tool] || []
                    sortedPoints[tool].push(point);
                };
            };
        });

        const sortedSegments = {};
        for(const key in saveInfo.sortedSegments){
            sortedSegments[key]    = saveInfo.sortedSegments[key].map((line) => new Segment(
                points.find(point => point.equals(line.p1)),
                points.find(point => point.equals(line.p2)),
                line.tools));
        };
        return new Graph (this.tools, this.data, points, sortedPoints, segments, sortedSegments);
    }
    #removeEventListeren(canvas){
        this.toolsMeneger.allTools.forEach((button) => {
            button.removeEventListener('click', this.handleButtonClick);
        });
        
        body.removeEventListener  ('keydown',    this.boudKeydown);
        canvas.removeEventListener('mousedown',  this.boundMouseDown);
        canvas.removeEventListener('mousemove',  this.boundMouseMove);
        canvas.removeEventListener('mouseup',    this.boudMouseUp);
        canvas.removeEventListener('touchstart', this.boundTouchStart);
        canvas.removeEventListener('touchmove',  this.boundTouchMove);
        canvas.removeEventListener('touchend',   this.boundTouchEnd);

        canvas.removeEventListener('contextmenu',  this.boundContextMenu)
    };

    #addEventListener(canvas){
        this.handleButtonClick = () => this.lastPoint = null;
        this.boudKeydown    = this.#inputKeydown.bind(this);
        this.boundMouseDown = this.#inputMouseDown.bind(this);
        this.boundMouseMove = this.#inputMouseMove.bind(this);
        this.boudMouseUp    = this.#inputMouseUp.bind(this);
        this.boundTouchStart = (e) => this.#inputMouseDown(this.getMouseEventFromTouchEvent(e));
        this.boundTouchMove  = (e) => this.#inputMouseMove(this.getMouseEventFromTouchEvent(e));
        this.boundTouchEnd   = (e) => this.#inputMouseUp(this.getMouseEventFromTouchEvent(e));

        this.boundContextMenu = (e) => e.preventDefault()

        
        this.toolsMeneger.allTools.forEach((button) => {
            button.addEventListener('click', this.handleButtonClick);
        });
        
        body.addEventListener  ('keydown',    this.boudKeydown);
        canvas.addEventListener('mousedown',  this.boundMouseDown);
        canvas.addEventListener('mousemove',  this.boundMouseMove);
        canvas.addEventListener('mouseup',    this.boudMouseUp);
        canvas.addEventListener('touchstart', this.boundTouchStart);
        canvas.addEventListener('touchmove',  this.boundTouchMove);
        canvas.addEventListener('touchend',   this.boundTouchEnd);

        canvas.addEventListener('contextmenu', this.boundContextMenu)
    };
   

    getMouseEventFromTouchEvent(e) {
        e.preventDefault()
        if (e.touches && e.touches.length > 0){
          return {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
            buttons: 1,
            touches: true,
          };
        };
        
        if (e.touches && e.touches.length >= 2) return e;
  
        return null;
      }

    #inputKeydown(e){
        if(['D', 'd', 'В', 'в'].includes(e.key)) this.data.debug.state = !this.data.debug.state;
        if(['=', '+'].includes(e.key)) zoom('plus');
        if(['-', '_'].includes(e.key)) zoom('minus');
        if(e.key === 'Escape') this.lastPoint = null;
    };
    #inputMouseDown(e){
        // умови при настику лівої кнопки
        const isBtnLeft   = this.tools.point        || 
                            this.tools.polygon      || 
                            this.tools.city         ||
                            this.tools.road         || 
                            this.tools.tree         || 
                            this.tools.building;
        const isRemoveBtnLeft  = this.tools.remove  && e.buttons === 1;

        this.point = this.vieport.getPoint(e, { subtractDragOffset: true });

        if (isBtnLeft && e.buttons === 1) {
            if (this.activePoint) {
                this.#addSegment(this.activePoint);
                return;
            }
            this.graph.addPoint(this.point);
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

        if(isBtnRight && e.buttons === 2)  this.lastPoint = null;
    };
    #inputMouseMove(e){
        const isCurveBtnLeft   = this.tools.curve    && e.buttons === 1;
        const isTreeBtnLeft    = this.tools.tree     && e.buttons === 1;
        const isDragingBtnLeft = this.tools.dragging && e.buttons === 1;
        const isRemoveBtnLeft  = this.tools.remove   && e.buttons === 1;
      
        this.point       = this.vieport.getPoint(e, {subtractDragOffset: true});
        // умова використання інструменту curve
        if(isCurveBtnLeft ){
            this.#addSegment(this.point);
            this.graph.addPoint(this.point);
        };
        // умова використання інструменту tree
        if(isTreeBtnLeft && this.counter % 3 === 0){
            this.graph.addPoint(this.point);
        }
        ++this.counter;
        
        // умова використання інструменту dragging
        if(isDragingBtnLeft && this.activePoint){
            this.activePoint.x = this.point.x;
            this.activePoint.y = this.point.y;
        }else{
            this.dragingPoints = this.graph.filterPointsByTools('curve');
            this.activePoint = utils.getNearestPoint(this.point, this.dragingPoints, this.minDicnance);
        };
        // умова використання інструменту remove
        if(isRemoveBtnLeft){
            this.removePoint = utils.getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)
            this.#remove(this.removePoint); 
        };
    };
    #inputMouseUp(e){
        const isBtnUp =     this.tools.curve      ||
                            this.tools.tree       || 
                            this.tools.building;
        if(isBtnUp) this.lastPoint = null;
        if(this.tools.dragging) this.activePoint = null;
    };

    #addSegment(point){
        const line       = new Segment(this.lastPoint, point, {...this.tools});
        if(this.lastPoint) this.graph.addSegment(line);          // додаємо лінію
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
        
        const viewPoint = utils.operate(this.vieport.getPointOffset(), '*', -1)
        this.world.draw(ctx, viewPoint, this.vieport.zoom);
        this.graph.draw(ctx);
        
        if(this.activePoint ) this.activePoint.draw(ctx, this.configPoint.activePoint)
        
        if(this.lastPoint && this.tools.point){
            this.lastPoint.draw(ctx, this.configPoint.lastPoint);
            new Segment (this.lastPoint, this.point).draw(ctx, this.configSegment.dash);
        };
        // перевіряємо чи змінилися параметри this в класі Graph
        if(this.OldGraphHash !== this.graph.hash()){
            this.world.generateCity();
            this.OldGraphHash = this.graph.hash()
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