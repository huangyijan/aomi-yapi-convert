import { getOneApiConfig } from '../utils/str-operate'
import { saveFile } from '../utils/file'
import { getMaxTimesObjectKeyName, getPathName } from '../utils'
import { request } from '../utils/request'
import format from '../utils/format'
/** 配置文件头尾 */
export const configFileHeadFoot = (fileBufferStringChunk: Array<string>, noteStringChunk: Array<string>) => {
    fileBufferStringChunk.unshift('export default {')
    fileBufferStringChunk.unshift('import { fetch } from \'@/service/fetch/index\'')
    fileBufferStringChunk.push('}')
    fileBufferStringChunk.push(...noteStringChunk)
    return format(fileBufferStringChunk)
}

/** 配置注释 */
const getNoteStringItem = (item: apiSimpleItem, project_id: number) => {
    return `/**
   * ${item.title}
   * 更新时间: ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link: http://yapi.miguatech.com/project/${project_id}/interface/api/${item._id}
   */`
}

/** 配置请求主方法 */
const getMainMethodItem = (item: apiSimpleItem) => {
    const { requestName, requestPath, requestParams } = getOneApiConfig(item.path)
    return `${requestName}: ${requestParams} => {
    return fetch(${requestPath}, {
    ...options,
    method: '${item.method}'
    })
  },`
}

/**
 * 获取单个API文件的保存文件名和写入的文件流字符串
 * @param item 接口菜单单项
 * @returns {Object} {文件名：string, 单个API文件流主容器: string}
 */
const getApiFileConfig = (item: MenuItem) => {
    const { list, project_id } = item

    const pathSet: TimesObject = {} // 处理文件夹命名的容器
    const fileBufferStringChunk: Array<string> = [] // 单个API文件流
    list.forEach((item) => {

        /** 没有完成的接口不处理 */
        if (item.status === 'undone') return

        /** 先配置注释再配置请求主方法 */
        fileBufferStringChunk.push(getNoteStringItem(item, project_id))
        fileBufferStringChunk.push(getMainMethodItem(item))

        // 统计名字出现次数，用作文件夹命名依据
        const pathName = getPathName(item.path)
        pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1
    })

    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法, TODO: 会出现重名问题
    const FileName = getMaxTimesObjectKeyName(pathSet)


    return { FileName, fileBufferStringChunk }
}

/** 处理API文件列表的生成 */
const generatorFileList = ({ data }: { data: Array<MenuItem> }) => {
    const nameChunk = new Map() // TODO 处理重名问题，后面考虑有没有更佳良好取名策略

    data.forEach((item: MenuItem) => {
        const { FileName, fileBufferStringChunk } = getApiFileConfig(item)
        if (!fileBufferStringChunk.length) return

        let FileNameTimes = nameChunk.get(FileName)

        const savePath = `./api/${FileName}${FileNameTimes ? FileNameTimes++ : ''}.js`
        saveFile(savePath, configFileHeadFoot(fileBufferStringChunk, []))

        nameChunk.set(FileName, FileNameTimes ? FileNameTimes : 1)
    })
}

/** 生成没有注释的API文件，注释有文档链接，可以直接跳转 */
export const getApiDocWithNoNote = async (url: string) => {
    const fileString = await request(url)
    try {
        const MenuList = JSON.parse(fileString)
        generatorFileList(MenuList)
    } catch (error) {
        console.log(error)
    }
    console.log(fileString)
}
