aomi-yapi-convert(针对公司内部使用的yapi文档转js或者ts文件的自动化npm插件)

## 安装

Using npm: 

```bash
$ npm install aomi-yapi-convert

```

Using yarn: 

```bash
$yarn add aomi-yapi-convert
```

### 怎么使用

如果不想在package.json里面添加额外的script,可以在终端运行下方命令，会自动触发交互命令行，生成配置文件

```bash
$ npx aomi-yapi-convert
```

不过还是推荐在项目package.json添加script:

```
 "scripts": {
    "build:api": "aomi-yapi-convert",
  },
```

这样就可以愉快的使用自己想用的命令，而不用添加npx。直接通过 ```npm run build:api ``` 或者 ```yarn build:api``` 来更新api文件了。

以添加script为示例，我们看下实际生成的效果

![exampleTerminal](https://github.com/huangyijan/aomi-yapi-convert/raw/master/example/yapi-terminal.png)

然后你就会发现在根目录会生成一个api.config.json的配置文件。目前暂时的配置约定是这样的

```
const targetJson = {
  protocol: '', // 协议头https: 或http: 由文档地址决定
  host: '', // example: baidu.com
  token: '', // 如果token失效了，请通过yapi文档里面的cookie获取最新的token，这里token失效比较麻烦，后面再考虑有没有更好的方法
  version: '', // 目前只支持jsdoc版本，设置默认就可以了
  "isNeedType": boolean, 这里设置是否需要js doc类型，建议设置为true。会有非常完善的提示，来自后台的配置注释我迁移过来了
  axiosFrom: '', // 这里配置自定义的请求目录，考虑到大部分时候我们都用axios的包，所以使用axios作为默认请求，你也可以使用自定义的请求。
  projects: [ // 可以通过传入多个project项来完成添加不同项目的api文件
    {
      projectId: 445, // 项目id
      outputDir: '', // 统一的文件生成路径，请注意默认文件夹是src/api目录，如果该目录下已经有文件了，建议在该目录起一个子目录名称：ep: src/api/auto/.
      isLoadFullApi: false, // 这里配置是否全量加载api文件，原有项目已经有api的文件，请设置为false局部更新，全量更新会生成重复代码，徒增冗余
      prefix: '', // 一般该项设置为空，但我注意到部分接口后台不写服务名（比如超市的接口），需要前端手动添加，所以加了该配置项。这个配置项加了之后会在该项目组下所有接口添加这个字符串
      group: [
        {
          catId: 8366, // 后台项目下的菜单id
          outputDir: '', // 可以自定义生成文件路径，不设置继承project的路径
          fileName: '' // 如果不喜欢程序生成的文件名可以自定义文件名
        }
      ]
    },
    { 
      projectId: 220,
      outputDir: '',
      isLoadFullApi: true
    }
  ]
}
```

好了，走到一步了，如果没有出现意外的话，你会在src/api（如果输出文件没有修改的话）目录下看到由插件自动化生成api文件。示例：

![exampleTerminal](https://github.com/huangyijan/aomi-yapi-convert/raw/master/example/yapi-code.png)

然后就可以愉快使用了。使用的时候将会获得非常良好的提示体验。

使用示例：
![exampleTerminal](https://github.com/huangyijan/aomi-yapi-convert/raw/master/example/yapi-use-demo.png)
