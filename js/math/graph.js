import * as utils       from './utils.js';

export class Graph{
    constructor(toolsMeneger, data, points = [], sortedPoints = {}, segments = [], sortedSegments = {},){
        this.toolsMeneger   = toolsMeneger;
        this.tools          = this.toolsMeneger.tools.graph;
        this.data           = data;

        this.configPoint    = this.data.primitives.point;
        this.points         = points;
        this.sortedPoints   = sortedPoints;
        

        this.renderRadius = 1000 ;
       
        this.configSegment  = this.data.primitives.segment;
        this.segments       = segments;
        this.polygons       = [];

        this.polygonsBuilding       = [];
        this.polygonsWaterway       = [];
        this.sortedSegments = sortedSegments;

        this.markings = []

        this.filterPointsByTools = this.filterPointsByTools.bind(this);
    };
    // Блок додавання
    addPoint(point){
        this.sortedPoints = utils.sortObject(point, this.tools, this.sortedPoints)
        this.points.push(point);
    };
    addSegment(line){
        this.sortedSegments = utils.sortObject(line, this.tools, this.sortedSegments);
        this.segments.push(line);
    };
    addPolygon(polygon){
        this.polygons.push(polygon);
    }
 
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
        
    draw(ctx, viewPoint, zoom){
        const points               = this.sortedPoints.point || []
        
        const allToolFalse =  Object.values(this.tools).every(value => value === false);
        const segments = this.segments.filter(i => i.distanceToPoint(viewPoint) < this.renderRadius * zoom);
        for(const seg of segments){
            if(allToolFalse)    {seg.draw(ctx, this.data.openStreetMap.line)}
            if(seg.tools.point) {seg.draw(ctx, this.configSegment.line)};
            if(seg.tools.curve) {seg.draw(ctx, this.configSegment.curve)};
        };
        
        const optionsBuilding = {
            lineWidth  : 1,
            fill       : 'red',
            colorStroke: '',
            globalAlpha: .6,
        };
        for(const polygon of this.polygonsBuilding) polygon.draw(ctx, optionsBuilding);

        const optionsWaterways = {
            lineWidth  : 1,
            fill       : 'green',
            colorStroke: '',
            globalAlpha: .4,
        };
        for(const polygon of this.polygonsWaterway) polygon.draw(ctx, optionsWaterways)
        
        for(const point of points) {point.draw(ctx, this.configPoint.point)};
    };
    removeAll(){
        this.points         = [];
        this.segments       = [];
        this.polygons       = [];
        this.polygonsBuilding       = [];
        this.polygonsWaterway       = [];
    }
}