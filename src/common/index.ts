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