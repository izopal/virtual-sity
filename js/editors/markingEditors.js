
import * as utils       from '../math/utils.js';
import Editor           from './editor.js';

import { Stop }             from '../markings/stop.js';
import { Pedestrian }       from '../markings/pedestrian.js';
import { Start }            from '../markings/start.js';
import { TrafficLights }    from '../markings/trafficLights.js';
import { Parking }          from '../markings/parking.js';



const toolIntents = {
    stop: Stop,
    start: Start,
    parking: Parking,
    pedestrian: Pedestrian,
    trafficLights: TrafficLights,
};

export class MarkingEditor extends Editor {
    constructor(myApp){
        super(myApp, 'marking');
        this.config = this.data.markings;
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
        console.log(this.data)
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
        this.toolsHandler();
    };
    toolsHandler(){
        const width = this.data.world.road.width;
       
        for (const [tool, Class] of Object.entries(toolIntents)) {
            if (this.tools[tool]) {
                const parameters = {
                    segments:  tool === 'pedestrian' ? this.graph.segments : this.world.laneGuides, 
                    point:     this.point, 
                    distance:  this.minDicnance, 
                    roadwidth: width,  
                };
                
                this.intent = this.getIntent(Class, parameters);
            }
        }
    }

    getIntent (Class, parameters) {
        const {
            segments    = [],
            point       = {}, 
            distance    = null, 
            roadwidth   = null,  
          } = parameters

        const segment = utils.getNearestSegment(
            point,
            segments,
            distance,
        );
        let intent = null;
        if (segment) {
            const projectPoint = segment.projectPoint(point);
            // console.log(projectPoint)
            if (projectPoint.offset >= 0 && projectPoint.offset <= 1) {

                const parameters = {
                    point:           projectPoint.point,
                    directionVector: segment.directionVector(),
                    width:           roadwidth,
                    key:             Class.name[0].toLowerCase() + Class.name.slice(1),
                };
                
                 intent = new Class(parameters);
            } else {
             intent = null;
             console.log(projectPoint);
            }
        } else {
         intent = null;
        //  console.log(point);
        };
        return intent
    };
    
    
    draw(ctx, viewPoint){
        if(this.intent) this.intent.draw(ctx);
        for(const marking of this.graph.markings) if(marking) marking.draw(ctx);
    };
    drawDebug(ctx, debug){
        if(this.intent) this.intent.drawDebug(ctx, debug);
        for(const marking of this.graph.markings) if(marking) marking.drawDebug(ctx, debug);
    };
    
    dispose(){
        super.dispose();
        this.graph.markings = [];
    }
}