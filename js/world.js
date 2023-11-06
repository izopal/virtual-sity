import {data}      from './constants.js';
import * as utils  from './math/utils.js';
import { Point }   from './primitives/point.js';
import { Segment } from './primitives/segment.js';
import {Polygon}   from './primitives/polygon.js';
import {Envelope}  from './primitives/envelope.js';
import {Tree}      from './items/tree.js';
import {Building}  from './items/building.js';

export class World{
    constructor(graph){
        this.graph          = graph;
       
        this.config         = data.world            || {};
        this.configRoad     = this.config.road;
        
        this.configPolygon  = data.primitives.polygon 
        
        this.polygons       = [];
        this.roads          = [];
        this.roadBorders    = [];
        
        this.cities         = [];
        this.cityBorders    = [];
        
        this.buildings      = [];
        
        // параметри класу Tree
        this.tree           = new Tree();
        this.configTree     = this.tree.config;
        this.trees          = [];
        // параметри класу Будинок
        this.building       = new Building();
        this.configBuilding = this.building.config;
        
        this.generate()
    };
    
    generate(){
        this.generateRoad();
    }

    generateCity(){
        this.#generateRoadCity();
        this.buildings = this.#generateBuilding();
        this.trees     = this.#generateTrees(); 
    };

    generateRoad(){
        const roadSegments = this.graph.sortedSegments.road || [];
        this.roads         = roadSegments.map(segment => new Envelope(segment, this.configRoad));
        this.roadBorders   = Polygon.union(this.roads.map(road => road.polygon));
    };
    #generateRoadCity(){
        const citySegments = this.graph.sortedSegments.city || [];
        this.cities        = citySegments.map(segment => new Envelope(segment, this.configRoad));
        this.cityBorders   = Polygon.union(this.cities.map(road => road.polygon));
    }
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
        const eps = .00001;
        for(let i = 0; i < bases.length - 1; ++i){   
            for(let j = i + 1; j < bases.length; ++j){
                if( bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPolygon(bases[j]) < this.configBuilding.spacing - eps
                ){
                    bases.splice(j, 1);
                    --j;
                }
            }
        }
        return bases
    };

    #generateTrees() {
        // збираємо всі можливі полігони в один масив
        const illegalPolys = [...this.buildings, ...this.cities.map(e => e.polygon)]
        // збираємо всі можливі точки в один масив
        const points       = [...illegalPolys.map(e => e.points).flat()];
        // збираємо всі можливі сегменти в один масив
        const segments     = [...illegalPolys.map(e => e.segments).flat()];
        // створююємо обмежуючу рамку для полігону
        const left   = Math.min(...points.map(p => p.x));
        const right  = Math.max(...points.map(p => p.x));
        const bottom = Math.min(...points.map(p => p.y));
        const top    = Math.max(...points.map(p => p.y));
    
        const trees = [];
        let tryCount = 0;
        let attempts = 0;
        while (tryCount < this.configTree.count && attempts < 500) {
            // формуємо полігон з обмежувальную рамкою
            const coordinates = {
                x: utils.lerp(left, right, Math.random()),
                y: utils.lerp(bottom, top, Math.random()),
            };
            const p = new Point(coordinates);

            let overlap = true;
            // // перевіряємо чи знаходиться точка p всередині полігонів або на відстані меншій за вказану
            for (const polygon of illegalPolys){
                if (polygon.containsPoint(p) || polygon.distanceToPoint(p) < this.configTree.size + this.configTree.spacing){
                    overlap = false;
                    break
                };
            }
            // перевіряємо чи знаходяться дерева на заданій відстані між собою
            if(overlap){
                for(const tree of trees){
                    const distance       = utils.distance(p, tree.center);
                    const sumOffRadius   = this.configTree.size;
                    if (distance < sumOffRadius){
                        overlap = false;
                        break;
                    };
                }
            };
            // умова щоб кількість рядів дерев неперевищував вказаній ширині посадки дерев
            if(overlap){
                let close = false;
                for (const polygon of illegalPolys){
                    if ( polygon.distanceToPoint(p) < this.configTree.size * this.configTree.numberRows){
                        close = true;
                        break;
                    }
                }
                overlap = close;
            }
            // додаємо полігон (дерево) до масиву якщо всі попередні умови не виконалися;
            if (overlap){
                trees.push(new Tree(p));
                tryCount = 0
            };
            ++tryCount;
            ++attempts;
        }
        return trees;
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

    draw(ctx, viewPoint, zoom){
        this.drawCity(ctx, viewPoint, zoom);
        this.drawRoad(ctx);
        this.drawPolygon(ctx);
        this.drawTree(ctx, viewPoint, zoom)
        this.drawBuilding(ctx, viewPoint)
    };

    drawRoad(ctx){
        this.roadPoints      = this.graph.sortedPoints.road   || [];
        this.roadDash        = this.graph.sortedSegments.road  || [];

        for(const road     of this.roads)        {road.draw(ctx,    this.configRoad)};
        for(const border   of this.roadBorders)  {border.draw(ctx,  this.configRoad.border)}; 
        for(const segment  of this.roadDash)     {segment.draw(ctx, this.configRoad.dash)};
        for(const point    of this.roadPoints )  {point.draw(ctx,   this.configRoad.point)};
    };
    drawPolygon(ctx){
        const polygonPoints   = this.graph.sortedPoints.polygon || [];
        new Polygon(polygonPoints).draw(ctx, this.configPolygon.segment)
        for(const point of polygonPoints )    {point.draw(ctx,   this.configPolygon.point)};
    };

    drawTree(ctx, viewPoint, zoom){
        const treePoints = this.graph.sortedPoints.tree   || [];
        const trees      = [...treePoints.map(point=> new Tree(point)).flat()];
        for(const tree of trees) tree.draw(ctx, viewPoint, zoom)
    };

    drawBuilding(ctx, viewPoint){
        const buildingPoints = this.graph.sortedPoints.building   || [];
        const buildings      = [...buildingPoints.map(point=> new Building(point)).flat()];
        for(const building of buildings) building.draw(ctx, viewPoint)
    }

    drawCity(ctx, viewPoint, zoom){
        this.cityPoints  = this.graph.sortedPoints.city    || [];
        this.cityDash    = this.graph.sortedSegments.city  || [];

        for(const road     of this.cities)       {road.draw(ctx,    this.configRoad)};
        for(const border   of this.cityBorders)  {border.draw(ctx,  this.configRoad.border)}; 
        for(const segment  of this.cityDash)     {segment.draw(ctx, this.configRoad.dash)};
        for(const point    of this.cityPoints )  {point.draw(ctx,   this.configRoad.point)};

        for(const tree of this.trees)            {tree.draw(ctx, viewPoint, zoom)}
        for(const building of this.buildings )   {building.draw(ctx, this.configBuilding)};
    }
}