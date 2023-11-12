import * as utils  from '../math/utils.js';
import { data }    from "../constants.js";
import { Polygon } from "../primitives/polygon.js";



export class Building{
    constructor(polygon){
        this.base        = polygon;
        this.config      = data.world.building
        this.coefficient = this.config.coefficient;
    };
   
    draw(ctx, viewPoint, zoom){
        const height =  this.coefficient / zoom;
        const pointsFromCeiling = [];
        // створюємо стелю
        for (const point of this.base.points) {
            const newPoint = utils.pointFrom3D(point, viewPoint, height);
            pointsFromCeiling.push(newPoint);
        }
        const ceiling  = new Polygon(pointsFromCeiling);

        // створюємо стіни
        const sides = [];
        for(let point = 0; point < this.base.points.length; ++point){
            const nextPoint = (point + 1) % this.base.points.length;
            const pointsFromSide = [
                this.base.points[point],
                this.base.points[nextPoint],
                pointsFromCeiling[nextPoint],
                pointsFromCeiling[point],
            ];
            const side = new Polygon(pointsFromSide);
            sides.push(side);
        }
        // сортуємо сітни    
        sides.sort((a, b) => b.distanceToPoint(viewPoint) - a.distanceToPoint(viewPoint))


        this.base.draw(ctx, this.config);
        for(const side of sides) {side.draw(ctx, this.config.side)};
        ceiling.draw(ctx, this.config.ceiling);
    }
}