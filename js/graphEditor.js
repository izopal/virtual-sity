import {getNearestPoint} from '../js/math/utils.js'


export default class GraphEditor {
    constructor(canvas, obj, point, segment){
        this.graph         = obj;
        this.pointObject   = point;
        this.segmentObject = segment;
        
        
        this.minDicnance   = this.pointObject.minDicnance;
        this.sizeRemove    = this.minDicnance;
        
        // параметри штрихпунтирної лінії
        this.length        = this.segmentObject.dash.length;
        this.interval      = this.segmentObject.dash.interval;
        this.color         = this.segmentObject.dash.color;

        // парметр обєкта який обираємо
        this.point         = null;
        this.lastPoint     = null;
        this.activePoint   = null;
        this.pressed       = false         
        
        this.dragging      = false;        // параметри вкл.-викл. редактора (пересування точок)
        this.remove        = false;        // параметр вкл.-викл резинки
        this.curve         = false;        // парамет малювання кривої лінії
       
        const Class       = this.pointObject.class;
        // вкл.-викл конструктора
        window.addEventListener('keydown', (e) => {
            if(['D', 'd', 'В', 'в'].includes(e.key)) {
                this.dragging      = !this.dragging;
                this.remove        = false;
                this.curve         = false;
            };

            if(['R', 'r', 'К', 'к'].includes(e.key)) {
                this.remove        = !this.remove;
                this.dragging      = false; 
                this.curve         = false;
            };
            if(['C', 'c', 'С', 'с'].includes(e.key)) {
                this.curve         = !this.curve;
                this.dragging      = false; 
                this.remove        = false;
            };
        });
        
        canvas.addEventListener('wheel', (e) => {
            const deltaY = - e.deltaY * .05; // Кількість прокруток роликом миші
            if (deltaY > 0) {
                this.sizeRemove  += deltaY; 
                this.widthCurve  += deltaY;     
                this.radiusPoint += deltaY;     
            } else if (deltaY < 0) {
                this.sizeRemove  = this.sizeRemove  > 5 ? this.sizeRemove  += deltaY : 5;
                this.widthCurve  = this.widthCurve  > 5 ? this.widthCurve  += deltaY : 5;
                this.radiusPoint = this.radiusPoint > 5 ? this.radiusPoint += deltaY : 5;
            };
            console.log(this.sizeRemove)
        });

        canvas.addEventListener('mousedown', (e) => {
            
            this.pressed = true;
            // умова побудови прямих за допомогою точок
            if(e.buttons === 1 && !this.remove && !this.dragging && !this.curve){
                this.point   = new Class(e.offsetX, e.offsetY,  this.pointObject, {flag: false});
                
                // провірка якщо вибрали активну точку, вона стає послідньою
                if(this.activePoint){
                   this.#addSegment(this.activePoint)
                   return                                // при виконнанні умови код дальше не виконється
                };

                this.graph.addPoint(this.point);     // додаємо точку
                this.#addSegment(this.point);        // додаємо лінію 
            };
             // умова видалення точки
            if(this.remove){
                if(this.activePoint) this.#removePoint(getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)); 
            }
            // умова переміщення точки
            if(this.dragging && this.activePoint !== null){
                this.activePoint.x = e.offsetX;
                this.activePoint.y = e.offsetY;
            };
        });
        
        canvas.addEventListener('mousemove', (e) => {
            // умова переміщення точки
            if(this.dragging && this.pressed && this.activePoint !== null){
                this.activePoint.x = e.offsetX ;
                this.activePoint.y = e.offsetY;
            }else{
                // умова промальовки кривої лінії
                this.point       = new Class(e.offsetX, e.offsetY,  this.pointObject, {flag: true});
                this.activePoint = getNearestPoint(this.point, this.graph.points, this.minDicnance);
                
                if(e.buttons === 1 && this.curve){
                    this.graph.addPoint(this.point);
                    this.#addSegment(this.point)
                };
            }

            // умова видалення точки
            if(this.remove && this.pressed){
                if(this.activePoint) this.#removePoint(getNearestPoint(this.point, this.graph.points, this.minDicnance = this.sizeRemove)); 
            }
        });

        canvas.addEventListener('mouseup', () =>{
            this.pressed = false;
        });
    };

    #removePoint(point){
        this.graph.removePoint(point);
        if (this.lastPoint === point) this.lastPoint = null;
        this.activePoint   = null;
    }
  
    #addSegment(point){
        const Class    = this.segmentObject.class;
        if(this.lastPoint) this.graph.addSegment(new Class(this.lastPoint, point, this.segmentObject));
        this.lastPoint = point;
    }

    draw(ctx){
        this.graph.draw(ctx);
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.activePoint) this.activePoint.draw(ctx, {fill: true})
    
        // уомва малювання останьої вибраної точки (якщо виконується передаємо значення outline: true  )
        if(this.lastPoint){
            const Class    = this.segmentObject.class;
            this.point = this.activePoint ? this.activePoint : this.point;   // якщо обираємо існуючу точку вона робиться активною;
            new Class(this.lastPoint, this.point, this.segmentObject).draw(ctx, {dash: [this.length, this.interval], color: this.color});
            this.lastPoint.draw(ctx, {outline: true})

        }



    }
}