export const tools  = {
    dragging: false,        // параметри вкл.-викл. редактора (пересування точок)
    remove:   false,        // параметр вкл.-викл резинки
    curve:    false,        // парамет малювання кривої лінії
    point:    false,        // параметр малювання точки;
    polygon:  false,        // параметр малювання полігону;
    road:     false,        // параметр малювання дороги;
    tree:     false,        // параметр малювання дерев;
    building: false,        // параметр малювання будинків;
    city:     false,        // параметр малювання міста;
};

//  функція вкл обраного інструмента (true) і викл решта неактивних (false)
export function setTool(tool) {
    for (const key in tools) {
        tools[key] = key === tool ? !tools[key] : false
    };
} 

export function dispose(){
    for (const key in this.tools) this.tools[key] = false;
}
