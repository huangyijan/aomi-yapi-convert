import { hasProperty } from '../utils'
import format from '../utils/format'

/** 设置api文件头部文件 */
const getHeaderInfo = (config: ApiConfig) => {
    const axiosFrom = config.axiosFrom || 'import fetch from \'axios\''
    const tsHeader = config.version === 'ts' ? '\n// @ts-nocheck' : ''
    return `
/** eslint-disable */${tsHeader}
/**
 * @file 该文件由aomi-yapi-convert自动生成，请不要改动这个文件。
 * @docUpdateTime ${new Date().toLocaleDateString()}
 */

import { axiosConfig } from 'aomi-yapi-convert'
${axiosFrom}
    `
}

/** 配置文件头尾 */
export const configFileHeadFoot = (fileBufferStringChunk: Array<string>, noteStringChunk: Array<string>, config: ApiConfig) => {
    fileBufferStringChunk.unshift('export default {')
    fileBufferStringChunk.unshift(getHeaderInfo(config))
    fileBufferStringChunk.push('}')
    fileBufferStringChunk.push(...noteStringChunk)
    return format(fileBufferStringChunk)
}

/** 获取文件存储的路径 */
export const getSavePath = (recommendName: string, project: ProjectConfig, fileConfig: CatConfig | undefined, nameChunk: Map<string, number>, config: ApiConfig) => {
    let fileName = recommendName
    let dir = project.outputDir
    // 判断用户是否有自定义配置，如果有取配置文件的。（TODO:用户配置不当可能会导致出错）
    if (fileConfig && hasProperty(fileConfig, 'fileName')) fileName = fileConfig.fileName
    if (fileConfig && hasProperty(fileConfig, 'outputDir')) dir = fileConfig.outputDir

    let FileNameTimes = nameChunk.get(recommendName)
    if (FileNameTimes) FileNameTimes++ // 如果map已经有值那我们就+1，防止用户命名冲突，虽然不太优雅

    const { version } = config
    const path = `${dir}/${fileName}${FileNameTimes || ''}.${version}`
    nameChunk.set(fileName, FileNameTimes || 1)
    return path
}