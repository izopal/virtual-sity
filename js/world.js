import {findObjData} from './math/utils.js'
import {Envelope}  from './primitives/envelope.js';



export class World{
    constructor(graph){
        this.graph = graph;
        this.sortedSegments = this.graph.sortedSegments;
        this.envelop  = new Envelope()
        this.envelops = [];
        
        this.generate();
        
    };
    generate(){
        this.segmentsRoad = this.sortedSegments.road || [];
        this.envelops.length = 0;
        for(const segment of this.segmentsRoad){
            this.envelops.push(new Envelope(segment))
        }
    };
    remove(){
        this.envelop.remove()
        this.envelops = [];
    }
    draw(ctx){
        for(const env of this.envelops) env.draw(ctx);
    };
}