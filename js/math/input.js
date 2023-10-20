export default class InputHandler {
    constructor(canvas){
        this.mouse  = { pressed: false,
                        x:       '',
                        y:        ''};

     

      
        // ==================== Блок керування мишкою =======================>
        // натиснули ліву кнопку миші
        canvas.addEventListener('mousedown', (e) => {
            this.mouse.pressed = true;
            this.mouse.x       = e.offsetX;
            this.mouse.y       = e.offsetY;
        });
        // рух з натиснутою лівою кнопкою миші
        canvas.addEventListener('mousemove', (e) => {
            if(this.mouse.pressed){
                this.mouse.x   = e.offsetX;
                this.mouse.y   = e.offsetY;
               
            }
        });
        // відпустили ліву кнопку миші
        canvas.addEventListener('mouseup', () => {
            this.mouse.pressed = false;
        });
            
        // ==================== Блок керування touchPad=======================>
        // натиснули 
        canvas.addEventListener('touchstart', e => { 
            this.mouse.pressed = true;
            this.mouse.x = e.changedTouches[0].pageX;
            this.mouse.y = e.changedTouches[0].pageY;
        }, { passive: true });
        
        // рух 
        canvas.addEventListener('touchmove', e =>{
            if(this.mouse.pressed){
                this.mouse.x = e.changedTouches[0].pageX;
                this.mouse.y = e.changedTouches[0].pageY;
                }
        }, {passive: true});
        // відпустили 
        canvas.addEventListener('touchend', () =>{
            this.mouse.pressed = false;
        });
    }
}