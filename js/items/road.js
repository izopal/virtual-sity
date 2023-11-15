import {data}      from '../constants.js';
import { Envelope } from '../primitives/envelope.js';
import { Polygon }  from '../primitives/polygon.js';

export class Road {
    constructor(segments = {}, points = {}, tool) {
        this.config = data.world.road

        this.points   = points;
        this.segments = segments;
        this.tool     = tool;

        this.generate(tool)
    };
    
    generate(tool){
        this.lines   = this.segments[tool] || []
        this.markers = this.points[tool]   || []
      
        this.layers  = this.lines.map(segment => new Envelope(segment, this.config)) || [];
        this.borders = Polygon.union(this.layers.map(road => road.polygon))          || [];
    }
    
    
    draw(ctx){
        for(const layer  of this.layers)   {layer.draw(ctx,  this.config)};
        for(const line   of this.lines)    {line.draw(ctx,   this.config.dash)};
        for(const border of this.borders)  {border.draw(ctx, this.config.border)}; 
        for(const marker of this.markers ) {marker.draw(ctx, this.config.point)};
    }
}