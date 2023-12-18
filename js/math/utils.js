import {data} from '../constants.js';
import {Point} from '../primitives/point.js';

//функція дл пошуку всіх обєктів по знайдених ключах
export function getAllObj(){
  const allObj = []
  for(const key of keys){
    const obj = findObjData(key);
    allObj.push(obj);
  };
  return allObj
}

// Функція для пошуку всіх значень ключів "name"
const value = 'key'
export const keys = extractNames(data, value);

function extractNames(obj, value) {
  const keys = [];

  function findNames(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'object'){ 
        findNames(obj[key])
      }else{
        if (key === value){
          keys.push(obj[key])
        };
      };
    }
  }
  findNames(obj);
  return keys;
};

// Функція пошуку  значення обєкта за вказаним ключем
export  function findObjData(targetKey) {
  let stack     = [data] ;
  
  while (stack.length > 0) {
    let value = stack.pop();                                             // отримуємо  послідній елемент в масиві
    for (const key in value) {
      
      if (key === targetKey){
          const result = findObjData(value[key], targetKey);
          if (result) return result;
          return value[key];               
      };

      if (typeof value[key] === 'object') stack.push(value[key]);        // якщо даний ключ обєкт ми його додаємо до нашого масиву
    }
  }
  return null;
};
// функція корегування значень при використовуванні тачпад
export  function getMouseEventFromTouchEvent(e) {
  e.preventDefault()
  if (e instanceof TouchEvent && e.touches.length === 1){
    return {
      pageX: e.touches[0].pageX,
      pageY: e.touches[0].pageY,
      buttons: 1,
      touches: true,
    };
  };
  
  if (e.touches && e.touches.length >= 2) return e;

  return null;
};



// 
export function operate(p1, operator, p2) {
  switch (operator) {
      case '+':
          return { x: p1.x + p2.x, y: p1.y + p2.y };
      case '-':
          return { x: p1.x - p2.x, y: p1.y - p2.y };
      case '*':
          return { x: p1.x * p2, y: p1.y * p2 };
      case 'average':
          return { x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5 };
      case '+dot':
          return p1.x * p2.x + p1.y * p2.y;
      case '-dot':
          return p1.x * p2.x - p1.y * p2.y;
      default:
          return null; // Додайте власні обробники для інших випадків або повертайте null як значення за замовчуванням
  }
}

export function getPoint(coordinatesPoint){
  return new Point(coordinatesPoint)
}

export function pointFrom3D(p1, p2, height){
  const distanceVector = operate(p1, '-', p2);
  const scaledVector   = operate(distanceVector, '*', height);
  const point          = operate(p1, '+', scaledVector);
  return point
};

export function normalize(p){
  return operate(p, "*", 1 / Math.sqrt(p.x * p.x + p.y * p.y))
}

export function distance (a, b){
  const c =  operate(a, '-', b)
  return Math.sqrt(c.x * c.x + c.y * c.y)
}
export function angel (a){
  return Math.atan2(a.y, a.x)
}
export function perpedicular(p){
  const coordinates = {x: -p.y,
                       y:  p.x}
  return new Point(coordinates)
}
// 
export function translateMetod(loc, angle, offset){
  const coordinates = {x: loc.x + Math.cos(angle) * offset,
                       y: loc.y + Math.sin(angle) * offset}
  return new Point(coordinates)
};

// функція сортування oбєктів за вказаними інструментами
export function sortObject(obj, tools, Objects){
  for (const tool in tools) {
      if (tools[tool]) {
          Objects[tool] = Objects[tool] || [];
          Objects[tool].push(obj);
      }
  };
  return Objects
};


// функція для визначення положення на прямій
export function lerp(A, B, t){
  return A + (B - A) * t
};
export function lerp2D(A, B, t){
  const coordinates = {
    x: lerp(A.x, B.x, t),
    y: lerp(A.y, B.y, t)
  }
  return new Point(coordinates)
};
export function invLerp(a, b, v){
  return (v -a) / (b - a)
}

// функція визначення перетину двох прямих  за методом Крамера 
export function getIntersection(A, B, C, D){
  const tTop   = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x); 
  const uTop   = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y); 
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
  
  const eps = .0000001
  if(Math.abs(bottom) > eps){
      const t = tTop / bottom;
      const u = uTop / bottom;
      if (t >= 0 && t <= 1 && u >= 0 && u <=1){
          return {
              x:      lerp(A.x, B.x, t),   
              y:      lerp(A.y, B.y, t),
              offset: t
          }
      }
  }
  return null;
};
// функція пошуку найближчої точки
export function getNearestPoint(A, B, d = Number.MAX_SAFE_INTEGER){
  let minDicnance = Number.MAX_SAFE_INTEGER;                   // мінімальна відстань між точками
  let activePoint = null;                                      // параметр найближчої точки;

  for(const b of B){
    const dist =  Math.hypot(b.x - A.x, b.y - A.y)           // розраховуємо відстань між поставленою точкою і всі точками в масиві
    if(dist < d){
      minDicnance = dist;
      activePoint = b;
    }
  }
  return activePoint;
};
// функція пошуку найближчої сегменту
export function getNearestSegment(A, B, d = Number.MAX_SAFE_INTEGER){
  let minDicnance = Number.MAX_SAFE_INTEGER;                   // мінімальна відстань між точками
  let activeSegment = null;                                      // параметр найближчої точки;

  for(const b of B){
    const dist =  b.distanceToPoint(A)           // розраховуємо відстань між поставленою точкою і точкою на сегменті
    if(dist < d){
      minDicnance = dist;
      activeSegment = b;
    }
  }
  return activeSegment;
};

// функція випадкового кольору
export function getRandomColor() {
  const red   = Math.floor(Math.random() * 256);     
  const green = Math.floor(Math.random() * 256);  
  const blue  = Math.floor(Math.random() * 256);
  const alpha = Math.random() * .4 + .6;    
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;      
};

// функція обмеження значень, щоб не вводити мінусові і більші за вказані нами  
export function getValidValue(value, minValue = Number.NEGATIVE_INFINITY, maxValue = Number.POSITIVE_INFINITY) {
  return Math.max(minValue, Math.min(maxValue, value));
}
// функція зміни значень ключів при масштабуванні (зміни розімірів екрану)
export function multiplyKeys(obj, scale, options) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      multiplyKeys(obj[key], scale, options)
    }else{
      if (key in options) obj[key] *= scale; 
    }
  };
  return obj
};

// зміна значення кнопок на true/false приактивації деактивації  
export function setTool(name, tools) {
  for (const tool in tools) {
      tools[tool] = tool === name ? !tools[tool] : false
  };
};

export function bbox(obj) {
  let box = [];
  Object.values(obj).forEach(point => {
    for(const key in point) {
      if(!isNaN(point[key])) box.push(parseFloat(point[key]))
    }
  })
  return box
};


