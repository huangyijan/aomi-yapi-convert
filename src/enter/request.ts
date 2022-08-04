import http from 'http'
import https from 'https'
import { run } from './auth'
import { refreshToken } from './auth'
import { getHeader } from '../utils'

export const request = (url: string) => {
    const client = /^http/.test(url) ? http : https
    return new Promise<string>((resolve, reject) => {
        const req = client.request(url, { method: 'get', headers: getHeader() }, (res) => {
            let chunk = '' // api文件容器
            res.on('data', data => {
                chunk += data
            })

            res.on('end', () => {
                if (chunk.length < 200) return reject(chunk)
                resolve(chunk)
            })
        })
        req.on('error', e => {
            reject(e)
        })
        req.end()
    })
}

export const handleApiRequestError = (error: string) => {
    if (error.includes('40011')) {
        console.log('\n\x1b[33m', 'token 已经过期， 请从yapi文档获取最新token')
        refreshToken().then(() => run())
    } else {
        console.log(error)
    }
}