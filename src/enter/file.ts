import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { TOKEN_NAME, USER_ID } from '../utils/constants'


export const GetSafePath = function (relativePath: string) {
    const filePath = path.resolve(relativePath)
    const createDir = (filePath: string) => {
        const dirPath = path.dirname(filePath)
        try {
            fs.accessSync(dirPath)
        } catch (e) {
            createDir(dirPath)
            fs.mkdirSync(dirPath)
        }
    }
    createDir(filePath)
    return filePath
}

/**
 * 存儲方法
 * @param url 存儲目標路徑
 * @param file 存儲文件
 */
export const saveFile = (url: string, file: string | NodeJS.ArrayBufferView) => {
    return new Promise<void>((resolve) => {
        fs.writeFile(GetSafePath(url), file, { encoding: 'utf-8' },
            (res) => {
                console.log('📗', `Api文件更新${res ? '失败' : '成功'}:${url} `)
                resolve()
            }
        )
    })
}

/**
 * 读文件流
 * @param url 读取文件路径
 * @returns {Promise}
 */
export const readFile = (url: string) => {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(url, { encoding: 'utf-8' }, (err, data) => {
            if (err) reject(err)
            resolve(data)
        })
    })
}


/** 获取本地存储的token */
export const getApiToken = () => {
    const API_TOKEN = execSync(`npm config get ${TOKEN_NAME}`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().replace(/\n$/, '')
    return API_TOKEN
}

/** 存储token到本地防止频发的git的变更 */
export const saveApiToken = (token: string) => {
    return new Promise((resolve) => {
        const API_TOKEN = execSync(`npm set ${TOKEN_NAME} ${token}`)
        resolve(API_TOKEN)
    })
}

/** 存储用户ID，不然token无法生效 */
export const saveUserId = (userId: string) => {
    return new Promise((resolve) => {
        const id = execSync(`npm set ${USER_ID} ${userId}`)
        resolve(id)
    })
}

/** 获取本地存储的用户ID */
export const getUserId = () => {
    const API_TOKEN = execSync(`npm config get ${USER_ID}`, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().replace(/\n$/, '')
    return API_TOKEN
}