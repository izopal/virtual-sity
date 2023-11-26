
import * as utils       from '../math/utils.js';
import Editor from './editor.js';
import {Point}     from '../primitives/point.js';

export class StopEditor extends Editor {
    constructor(myApp){
        super(myApp, 'stop');
        
        this.intent = null;
        this.disable();
    };
  
    enable(){
        this.addEventListeners()
    };
    disable(){
        this.removeEventListeners()
    };
    removeEventListeners(){
        this.canvas.removeEventListener('mousedown',  this.boundMouseDown);
        this.canvas.removeEventListener('mousemove',  this.boundMouseMove);
        this.canvas.removeEventListener('touchstart', this.boundTouchStart);
        this.canvas.removeEventListener('touchmove',  this.boundTouchMove);
        this.canvas.removeEventListener('contextmenu', this.boundContextMenu)
    };
    addEventListeners(){
        this.boundMouseDown = this.#inputMouseDown.bind(this);
        this.boundMouseMove = this.#inputMouseMove.bind(this);
        this.boundTouchStart = (e) => this.#inputMouseDown(utils.getMouseEventFromTouchEvent(e));
        this.boundTouchMove  = (e) => this.#inputMouseMove(utils.getMouseEventFromTouchEvent(e));
        this.boundContextMenu = (e) => e.preventDefault()

        this.canvas.addEventListener('mousedown',  this.boundMouseDown);
        this.canvas.addEventListener('mousemove',  this.boundMouseMove);
        this.canvas.addEventListener('touchstart', this.boundTouchStart);
        this.canvas.addEventListener('touchmove',  this.boundTouchMove);
        this.canvas.addEventListener('contextmenu', this.boundContextMenu)
    };

    #inputMouseDown(e){

    }
    #inputMouseMove(e){
        super.inputMouseMove(e);
       
         const segment = utils.getNearestSegment(
            this.point, 
            this.graph.segments, 
            this.minDicnance = this.sizeRemove);
           
        if(segment){
            const projectPoint = segment.projectPoint(this.point);
            if(projectPoint.offset > 0 && projectPoint.offset < 1){
            this.intent = new Point(projectPoint.point);
        }else{
            this.intent = null;
            }
        }else{
            this.intent = null;
        }
    };
    
    
    draw(ctx){
        super.draw(ctx)
        if(this.intent) this.intent.draw(ctx)
    };
    
    dispose(){
        super.dispose();
    }
    
}