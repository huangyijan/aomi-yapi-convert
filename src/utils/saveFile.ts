import fs from 'fs'
import path from 'path'

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
    fs.writeFile(GetSafePath(url), file, { encoding: 'utf-8' },
        (res) => {
            console.log(`Api文件${url}:存储${res ? '失败' : '成功'}`)
        }
    )
}

