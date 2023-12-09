import * as utils  from '../math/utils.js';
import { data }    from "../constants.js";
import { Polygon } from "../primitives/polygon.js";



export class Building{
    constructor(polygon){
        this.base        = polygon;
        this.config      = data.world.building
        this.coefficient = this.config.coefficient;
    };
    generate(){
        
    }
   
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






// function getFake3dPoint(point, viewPoint, height) {
//     const dir = normalize(subtract(point, viewPoint));
//     const dist = distance(point, viewPoint);
//     const scaler = Math.atan(dist / 300) / (Math.PI / 2);
//     return add(point, scale(dir, height * scaler));
//  }
 
//     draw(ctx, viewPoint) {
//        const topPoints = this.base.points.map((p) =>
//           getFake3dPoint(p, viewPoint, this.height * 0.6)
//        );
//        const ceiling = new Polygon(topPoints);
 
      
 
//        const baseMidpoints = [
//           average(this.base.points[0], this.base.points[1]),
//           average(this.base.points[2], this.base.points[3])
//        ];
 
//        const topMidpoints = baseMidpoints.map((p) =>
//           getFake3dPoint(p, viewPoint, this.height)
//        );
 
//        const roofPolys = [
//           new Polygon([
//              ceiling.points[0], ceiling.points[3],
//              topMidpoints[1], topMidpoints[0]
//           ]),
//           new Polygon([
//              ceiling.points[2], ceiling.points[1],
//              topMidpoints[0], topMidpoints[1]
//           ])
//        ];
//        roofPolys.sort(
//           (a, b) =>
//              b.distanceToPoint(viewPoint) -
//              a.distanceToPoint(viewPoint)
//        );
 
//        this.base.draw(ctx, { fill: "white", stroke: "rgba(0,0,0,0.2)", lineWidth: 20 });
//        for (const side of sides) {
//           side.draw(ctx, { fill: "white", stroke: "#AAA" });
//        }
//        ceiling.draw(ctx, { fill: "white", stroke: "white", lineWidth: 6 });
//        for (const poly of roofPolys) {
//           poly.draw(ctx, { fill: "#D44", stroke: "#C44", lineWidth: 8, join: "round" });
//        }
//     }
