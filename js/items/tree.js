import * as utils  from '../math/utils.js';
import {data}      from '../constants.js';
import { Polygon } from '../primitives/polygon.js';


export class Tree {
    constructor(center = {}){
        this.center = center;
        this.config      = data.world.tree;
        this.coefficient = this.config.coefficient;
        // параметр коструктору debug
        this.base = this.generate(this.center, this.config.radius.max);
    };

    generate(point, radius){
        return this.#generateTree(point, radius)
    }; 

    // алгоритм створення ялинки
    #generateTree(point, radius){
        const points = [];
        for(let a = 0; a < Math.PI * 2; a += Math.PI / this.config.typOfTree){
            // параметри зупинки обератання гілок
            const stop = Math.cos(((a + this.center.x) * radius * 2) % 17 ) ** 2;
            
            // парамтри вигляду щільності гілок дерева
            const movingRadius = radius * utils.lerp(.4, 1, stop);
            points.push(utils.translateMetod(point, a, movingRadius))
        };
        return new Polygon(points)
    };


    draw(ctx, viewPoint, zoom){
        const height = this.coefficient / zoom;
        const top    = utils.pointFrom3D(this.center, viewPoint, height);

        this.levelCount  = this.config.levelCount;
        for(let level = 0; level < this.levelCount; ++level){
            const t       = level /(this.levelCount - 1);
            const point   = utils.lerp2D(this.center, top, t);
            const color   = "rgb(30, "+ utils.lerp(50, 200, t) +", .7)";
            const radius  = utils.lerp(this.config.radius.max, this.config.radius.min, t);
            const polygon = this.#generateTree(point, radius);
            polygon.draw(ctx, {fill: color, colorStroke: 'rgba(0,0,0,0)'})
        }
        if(data.debug.state) this.base.draw(ctx, data.debug);
    };
}