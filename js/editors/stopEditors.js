
import * as utils       from '../math/utils.js';
import Editor           from './editor.js';


import { Stop }         from '../markings/stop.js';

export class StopEditor extends Editor {
    constructor(myApp){
        super(myApp, 'stop');
        
        this.intent = null;
        this.markings = this.world.markings;
    };
  
    enable(){
        this.addEventListeners()
    };
    disable(){
        this.removeEventListeners()
    };
    removeEventListeners(){
        super.removeEventListeners();
        this.canvas.removeEventListener('mousedown',  this.boundMouseDown);
        this.canvas.removeEventListener('mousemove',  this.boundMouseMove);
        this.canvas.removeEventListener('touchstart', this.boundTouchStart);
        this.canvas.removeEventListener('touchmove',  this.boundTouchMove);
    };
    addEventListeners(){
        super.addEventListeners();
        this.boundMouseDown = this.#inputMouseDown.bind(this);
        this.boundMouseMove = this.#inputMouseMove.bind(this);
        this.boundTouchStart = (e) => this.#inputMouseDown(utils.getMouseEventFromTouchEvent(e));
        this.boundTouchMove  = (e) => this.#inputMouseMove(utils.getMouseEventFromTouchEvent(e));

        this.canvas.addEventListener('mousedown',  this.boundMouseDown);
        this.canvas.addEventListener('mousemove',  this.boundMouseMove);
        this.canvas.addEventListener('touchstart', this.boundTouchStart);
        this.canvas.addEventListener('touchmove',  this.boundTouchMove);
    };

    #inputMouseDown(e){
        super.inputMouseDown(e);
        const isBtnLeft   = this.tools.stop;
        if(isBtnLeft && e.buttons === 1){
            this.markings.push(this.intent);
            this.intent = null;
        };
        // Gfhf
        if(this.tools.remove && e.buttons === 1){
            for(let i = 0; i < this.markings.length; ++i){
                const polygon = this.markings[i].polygon;
                //визначаємо чи точка знаходиться всередині полігона
                if(polygon.containsPoint(this.point)){
                    this.markings.splice(i, 1);
                    return;
                }
            }
        }
    };

    #inputMouseMove(e){
        super.inputMouseMove(e);
      
        if(this.tools.stop){
            const segment = utils.getNearestSegment(
                this.point, 
                this.world.laneGuides, 
                this.minDicnance = this.sizeRemove);
               
            if(segment){
                const projectPoint = segment.projectPoint(this.point);
                if(projectPoint.offset > 0 && projectPoint.offset < 1){
                this.intent = new Stop(projectPoint.point, segment.directionVector(), this.data);
            }else{
                this.intent = null;
                }
            }else{
                this.intent = null;
            }
        }
    };
    
    
    draw(ctx){
        super.draw(ctx)
        if(this.intent) this.intent.draw(ctx)
    };
    drawDebug(ctx){
        super.drawDebug(ctx);
        if(this.intent) this.intent.drawDebug(ctx);
    };
    
    dispose(){
        super.dispose();
    }
}