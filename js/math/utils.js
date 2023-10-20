import data from '../../constants.js'

// Функція пошуку  значення обєкта за вказаним ключем
export  function findGameObject(targetKey) {
  let stack     = [data] ;
  
  while (stack.length > 0) {
    let value = stack.pop();                                             // отримуємо  послідній елемент в масиві
    for (const key in value) {
      
      if (key === targetKey){
          const result = findGameObject(value[key], targetKey);
          if (result) return result;
          return value[key];               
      };

      if (typeof value[key] === 'object') stack.push(value[key]);        // якщо даний ключ обєкт ми його додаємо до нашого масиву
    }
  }
  return null;
};

export function getNearestPoint(A, B, d = Number.MAX_SAFE_INTEGER){
  let minDicnance = Number.MAX_SAFE_INTEGER;                   // мінімальна відстань між точками
  let activePoint = null;                 // параметр найближчої точки;

  for(const b of B){
    const dist =  Math.hypot(b.x - A.x, b.y - A.y)           // розраховуємо відстань між поставленою точкою і всі точками в масиві
    if(dist < d){
      minDicnance = dist;
      activePoint = b;
    }
  }
  // console.log(activePoint)
  return activePoint;
};
