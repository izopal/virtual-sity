import * as utils       from './utils.js';

export class Graph{
    constructor(myApp,  points = [], sortedPoints = {}, segments = [], sortedSegments = {},){
        this.myApp          = myApp;
        this.toolsMeneger   = this.myApp.toolsMeneger;
        this.tools          = this.toolsMeneger.tools.graph;
        this.data           = this.myApp.data;

        this.configPoint    = this.data.primitives.point;
        this.points         = points;
        this.sortedPoints   = sortedPoints;
        

        this.renderRadius = 1000 ;
       
        this.configSegment  = this.data.primitives.segment;
        this.segments       = segments;
        this.sortedSegments = sortedSegments;

        this.markings = []

        this.filterPointsByTools = this.filterPointsByTools.bind(this);
    };
    
    addPoint(point){
        this.sortedPoints = utils.sortObject(point, this.tools, this.sortedPoints)
        this.points.push(point);
    };
    // Блок додавання сигменів 
    addSegment(line){
        this.sortedSegments = utils.sortObject(line, this.tools, this.sortedSegments);
        this.segments.push(line);
    };
    filterPointsByTools(...keys) {
        const filterPoints = [...this.points];
        return filterPoints.filter(point => {
            // Перевірка, чи є хоча б один з ключів у властивості tools точки
            return keys.some(key => !point.tools[key]);
        });
    }
    remove(point){
        this.points   = this.points.filter(p => !p.equals(point));
        this.segments = this.segments.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point));  
    };
    // 
    hash(){
        return JSON.stringify(this.sortedSegments.city)
    }
        
    draw(ctx, viewPoint){
      
        const allToolFalse =  Object.values(this.tools).every(value => value === false);
        const segments = this.segments.filter(i => i.distanceToPoint(viewPoint) < this.renderRadius * this.myApp.vieport.zoom  )
        for(const seg of segments){
            if(allToolFalse)    {seg.draw(ctx, this.data.openStreetMap.line)}
            if(seg.tools.point) {seg.draw(ctx, this.configSegment.line)};
            if(seg.tools.curve) {seg.draw(ctx, this.configSegment.curve)};
        }
        const points               = this.sortedPoints.point || []
        for(const point of points) {point.draw(ctx, this.configPoint.point)};
       
    };
    removeAll(){
        this.points         = [];
        this.segments       = [];
    }
}