import api from './api/cart'
api.groupBuyGoodsSku().then(data => {
  console.log(data.fo)
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

