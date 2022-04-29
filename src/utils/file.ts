import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
const TOKEN_NAME = 'API_TOKEN'
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

type CallBack = (res: NodeJS.ErrnoException | null) => void

/**
 * 存儲方法
 * @param url 存儲目標路徑
 * @param file 存儲文件
 */
export const saveFile = (url: string, file: string | NodeJS.ArrayBufferView, call?: CallBack) => {
    fs.writeFile(GetSafePath(url), file, { encoding: 'utf-8' },
        (res) => {
            if(call) call(res)
            // console.log('📗', `Api文件${url}:更新${res ? '失败' : '成功'}`)
        }
    )
}

/**
 * 读文件流
 * @param url 读取文件路径
 * @returns {Promise}
 */
export const readFile = (url: string) => {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(url, { encoding: 'utf-8' }, (err, data) => {
            if(err) reject(err)
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