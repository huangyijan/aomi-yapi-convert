import http from 'http'
import https from 'https'


const getHeader = (token: string) => {
    const HeaderConfig = {
        Cookie: `_yapi_token=${token}; _yapi_uid=466`,
        Accept: 'application/json, text/plain, */*'
    }
    return HeaderConfig
}

export const request = (url: string, token: string) => {
    const client = /^http/.test(url) ? http : https
    return new Promise<string>((resolve, reject) => {
        const req = client.request(url, { method: 'get', headers: getHeader(token) }, (res) => {
            let chunk = '' // api文件容器
            res.on('data', data => {
                chunk += data
            })

            res.on('end', () => {
                resolve(chunk)
            })
        })
        req.on('error', e => {
            reject(e)
        })
        req.end()
    })
}
