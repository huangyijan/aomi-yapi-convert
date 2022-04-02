import api from './api/groupBuy'
api.groupBuy().then(data => {
  console.log(data.goods[0])
})

const array = [undefined, undefined, undefined, 1, 2, 3,undefined,4]
// for (let index = 0; index < array.length; index++) {
//   const element = array[index];
//   if (!element) {
//     array.splice(index, 1)
//     index --
//   }
// }
const target = array.reduce((pre, curr) => {
  if(curr) pre.push(curr)
  return pre
}, [])
console.log(target)

