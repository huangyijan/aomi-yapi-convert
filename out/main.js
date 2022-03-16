"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var saveFile_1 = require("./saveFile");
var utils_1 = require("./utils");
var request_1 = require("./request");
var format_1 = __importDefault(require("./format"));
var baseUrl = "http://yapi.miguatech.com"; // 基礎前綴
var demoUrl = '/api/interface/list?page=1&limit=200&project_id=445'; // 接口分頁
var projectMenuUrl = '/api/interface/list_menu?project_id=445'; // 菜單列表
var ApiNameRegex = /[\/|\-|_|{|}]+([a-zA-Z])/g; // 獲取接口名稱
var pathHasParamsRegex = /\{(.*)\}/g; // 獲取接口名稱
var getOneApiConfig = function (path) {
    var dealNamePath = path.startsWith('/') ? path.substring(1) : path;
    var isHaveName = pathHasParamsRegex.test(dealNamePath);
    var requestParams = '(options)';
    var requestPath = isHaveName ? "`".concat(path.replace(pathHasParamsRegex, function (item, p1) {
        requestParams = "(".concat(p1, ", options)");
        return "$".concat(item);
    }), "`") : "'".concat(path, "'");
    var requestName = dealNamePath.replace(ApiNameRegex, function (_, item) {
        return item.toUpperCase();
    });
    requestName = requestName.substring(requestName.length - 1) === '}' ? requestName.substring(0, requestName.length - 1) : requestName;
    return { requestName: requestName, requestPath: requestPath, requestParams: requestParams };
};
var configApiFileBuffer = function (fileBufferStringChunk) {
    fileBufferStringChunk.unshift('export default {');
    fileBufferStringChunk.unshift("import { fetch } from '@/service/fetch/index'");
    fileBufferStringChunk.push('}');
    return (0, format_1.default)(fileBufferStringChunk);
};
var getPathSet = function (list) {
    var pathSet = {}; // 处理文件夹命名的容器
    var fileBufferStringChunk = [];
    list.forEach(function (item) {
        // 配置注釋
        fileBufferStringChunk.push("/**\n   * api: ".concat(item.title, "\n   * updateTime: ").concat(new Date(item.up_time * 1000).toLocaleDateString(), "\n   */"));
        // 配置接口Item項
        var _a = getOneApiConfig(item.path), requestName = _a.requestName, requestPath = _a.requestPath, requestParams = _a.requestParams;
        fileBufferStringChunk.push("".concat(requestName, ": ").concat(requestParams, " => {\n    return fetch(").concat(requestPath, ", {\n    ...options,\n    method: '").concat(item.method, "'\n    })\n  },"));
        // 统计接口名
        var pathName = (0, utils_1.getPathName)(item.path);
        pathSet[pathName] ? pathSet[pathName]++ : pathSet[pathName] = 1;
    });
    var fileBufferString = configApiFileBuffer(fileBufferStringChunk);
    return { pathSet: pathSet, fileBufferString: fileBufferString };
};
var getApiDoc = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var fileString, MenuList, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, request_1.request)(url)];
            case 1:
                fileString = _a.sent();
                try {
                    MenuList = JSON.parse(fileString);
                    data = MenuList.data;
                    data.forEach(function (item) {
                        console.log("\u5F53\u524D\u6784\u5EFA\u83DC\u5355\u540D\u79F0\uFF1A".concat(item.name));
                        var list = item.list;
                        var _a = getPathSet(list), pathSet = _a.pathSet, fileBufferString = _a.fileBufferString;
                        var FileName = (0, utils_1.getMaxTimesObjectKeyName)(pathSet);
                        console.log("\u63A8\u8350\u4F7F\u7528\u83DC\u5355\u540D\uFF1A ".concat(FileName));
                        (0, saveFile_1.saveFile)("./api/".concat(FileName, ".js"), fileBufferString);
                    });
                }
                catch (error) {
                    console.log(error);
                }
                console.log(fileString);
                return [2 /*return*/];
        }
    });
}); };
getApiDoc(baseUrl + projectMenuUrl);
//# sourceMappingURL=main.js.map