aomi-yapi-convert(针对yapi文档转js或者ts文件的自动化npm插件)

## 功能
1. 支持转ts、js API文件
2. js文件支持jsDoc版本和simple注释版本
3. ts文件支持Ts版本和simple注释版本
4. 支持自定义配置生成api文件位置
5. 支持自定义配置axios路径和axiosName来配置个人封装的请求框架
6. 支持自定义配置baseUrl,不配置默认取项目的baseUrl(服务端不一定会有)
7. 支持自定义配置生成api文件名
8. 支持增加任意自定义形参及默认值
9. 支持根据个人风格偏好选择导出文件导出的格式

这个工具能帮你做些什么？

1. 帮你完成交互搬运工作
2. 减少你经常搬运错误的情况
3. 获得来自后台同事为你写的字段以及参数提示，不用频繁来回切文档页面去看文档
4. 获得来自axios的配置提示，避免老是忘记配置项参数要去看文档的问题
5. api文件即是注释，api文件即是文档，获得良好的开发体验

## 安装

Using npm: 

```bash
$ npm install aomi-yapi-convert

```

Using yarn: 

```bash
$ yarn add aomi-yapi-convert

```

虽然是是开发工具，属于开发环境依赖，但是因为常用api配置项用了我依赖内的axios配置提示，如果项目构建环境没有将注释移除的话，不清楚会不会有依赖丢失的错误。所以推荐将其作为生产发布环境依赖，这个后面再求证

### 怎么使用

如果不想在package.json里面添加额外的script,可以在终端运行下方命令，会自动触发交互命令行，生成配置文件

```bash
$ npx aomi-yapi-convert
```

虽然上面的命令也能满足使用，但是毕竟不方便也不太好记，每次更新都要打一遍，还是推荐在项目package.json添加script:

```
 "scripts": {
    "build:api": "aomi-yapi-convert",
  },
```

这样就可以愉快的使用自己想用的命令，而不用添加npx。直接通过 ```npm run build:api ``` 或者 ```yarn build:api``` 来更新api文件了。

以添加script为示例，我们看下实际生成的效果

![you need proxy to see the image](https://github.com/huangyijan/aomi-yapi-convert/raw/master/example/yapi-terminal.png)

然后你就会发现在根目录会生成一个api.config.json的配置文件。目前暂时的配置约定是这样的

```
const targetJson = {
  protocol: '', // 协议头https: 或http: 由文档地址决定
  host: '', // example: baidu.com
  version: '', // ts/js 两种版本，type类型分别是TsType类型和jsdoc类型
  isNeedType : boolean, 这里设置是否需要js doc类型，建议设置为true。会有非常完善的提示，来自后台的配置注释我迁移过来了
  outputStyle: 'default', // 支持值defaultExport, nameExport, anonymous,分别对应了默认导出，具名导出，匿名函数导出
  axiosFrom: '', // 这里配置自定义的请求目录，考虑到大部分时候我们都用axios的包，所以使用axios作为默认请求，你也可以使用自定义的请求。
  axiosName: '', // 这里配置自定义的请求Name,这里改成ssr的this指针挂载方式
  customer: [ // 这里设置自定义的参数类型，该类型会添加进入请求的形参,支持传入任意数量形参，建议使用project里面的来定义，可能存在同一个项目调用不同的业务线api的情况
   {
     name: 'name', // 形参名
     default: 'base' // 默认值
   }
  ],
  projects: [ // 可以通过传入多个project项来完成添加不同项目的api文件
    {
      projectId: 445, // 项目id
      outputDir: '', // 统一的文件生成路径，请注意默认文件夹是src/api目录，如果该目录下已经有文件了，建议在该目录起一个子目录名称：ep: src/api/auto/.
      isLoadFullApi: false, // 这里配置是否全量加载api文件，原有项目已经有api的文件，请设置为false局部更新，全量更新会生成重复代码，徒增冗余
      prefix: '', // 一般该项设置为空，但我注意到部分接口服务端不配置服务名（比如超市的接口），需要前端手动添加，所以加了该配置项。这个配置项加了之后会在该项目组下所有接口添加这个字符串
      customer: [ // 这里设置自定义的参数类型，该类型会添加进入请求的形参,支持传入任意数量形参，不设置会默认继承全局的。
        {
          name: 'name', // 形参名
          default: 'base' // 默认值
        }
      ],
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

好了，走到一步了，如果没有出现意外的话，你会在src/api（如果输出文件路径没有修改的话）目录下看到由插件自动化生成api文件。示例(ts/js)：

![you need proxy to see the image](https://github.com/huangyijan/aomi-yapi-convert/raw/master/example/yapi-code-ts.png)
![you need proxy to see the image](https://github.com/huangyijan/aomi-yapi-convert/raw/master/example/yapi-code-js.png)

然后就可以愉快使用了。使用的时候将会获得非常良好的提示体验。

使用示例：
![you need proxy to see the image](https://github.com/huangyijan/aomi-yapi-convert/raw/master/example/yapi-use-demo.png)
