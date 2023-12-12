import * as utils       from './utils.js';
import { Polygon } from '../primitives/polygon.js';

export class Graph{
    constructor(toolsMeneger, data, points = [], sortedPoints = {}, segments = [], sortedSegments = {},){
        this.toolsMeneger   = toolsMeneger;
        this.tools          = this.toolsMeneger.tools.graph;
        this.data           = data;

        this.renderRadius = 1000 ;

        this.configPoint    = this.data.primitives.point;
        this.configSegment  = this.data.primitives.segment;
        this.configPolygon  = this.data.primitives.polygon
        this.points         = points;
        this.segments       = segments;
        this.polygons       = [];
        
        this.sortedPoints   = sortedPoints;
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
  
    hash(){
        return JSON.stringify(this.sortedSegments.city)
    }
        
    draw(ctx, viewPoint, zoom){
        const config = {
            ctx,
            viewPoint,
            zoom
        };
        this._drawPoints(config);
        this._drawSegments(config);
        this._drawPolygons(config);
    };
    _drawPoints(config){
        const points   = this.sortedPoints.point || []
        for(const point of points) {point.draw(config.ctx, this.configPoint.point)};
    };
    _drawSegments(config){
        const segments = this.segments.filter(i => i.distanceToPoint(config.viewPoint) < this.renderRadius * config.zoom);
        for(const seg of segments){
            if(seg.tools.point) {seg.draw(config.ctx, this.configSegment.line)};
            if(seg.tools.curve) {seg.draw(config.ctx, this.configSegment.curve)};
        };
    };
    _drawPolygons(config){
        for(const polygon of this.polygons){
            polygon.draw(config.ctx, this.configPolygon.segment);
            for(const point of polygon.points)    {point.draw(config.ctx, this.configPolygon.point)};
        }
    };

    removeAll(){
        this.points         = [];
        this.segments       = [];
        this.polygons       = [];
    };
    remove(point){
        this._removePoint(point);
        this._removeSegment(point);
        this._removePolygons(point);
    };
    _removePoint(point){
        this.points   = this.points.filter(p => !p.equals(point));
    };
    _removeSegment(point){
        this.segments = this.segments.filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point));  
    };
    _removePolygons(point){
        this.polygons = this.polygons.filter(polygon => polygon.points.length > 1);
        this.polygons = this.polygons.map(polygon => {
            return new Polygon(polygon.points.filter(p => !p.equals(point)));
        });
    };
}