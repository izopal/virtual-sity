// допрацювати !!!!!!!!!!!!!!!!!!!!!!!!!


import * as utils       from '../math/utils.js';
export class Stop{
    constructor(canvas, saveInfo,  toolsMeneger, data){
        this.canvas       = canvas;

        // параметри інструментів графічного редагування  
        this.toolsMeneger          = toolsMeneger;
        this.tools                 = this.toolsMeneger.tools.Stop

        this.data           = data;
        this.config         = this.data.stopEditor;
      
        // підключаємо необхідні нам класи
        this.vieport       = new Vieport(canvas, toolsMeneger, this.data);


        this.removeEventListeren(canvas);
        this.addEventListener(canvas);
    };
    removeEventListeren(canvas){
        
        canvas.removeEventListener('mousedown',  this.boundMouseDown);
        canvas.removeEventListener('mousemove',  this.boundMouseMove);
        canvas.removeEventListener('mouseup',    this.boudMouseUp);
        canvas.removeEventListener('touchstart', this.boundTouchStart, {passive: false});
        canvas.removeEventListener('touchmove',  this.boundTouchMove, {passive: false});
        canvas.removeEventListener('touchend',   this.boundTouchEnd, {passive: false});

        canvas.removeEventListener('contextmenu', this.boundContextMenu)
    };
    addEventListener(canvas){
      
        this.boundMouseDown = this.#inputMouseDown.bind(this);
        this.boundMouseMove = this.#inputMouseMove.bind(this);
        this.boudMouseUp    = this.#inputMouseUp.bind(this);
        this.boundTouchStart = (e) => this.#inputMouseDown(this.getMouseEventFromTouchEvent(e));
        this.boundTouchMove  = (e) => this.#inputMouseMove(this.getMouseEventFromTouchEvent(e));
        this.boundTouchEnd   = (e) => this.#inputMouseUp(this.getMouseEventFromTouchEvent(e));

        this.boundContextMenu = (e) => e.preventDefault()

        
        this.toolsMeneger.allTools.forEach((button) => {
            button.removeEventListener('click', this.handleButtonClick);
            button.addEventListener('click', this.handleButtonClick);
        });
        
        canvas.addEventListener('mousedown',  this.boundMouseDown);
        canvas.addEventListener('mousemove',  this.boundMouseMove);
        canvas.addEventListener('mouseup',    this.boudMouseUp);
        canvas.addEventListener('touchstart', this.boundTouchStart, {passive: true});
        canvas.addEventListener('touchmove',  this.boundTouchMove, {passive: true});
        canvas.addEventListener('touchend',   this.boundTouchEnd, {passive: true});

        canvas.addEventListener('contextmenu', this.boundContextMenu)
    };


    #inputMouseMove(e){
         
      
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
}