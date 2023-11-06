import { Envelope } from '../primitives/envelope.js';
import { Polygon }  from '../primitives/polygon.js';

export class Road {
    constructor(segments = [], points = [], config = {}) {
        this.config = config;
        this.generate(segments, points)
    }

    generate(segments, points) {
        this.roadLayers  = segments.map(segment => new Envelope(segment, this.config)),
        this.roadBorders = Polygon.union(this.roadLayers.map(road => road.polygon)),
        this.roadDash    = segments,
        this.roadPoints  = points;
    }
    
    draw(ctx, config){
        for(const layer    of this.roadLayers)   {layer.draw(ctx,   config)};
        for(const border   of this.roadBorders)  {border.draw(ctx,  config.border)}; 
        for(const point    of this.roadPoints )  {point.draw(ctx,   config.point)};
        for(const segment  of this.roadDash)     {segment.draw(ctx, config.dash)};
    }
}