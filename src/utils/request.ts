import http from 'http'
import https from 'https'

const HeaderConfig = {
    Cookie: '_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjQ2NiwiaWF0IjoxNjQ3NDA1MjA0LCJleHAiOjE2NDgwMTAwMDR9.2IIdw5ZFCzxHLoOwRay4Sn76M1pz7uXMwOO9CVwSR8c; _yapi_uid=466',
    Accept: 'application/json, text/plain, */*'
}

export const request = (url: string) => {
    const client = /^http/.test(url) ? http : https
    return new Promise<string>((resolve, reject) => {
        const req = client.request(url, { method: 'get', headers: HeaderConfig }, (res) => {
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
