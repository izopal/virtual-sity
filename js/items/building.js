import { data } from "../constants.js";
export class Building{
    constructor(polygon){
        this.base = polygon;
        this.config = data.world.building

    };
    draw(ctx, viewPoint){

    }
}