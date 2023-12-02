
import * as utils       from '../math/utils.js';
import Editor           from './editor.js';


import { Stop }             from '../markings/stop.js';
import { Pedestrian }       from '../markings/pedestrian.js';
import { Start }            from '../markings/start.js';
import { TrafficLights }    from '../markings/trafficLights.js';
import { Parking }          from '../markings/parking.js';

export class MarkingEditor extends Editor {
    constructor(myApp){
        super(myApp, 'marking');
        
        this.intent = null;
    
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
        this.canvas.removeEventListener('touchend',   this.boundTouchStart);
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
        // this.canvas.addEventListener('touchstart', this.boundTouchStart);
        this.canvas.addEventListener('touchend',  this.boundTouchStart);
        this.canvas.addEventListener('touchmove',  this.boundTouchMove);
    };

    #inputMouseDown(e){
        
        this.graph.markings.push(this.intent);
        this.intent = null;

        // параметри видалення 
        if(this.tools.remove ){
            for(let i = 0; i < this.graph.markings.length; ++i){
                const polygon = this.graph.markings[i].polygon;
                //визначаємо чи точка знаходиться всередині полігона
                if(polygon.containsPoint(this.point)){
                    this.graph.markings.splice(i, 1);
                    return;
                }
            }
        }
    };

    #inputMouseMove(e) {
        super.inputMouseMove(e);
        if (this.tools.stop)          this.getIntent(this.world.laneGuides,     Stop);
        if (this.tools.start)         this.getIntent(this.world.laneGuides,     Start);
        if (this.tools.parking)       this.getIntent(this.world.laneGuides,     Parking);
        if (this.tools.pedestrian)    this.getIntent(this.world.graph.segments, Pedestrian);
        if (this.tools.trafficLights) this.getIntent(this.world.laneGuides,     TrafficLights);
    };

    getIntent (segments, Class) {
        const segment = utils.getNearestSegment(
            this.point,
            segments,
            this.minDicnance = this.sizeRemove
        );

        if (segment) {
            const projectPoint = segment.projectPoint(this.point);
            if (projectPoint.offset > 0 && projectPoint.offset < 1) {

                const parameters = {
                    point:           projectPoint.point,
                    directionVector: segment.directionVector(),
                    data:            this.data,
                    key:             Class.name[0].toLowerCase() + Class.name.slice(1),
                };
                
                this.intent = new Class(parameters);
            } else {
                this.intent = null;
            }
        } else {
            this.intent = null;
        };
        return this.intent
    };
    
    
    draw(ctx){
        
        super.draw(ctx);
        if(this.intent) this.intent.draw(ctx);
        for(const marking of this.graph.markings) if(marking) marking.draw(ctx);
    };
    drawDebug(ctx){
        super.drawDebug(ctx);
        if(this.intent) this.intent.drawDebug(ctx);
        for(const marking of this.graph.markings) if(marking) marking.drawDebug(ctx);
    };
    
    dispose(){
        super.dispose();
        this.graph.markings = [];
    }
}