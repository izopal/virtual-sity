import * as utils  from '../math/utils.js';
import { data }    from "../constants.js";
import { Polygon } from "../primitives/polygon.js";



export class Building{
    constructor(polygon, level = 1){
        this.base        = polygon;
        this.config      = data.world.building;
        this.coefficient = this.config.coefficient * level;
    };

    _generateWalls(viewPoint){
        // створюємо стіни
        const wallPolygons  = [];
        for (let point = 0; point < this.base.points.length; ++point) {
            const nextPoint = (point + 1) % this.base.points.length;
            const wallPoints = [
                this.base.points[point],
                this.base.points[nextPoint],
                this.ceilingPoints[nextPoint],
                this.ceilingPoints[point],
            ];
            const wallPolygon = new Polygon(wallPoints);
            wallPolygons.push(wallPolygon);
        };
        // сортуємо стіни
        wallPolygons.sort((a, b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint))
        return wallPolygons;
    };
    _generateCeilings(viewPoint, zoom){
        // створюємо точки стелі
        const height =  this.coefficient / zoom;
        this.ceilingPoints = this.base.points.map((p) =>
        utils.pointFrom3D(p, viewPoint, height)
        );
        return  new Polygon(this.ceilingPoints);
    };

    draw(ctx, viewPoint, zoom, options = data.world.building) {
        this.config.ceiling = options.ceiling;
        this.config.side    = options.side;

        const ceilingPoints = this._generateCeilings(viewPoint, zoom)
        const wallPolygons  = this._generateWalls(viewPoint);

        this.base.draw(ctx, this.config);
        
        // if(zoom = 4 &&  this.coefficient = ){}
            for (const wallPolygon of wallPolygons) {
                wallPolygon.draw(ctx, this.config.side);
            };

            ceilingPoints.draw(ctx, this.config.ceiling);
        
    };
}

