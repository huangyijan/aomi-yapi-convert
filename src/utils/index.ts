const LongPathNameRegex = /^\/\{{0,1}([a-zA-Z0-9-_]+)\}{0,1}\/.+/ // 长接口捕获路径名
const ShortPathNameRegex = /^\/([a-zA-Z0-9-_]+)/ // 短接口捕获路径名
const NameRegex = /[-|_]([a-zA-Z])/g // 重命名捕获替换字符串


/** 将下划线和短横线命名的重命名为驼峰命名法 */
export const toHumpName = (str: string) => {
    return str.replace(NameRegex, function (_keb, item) { return item.toUpperCase() })
}
/** 捕获路径名作为API文件夹名称 */
export const getPathName = (path: string) => {
    let patchChunk: RegExpMatchArray | null = null
    if (LongPathNameRegex.test(path)) {
        patchChunk = path.match(LongPathNameRegex)
    } else {
        patchChunk = path.match(ShortPathNameRegex)
    }
    if (!patchChunk) return 'common' // 捕获不到就用common作为路径文件夹
    return toHumpName(patchChunk[1])
}
/** 获取对象里面times里面最大的键值 */
export const getMaxTimesObjectKeyName = (obj: TimesObject): string => {
    const times = Object.values(obj)
    const max = Math.max(...times)
    return Object.keys(obj).find(key => obj[key] === max) || 'common'
}