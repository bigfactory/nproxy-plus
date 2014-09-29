
module.exports = [
  //自定义输出
  {
    pattern : '/switchy/rulelist',
    responder : function(pattern, options, req, res, next){
      res.sendFile('/static/rule.ini');
    }
  },

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
  }
];