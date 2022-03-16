"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
var http_1 = __importDefault(require("http"));
var https_1 = __importDefault(require("https"));
var HeaderConfig = {
    Cookie: '_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjQ2NiwiaWF0IjoxNjQ3NDA1MjA0LCJleHAiOjE2NDgwMTAwMDR9.2IIdw5ZFCzxHLoOwRay4Sn76M1pz7uXMwOO9CVwSR8c; _yapi_uid=466',
    Accept: 'application/json, text/plain, */*'
};
var request = function (url) {
    var client = /^http/.test(url) ? http_1.default : https_1.default;
    return new Promise(function (resolve, reject) {
        var req = client.request(url, { method: 'get', headers: HeaderConfig }, function (res) {
            var chunk = ''; // api文件容器
            res.on('data', function (data) {
                chunk += data;
            });
            res.on('end', function () {
                resolve(chunk);
            });
        });
        req.on('error', function (e) {
            reject(e);
        });
        req.end();
    });
};
exports.request = request;
//# sourceMappingURL=request.js.map