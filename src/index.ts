import { hasProperty, toHumpName } from './utils'
import { CommonFileItem } from './prompt'

/** 获取文件存储的路径 */
export const getSavePath = (recommendName: string, project: ProjectConfig, fileConfig: CatConfig | undefined, nameChunk: Map<string, number>) => {

    let fileName = recommendName
    let dir = project.outputDir
    // 判断用户是否有自定义配置，如果有取配置文件的。（TODO:用户配置不当可能会导致出错）
    if (fileConfig && hasProperty(fileConfig, 'fileName') && fileConfig.fileName) fileName = fileConfig.fileName
    if (fileConfig && hasProperty(fileConfig, 'outputDir') && fileConfig.outputDir) dir = fileConfig.outputDir

    let FileNameTimes = nameChunk.get(recommendName)
    if (FileNameTimes) FileNameTimes++ // 如果map已经有值那我们就+1，防止用户命名冲突，虽然不太优雅

    const { version } = global.apiConfig
    const path = `${dir}/${fileName}${FileNameTimes || ''}.${version}`
    nameChunk.set(fileName, FileNameTimes || 1)
    return path
}

const getFileName = (path: string, fileNameSet: { [key: string]: number }) => {
    path = path.replace(/\/{.+}/g, '')
    path = path.substring(1, path.length)
    const words = path.split('/')
    words.forEach(word => {
        word = toHumpName(word)
        word = word.replace(/^([A-Z])/, (_, item: string) => item.toLowerCase()) // 转下首字母小写
        fileNameSet[word] ? fileNameSet[word]++ : fileNameSet[word] = 1
    })
}


/** 获取还没有命名过并且出现次数最多的词作为文件夹名 */
const getMaxTimesObjectKeyName = (obj: TimesObject, hasSaveNames: Array<string>): string => {
    const sortKeyByTimes = Object.keys(obj).sort((key1, key2) => obj[key2] - obj[key1])
    const uinFileName = sortKeyByTimes.find(key => !hasSaveNames.includes(key)) || 'common'
    return uinFileName
}

/**
 * 生成一个文件的文件流
 * @param item 单个菜单对象
 * @param project 用户配置项目对象，详见readme.md或者type文件
 * @returns 单个文件字符流
 */
export const generatorFileCode = (item: JsDocMenuItem, project: ProjectConfig) => {
    const File = new CommonFileItem(project, item)
    const saveFileBuffer = File.getFileCode()
    return saveFileBuffer
}

/**
 * 获取文件名称
 * @param item 接口菜单项
 * @param hasSaveNames 已经取名的容器
 * @returns 文件名称
 */
export const getApiFileName = (item: JsDocMenuItem, hasSaveNames: Array<string>) => {
    const { list } = item
    const fileNameSet: TimesObject = {}
    list.forEach((api) => {
        getFileName(api.path, fileNameSet)
    })
    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法
    const FileName = getMaxTimesObjectKeyName(fileNameSet, hasSaveNames)
    hasSaveNames.push(FileName)
    return FileName
}