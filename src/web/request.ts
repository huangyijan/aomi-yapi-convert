import { getHeader } from '../utils'


export const request = (url: string, method = 'get') => {
    document.cookie = getHeader().Cookie
    return new Promise<string>((resolve, reject) => {
        const http = new XMLHttpRequest()

        http.open(method, url, true)
        http.withCredentials = true

        http.setRequestHeader('Accept', getHeader().Accept)

        http.onreadystatechange = function () {
            if (http.readyState == 4 && http.status == 200) {
                resolve(http.responseText)
            } else {
                reject(http.responseText)
            }
        }

        http.send()
    })
}

export const handleApiRequestError = (error: string) => {
    if (error.includes('40011')) {
        console.log('\n\x1b[33m', 'token 已经过期， 请从yapi文档获取最新token')
    } else {
        console.log(error)
    }
}