import format from './format'
import {  hasProperty, toHumpName } from '.'
import { getValidApiPath } from './str-operate'

import { handleJsFileString } from '../simple/js'
import { handleTsFileString } from '../simple/ts'

import { handleJsdocFileString } from '../prompt/jsdoc'
import { handleTsTypeFileString } from '../prompt/ts-type'


/** 设置api文件头部文件 */
const getHeaderInfo = (config: ApiConfig) => {
    const axiosFrom = config.axiosFrom || 'import fetch from \'axios\''
    const tsHeader = config.version === 'ts' ? '\n// @ts-nocheck' : ''
    const axiosType = config.version === 'ts' ? 'import { AxiosRequestConfig } from \'aomi-yapi-convert\'\n': ''
    
    return `
/* eslint-disable */${tsHeader}
/**
 * @file 该文件由aomi-yapi-convert自动生成，请不要改动这个文件。
 * @docUpdateTime ${new Date().toLocaleDateString()}
 */

${axiosType}${axiosFrom}
    `
}

const getJsdocAxiosType = () => {
    const {version}  = global.apiConfig
    if (version === 'js') {
        return `/**
   * @typedef { import("aomi-yapi-convert").AxiosRequestConfig } AxiosRequestConfig
   */`
    } 
    return ''
}

/** 配置文件头尾 */
export const configFileHeadFoot = (fileBufferStringChunk: Array<string>, noteStringChunk: Array<string>, config: ApiConfig) => {

    fileBufferStringChunk.unshift('export default {')
    fileBufferStringChunk.unshift(getHeaderInfo(config))
    fileBufferStringChunk.push('}')
    fileBufferStringChunk.push(...noteStringChunk)
    if(getJsdocAxiosType()) fileBufferStringChunk.push(getJsdocAxiosType())
    return format(fileBufferStringChunk)
}

/** 获取文件存储的路径 */
export const getSavePath = (recommendName: string, project: ProjectConfig, fileConfig: CatConfig | undefined, nameChunk: Map<string, number>) => {

    let fileName = recommendName
    let dir = project.outputDir
    // 判断用户是否有自定义配置，如果有取配置文件的。（TODO:用户配置不当可能会导致出错）
    if (fileConfig && hasProperty(fileConfig, 'fileName')) fileName = fileConfig.fileName
    if (fileConfig && hasProperty(fileConfig, 'outputDir')) dir = fileConfig.outputDir

    let FileNameTimes = nameChunk.get(recommendName)
    if (FileNameTimes) FileNameTimes++ // 如果map已经有值那我们就+1，防止用户命名冲突，虽然不太优雅

    const { version } = global.apiConfig
    const path = `${dir}/${fileName}${FileNameTimes || ''}.${version}`
    nameChunk.set(fileName, FileNameTimes || 1)
    return path
}

/** 根据文件类型获取生成简介版本的方法名 */
const generateSimpleBufferStringByVersion = (version: Version) => {
    const configFunctionName = version === 'ts' ? handleTsFileString : handleJsFileString
    return configFunctionName
}
/** 根据文件类型获取生成智能提示版本的方法名 */
const generateTypeBufferStringByVersion = (version: Version) => {
    const configFunctionName = version === 'ts' ? handleTsTypeFileString : handleJsdocFileString
    return configFunctionName
}

const getFileName = (path: string, fileNameSet: { [key: string]: number }) => {
    path = toHumpName(path).replace(/\/{.+}/g, '')
    path = path.substring(1, path.length)
    const words = path.split('/')
    words.forEach(word => {
        word = word.replace(/^([A-Z])/, (_, item: string) => item.toLowerCase()) // 转下首字母小写
        fileNameSet[word] ? fileNameSet[word]++ : fileNameSet[word] = 1
    })
}

/**
 * 获取Js文件的单个API文件的保存文件名和写入的文件流字符串
 * @param item 接口菜单单项
 * @param project 项目组文件的配置
 * @returns {Object} {文件名：string, 单个API文件流主容器: string}
 */
export const getApiFileConfig = (item: MenuItem | JsDocMenuItem, project: ProjectConfig, hasSaveNames: Array<string>) => {
    const { list } = item
    const { isNeedType } = global.apiConfig
    const fileNameSet: TimesObject = {}
    const fileBufferStringChunk: Array<string> = [] // 单个API文件流
    const noteStringChunk: Array<string> = ['\n'] // 存储Jsdoc注释的容器
    list.forEach((item) => {
        /** 没有完成的接口不处理 */
        if (item.status === 'undone') return
        item.path = getValidApiPath(item.path) // 处理一些后台在地址栏上加参数的问题,难搞
        if (isNeedType) {
            generateTypeBufferStringByVersion(global.apiConfig.version)(fileBufferStringChunk, item as JsDocApiItem, project, noteStringChunk)
        } else {
            generateSimpleBufferStringByVersion(global.apiConfig.version)(fileBufferStringChunk, item as apiSimpleItem, project)
        }
        getFileName(item.path, fileNameSet)
    })

    // 文件名取名策略：获取路径上名字出现最多词的路径名称，需要将一些短横线下划线转为驼峰命名法, TODO: 可能会出现重名问题
    const FileName = getMaxTimesObjectKeyName(fileNameSet, hasSaveNames)
    hasSaveNames.push(FileName)


    return { FileName, fileBufferStringChunk, noteStringChunk }
}

/** 获取还没有命名过并且出现次数最多的词作为文件夹名 */
export const getMaxTimesObjectKeyName = (obj: TimesObject, hasSaveNames: Array<string>): string => {
    const sortKeyByTimes = Object.keys(obj).sort((key1, key2) => obj[key2]-obj[key1])
    const uinFileName = sortKeyByTimes.find(key => !hasSaveNames.includes(key)) || 'common'
    return uinFileName
}