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


const testRegex = /(\[[\d.]+\s?,\s?[\d.]+\],?)/

/** 设计一下配置文件 */
const targetJson = {
  protocol: '',
  host: '',
  token: '',
  version: '',
  axiosFrom: '',
  projects: [
    {
      projectId: 445,
      outputDir: '',
      isLoadFullApi: false,
      group: [
        {
          catId: 8366,
          outputDir: '',
          fileName: ''
        }
      ]
    }
  ]
}