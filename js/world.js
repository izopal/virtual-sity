import {data}      from './constants.js';
import * as utils  from './math/utils.js';
import {Envelope}  from './primitives/envelope.js';
import { Point } from './primitives/point.js';
import {Polygon}   from './primitives/polygon.js';
import { Segment } from './primitives/segment.js';

export class World{
    constructor(graph){
        this.graph          = graph;
       
        this.config         = data.world            || {};
        this.configRoad     = this.config.road;
        this.configBuilding = this.config.building;
        this.configTree     = this.config.tree;

        this.configPolygon  = data.primitives.polygon 
        
        this.polygons       = [];
        this.roads          = [];
        this.roadBorders    = [];

        this.cities         = [];
        this.cityBorders    = [];
        this.buildings      = [];
        this.trees          = [];
        
        this.generate()
    };
    
    generate(){
        this.generateRoad();
        this.generateCity();
    }

    generateCity(){
        const citySegments = this.graph.sortedSegments.city || [];
        this.cities        = citySegments.map(segment => new Envelope(segment, this.configRoad));
        this.cityBorders   = Polygon.union(this.cities.map(road => road.polygon));

        this.buildings = this.#generateBuilding();
        this.trees     = this.#generateTrees(); 
    };

    generateRoad(){
        const roadSegments = this.graph.sortedSegments.road || [];
        this.roads         = roadSegments.map(segment => new Envelope(segment, this.configRoad));
        this.roadBorders   = Polygon.union(this.roads.map(road => road.polygon));
    };

    #generateBuilding(){
        const citySegments = this.graph.sortedSegments.city || [];
        const tmpEnvelopes = [];
        const config = {
            width:   this.configRoad.width + this.configBuilding.width + this.configBuilding.spacing * 2,
            current: this.configRoad.current,
        };
        for(const segment of citySegments){
            tmpEnvelopes.push(new Envelope(segment, config))
        };
        // блок видалення частини сегментів направляющих які менше за меншу допустиму довжину будівлі    
        const guides = Polygon.union(tmpEnvelopes.map(e => e.polygon));
        for(let i = 0; i < guides.length; ++i){
            const seg = guides[i];
            if(seg.length() < this.configBuilding.minLenght){
                guides.splice(i, 1);
                --i;
            }
        };

        const supports = [];
        for(let segment of guides){
            // console.log(segment.length())
            const line            = segment.length() + this.configBuilding.spacing;
            const buildingCount   = Math.floor(line / (this.configBuilding.minLenght + this.configBuilding.spacing))  // визначаємо кількість будівель які можуть розміститися на напрвляющій лінії
            const buildingLenght  = line / buildingCount - this.configBuilding.spacing;                            // визначаємо довжину лінії направляющої для будинків
            const dir             = segment.directionVector();
            
            let q1   = segment.p1;
            let q2   = utils.operate(q1, '+', utils.operate(dir, '*', buildingLenght));
            supports.push(new Segment(q1, q2));

            for(let i = 2; i <= buildingCount; ++i){
               q1 = utils.operate(q2, '+', utils.operate(dir, '*', this.configBuilding.spacing)); 
               q2 = utils.operate(q1, '+', utils.operate(dir, '*', buildingLenght));
               supports.push(new Segment(q1, q2)); 
            };
        };

        const bases = [];
        // додаємо полігони
        for(const segment of supports) bases.push(new Envelope(segment, this.configBuilding).polygon)
        // видаляємо будівлі якщо вони пересікаються
        for(let i = 0; i < bases.length - 1; ++i){   
            for(let j = i + 1; j < bases.length; ++j){
                if(bases[i].intersectsPoly(bases[j])){
                    bases.splice(j, 1);
                    --j;
                }
            }
        }
        return bases
    };

    #generateTrees(){
        const trees = [];
        const points = [
            ...this.cityBorders.map(s => [s.p1, s.p2]).flat(),
            ...this.buildings.map(b => b.points).flat()
        ];
        const left   = Math.min(...points.map(p => p.x));
        const right  = Math.max(...points.map(p => p.x));
        const bottom = Math.min(...points.map(p => p.y));
        const top    = Math.max(...points.map(p => p.y));

        while (trees.length < this.configTree.count) {
            const coordinates = {
                x: utils.lerp(left, right, Math.random()),
                y: utils.lerp(bottom, top, Math.random()),
            }
            const p = new Point(coordinates);
            trees.push(p);
        };
        return trees
    }

    remove(point){
        for(const key in point.tools){
            if(point.tools[key]){
                this.graph.sortedPoints[key]   = this.graph.sortedPoints[key].filter(p => !p.equals(point));
                if (this.graph.sortedPoints[key].length === 1) this.graph.sortedPoints[key].pop();
                this.graph.sortedSegments[key] = this.graph.sortedSegments[key].filter(segment => !segment.p1.equals(point) && !segment.p2.equals(point));
            };
        }
    }
    
    removeAll(){
        for(const key in  this.graph.sortedSegments){this.graph.sortedSegments[key] = []};
        for(const key in  this.graph.sortedPoints)  {this.graph.sortedPoints[key] = []};
    }

    draw(ctx){
        const polygonPoints   = this.graph.sortedPoints.polygon || [];

        const roadPoints      = this.graph.sortedPoints.road    || [];
        const roadSegments    = this.graph.sortedSegments.road  || [];

        const cityPoints      = this.graph.sortedPoints.city    || [];
        const citySegments    = this.graph.sortedSegments.city  || [];
        
        // console.log(roadSegments)


        new Polygon(polygonPoints).draw(ctx, this.configPolygon.segment)
        for(const point    of polygonPoints )    {point.draw(ctx,   this.configPolygon.point)};

        for(const road     of this.roads)        {road.draw(ctx,    this.configRoad)};
        for(const border   of this.roadBorders)  {border.draw(ctx,  this.configRoad.border)}; 
        for(const segment  of roadSegments)      {segment.draw(ctx, this.configRoad.marking)};
        for(const point    of roadPoints )       {point.draw(ctx,   this.configRoad.point)};
        

        for(const road     of this.cities)       {road.draw(ctx,    this.configRoad)};
        for(const border   of this.cityBorders)  {border.draw(ctx,  this.configRoad.border)}; 
        for(const segment  of citySegments)      {segment.draw(ctx, this.configRoad.marking)};
        for(const point    of cityPoints )       {point.draw(ctx,   this.configRoad.point)};

        for(const tree of this.trees)             {tree.draw(ctx, this.configTree)}
        for(const building of this.buildings )    {building.draw(ctx, this.configBuilding)};

    };

}