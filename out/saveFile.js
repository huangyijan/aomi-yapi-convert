"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFile = exports.GetSafePath = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var GetSafePath = function (relativePath) {
    var filePath = path_1.default.resolve(relativePath);
    var createDir = function (filePath) {
        var dirPath = path_1.default.dirname(filePath);
        try {
            fs_1.default.accessSync(dirPath);
        }
        catch (e) {
            createDir(dirPath);
            fs_1.default.mkdirSync(dirPath);
        }
    };
    createDir(filePath);
    return filePath;
};
exports.GetSafePath = GetSafePath;
/**
 * 存儲方法
 * @param url 存儲目標路徑
 * @param file 存儲文件
 */
var saveFile = function (url, file) {
    fs_1.default.writeFile((0, exports.GetSafePath)(url), file, { encoding: 'utf-8' }, function (err) {
        console.log(err);
    });
};
exports.saveFile = saveFile;
//# sourceMappingURL=saveFile.js.map