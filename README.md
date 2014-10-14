# NProxy-Plus

基于[Nproxy](https://github.com/goddyZhao/nproxy)开发的本地代理转发服务器

## 安装

    npm install -g nproxy-plus

## 使用 

本地编写一个匹配规则文件，命名为例如rule.config.js:

    var proxy = require('nproxy-plus');

    module.exports = [
      //替换单个本地文件
      {
        pattern : 'http://nproxy6.com/a.js',
        responder : 'local',
        options : {
          file: '/repos/nproxy/test/support/files/replaced/c1.js'
        }
      },

      //映射到本地路径
      {
        pattern : 'http://nproxy6.com/xx/',
        responder : 'local',
        options : {
          file: '/repos/nproxy/test/support/files/replaced/'
        }
      },

      //替换单个网络文件
      {
        pattern : 'http://nproxy6.com/b.js',
        responder : 'web',
        options : {
          file: 'http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js'
        }
      },

      //本地concat
      {
        pattern : 'http://nproxy6.com/c.js',
        responder : 'concat',
        options : {
          dir : '/repos/nproxy/test/support/files/replaced/',
          files: [
            'c1.js',
            'c2.js',
            'c3.js',
            'c1.js'
          ]
        }
      },

      //网络combo
      {
        pattern : 'http://nproxy6.com/??c1.js,c2.js,js/he.js',
        responder : 'combo',
        options : {
          base: '/repos/nproxy/test/support/files/replaced/'
        }
      },


      //kissy模块实时编译
      {
        pattern : 'http://nproxy6.com/d.js',
        responder : 'kissy-combo',
        options : {
          packages: [{
            'name': 'mt',
            'path': '/repos/tb-buy/mt',
            'charset': 'gbk'
          }],
          input: '/repos/tb-buy/mt/index.js' 
        }
      },

      //使用自定义函数实现更复杂的匹配条件
      {
        pattern : function(url, pattern, req, res){
          if(req.query.local && req.cookies.user == 'john'){
            return true;
          }
          return false;
        },
        responder : function(pattern, options, req, res, next){
          var html = xtemplateCompiler('xxx');
          res.send(html);
        },
        options : {
          tplPath: '/repos/nproxy/test/support/files/tpl/'
        }
      },

      //混合响应模式
      //下例中分别从网络、本地、本地concat以及本地kissy实时合并的结果混合后返回给浏览器
      {
        pattern: 'http://nproxy6.com/??aa.js,bb.js,cc.js,dd.js',
        responder: proxy.mix(
          proxy.route('fetch', 'http://www.remote.com/aa.js'),
          proxy.route('local', '/repos/nproxy/replaced/bb.js'),
          proxy.route('concat', {
            base : '/gitlab/tm/buy/src/',
            files : [
                'app',
                'data',
                'util',
                'init'
            ]
          }),
          proxy.route('kissy', {
            packages: [{
              'name': 'mt',
              'path': '/repos/tb-buy/mt',
              'charset': 'gbk'
            }],
            input: '/repos/tb-buy/mt/index.js' 
          })
        )
      }
    ];

运行以下命令启动服务器

    nproxy -l rule.config.js 

设置浏览器代理为 127.0.0.1:8989

### 更多启动选项:

    用法: nproxy [options]

    选项:

      -h, --help         输出使用方法
      -V, --version      输出版本号
      -l, --list [list]  指定匹配规则文件
      -p, --port [port]  指定监听端口号
      -t, --timeout [timeout] 设置请求超时时间
      -w, --watch [path] 本地监听目录，当目录中的文件修改时重现加载匹配规则文件，默认只监听匹配规则文件

### 规则配置
  
    pattern : {String|Regx|Function} 匹配规则，可以是字符串，正则表达式和自定义函数
      当为函数，匹配规则时，该函数会传递以下参数调用
      function(url, pattern, req, res){}
      url : 当前url
      pattern : 当前函数引用
      req : express的Request对象
      res : express的Response对象
      函数返回true表示规则匹配命中，返回false表示规则匹配失败

    responder : {String|Function} 
      当为字符串，表示使用内置插件输入，当前支持的插件有
      local : 本地文件或路径
      web : 网络文件
      concat : 本地文件根据配置打包
      combo : 本地文件根据url combo格式打包
      kissy-combo : 根据配置中的kissy配置输出实时编译后的kissy包内容

      当为函数，在规则匹配命中后会调用此函数进行输出，该函数会传递以下参数调用
      function(pattern, options, req, res, next){}
      pattern : 匹配规则
      options : 配置信息
      req : express的Request对象
      res : express的Response对象
      next : express的next方法

    options : {Object} 配置信息，在获取输出时会传递到插件函数中

### 混合模式的responder

  往往有时候会遇到这种情况，对于一个combo请求，一部分内容需要从网络上获取，一部分内容则来自本地
  
  混合式响应就是为了解决这种问题

  可以使用nproxy-plus中的mix方法产生一个混合式响应
  
  以下配置分别从网络、本地、本地concat、本地kissy实时合并以及一个自定义函数输出的的结果混合后返回给浏览器

    var proxy = require('nproxy-plus');
  
    function sayHi(callback, name){
      var content = 'hello' + name;
      callback(null, content);
    }
  
    module.exports = {
      pattern: 'http://nproxy6.com/??aa.js,bb.js,cc.js,dd.js',
      responder: proxy.mix(
        proxy.route('fetch', 'http://www.remote.com/aa.js'),
        proxy.route('local', '/repos/nproxy/replaced/bb.js'),
        proxy.route('concat', {
          base : '/gitlab/tm/buy/src/',
          files : [
              'app',
              'data',
              'util',
              'init'
          ]
        }),
        proxy.route('kissy', {
          packages: [{
            'name': 'mt',
            'path': '/repos/tb-buy/mt',
            'charset': 'gbk'
          }],
          input: '/repos/tb-buy/mt/index.js' 
        })，
        proxy.route(sayHi, 'world')
      )
    };

proxy.route接收一个字符串或者自定义函数，作为内容加工函数

内置的四种函数为 fetch local concat kissy

## 为什么要用Nproxy-Plus

本地代理服务器做的事情大同小异，可以将流程抽象化为：

* 匹配URL
* 输出本地(或者远端)内容

Nproxy-Plus实现了一个简单的服务器框架，并提供基本的处理函数

开发者可以在这个框架的基础上，自定义搭建适合业务使用的代理环境



## License

NProxy-Plus is available under the terms of the MIT License
