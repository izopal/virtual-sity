import {Markings}     from './markings.js';

export class Start extends Markings{
    constructor(parameters){
        super(parameters);
        // підключаємо зображення
        this.image         = new Image;
        this.image.src     = `img/car.png`;
        // параметри початкового розміру кадру (frame) зображення 
        this.autoWidth     = this.dataConfig.img.autoWidth;
        this.autoHeight    = this.dataConfig.img.autoHeight;
        
        this.polygon = super.updatePolygon();
    };
    draw(ctx){
        // промальовуємо машину на дорозі
        ctx.save();
            ctx.translate(this.center.x, this.center.y);
            ctx.rotate(this.angel - Math.PI * .5);
            ctx.drawImage ( this.image, 
                // параметри кадру, який обераємо
                0,
                0,
                this.autoWidth,
                this.autoHeight, 
                // параметри кадру, де буде розміщений і які розміри буде мати
                - this.width * .5,
                - this.height * .5,
                this.width,
                this.height);
        ctx.restore();
   };
   drawDebug(ctx, debug){
        super.drawDebug(ctx, debug)
   }
}