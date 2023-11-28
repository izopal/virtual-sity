import * as utils       from '../math/utils.js';
import Editor from './editor.js';

import {Segment}   from '../primitives/segment.js';



export class GraphEditor extends Editor{
    constructor(myApp){
        super(myApp, 'graph')
        this.keys         = utils.keys;
        console.table(this.keys);

        this.configPoint    = this.data.primitives.point;
        this.configSegment  = this.data.primitives.segment;
        
        // парметр обєкта який обираємо
        this.lastPoint     = null;
        this.activePoint   = null;
        
        this.counter       = 0;
    };
  
    disable(){
        this.removeEventListeners()
    };
    enable(){
        this.addEventListeners()
    };
   
    removeEventListeners(){
        super.removeEventListeners();
        this.canvas.removeEventListener('mousedown',  this.boundMouseDown);
        this.canvas.removeEventListener('mousemove',  this.boundMouseMove);
        this.canvas.removeEventListener('mouseup',    this.boudMouseUp);
        this.canvas.removeEventListener('touchstart', this.boundTouchStart);
        this.canvas.removeEventListener('touchmove',  this.boundTouchMove);
        this.canvas.removeEventListener('touchend',   this.boundTouchEnd);
    };
    addEventListeners(){
        super.addEventListeners();
        this.boundMouseDown   = this.#inputMouseDown.bind(this);
        this.boundMouseMove   = this.#inputMouseMove.bind(this);
        this.boudMouseUp      = this.#inputMouseUp.bind(this);
        this.boundTouchStart  = (e) => this.#inputMouseDown(utils.getMouseEventFromTouchEvent(e));
        this.boundTouchMove   = (e) => this.#inputMouseMove(utils.getMouseEventFromTouchEvent(e));
        this.boundTouchEnd    = (e) => this.#inputMouseUp(utils.getMouseEventFromTouchEvent(e));
      
        this.canvas.addEventListener('mousedown',  this.boundMouseDown);
        this.canvas.addEventListener('mousemove',  this.boundMouseMove);
        this.canvas.addEventListener('mouseup',    this.boudMouseUp);
        this.canvas.addEventListener('touchstart', this.boundTouchStart);
        this.canvas.addEventListener('touchmove',  this.boundTouchMove);
        this.canvas.addEventListener('touchend',   this.boundTouchEnd);
        
        this.toolsMeneger.allTools.forEach((button) => {
            button.addEventListener('click', () => this.lastPoint = null);
        });
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
        super.inputMouseMove(e);
       
        const isCurveBtnLeft   = this.tools.curve    && e.buttons === 1;
        const isTreeBtnLeft    = this.tools.tree     && e.buttons === 1;
        const isDragingBtnLeft = this.tools.dragging && e.buttons === 1;
        const isRemoveBtnLeft  = this.tools.remove   && e.buttons === 1;
      
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
        super.draw(ctx)
      
        if(this.activePoint ) this.activePoint.draw(ctx, this.configPoint.activePoint);
        
        if(this.lastPoint && this.tools.point){
            this.lastPoint.draw(ctx, this.configPoint.lastPoint);
            new Segment (this.lastPoint, this.point).draw(ctx, this.configSegment.dash);
        };
    };
    drawDebug(ctx){
        super.drawDebug(ctx)
    };

    dispose(){
        super.dispose();    
        this.lastPoint     = null;
        this.activePoint   = null;
    }
}