import data from '../constants.js';
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


const value = 'name'
const keys = extractNames(data, value);

// Функція для пошуку всіх значень ключів "name"
function extractNames(obj, value) {
  const keys = [];

  function findNames(obj) {
    for (const key in obj) {
      if (key === value)  keys.push(obj[key]);
      if (typeof obj[key] === 'object')  findNames(obj[key]);
    }
  }
  findNames(obj);
  return keys;
}



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

// 
export function operate(p1, operator, p2) {

  if (operator === '+')  return {x: p1.x + p2.x, y: p1.y + p2.y};
  if (operator === '-')  return {x: p1.x - p2.x, y: p1.y - p2.y};
  if (operator === '*')  return {x: p1.x * p2,   y: p1.y * p2};
}

export function translateMetod(loc, angle, offset){
  const coordinates = {x: loc.x + Math.cos(angle) * offset,
                       y: loc.y + Math.sin(angle) * offset}
  return new Point(coordinates)
}


// функція сортування oбєктів за вказаними інструментами
export function sortObject(obj, tools, Objects){
  for (const tool in tools) {
      if (tools[tool]) {
          if (!Objects[tool]) Objects[tool] = [];
          Objects[tool].push(obj);
      }
  }
}
export default keys;

