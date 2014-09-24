
module.exports = [
  {
    pattern : 'http://nproxy6.com/a.js',
    responder : 'local',
    options : {
      file: '/Users/john/Work/repos/nproxy/test/support/files/replaced/c1.js'
    }
  },

  {
    pattern : 'http://nproxy6.com/xx/',
    responder : 'local',
    options : {
      file: '/Users/john/Work/repos/nproxy/test/support/files/replaced/'
    }
  },

  {
    pattern : 'http://nproxy6.com/b.js',
    responder : 'web',
    options : {
      file: 'http://g.tbcdn.cn/kissy/k/1.4.0/seed-min.js?t=20140909'
    }
  },

  {
    pattern : 'http://nproxy6.com/c.js',
    responder : 'concat',
    options : {
      dir : '/Users/john/Work/repos/nproxy/test/support/files/replaced/',
      files: [
        'c1.js',
        'c2.js',
        'c3.js',
        'c1.js'
      ]
    }
  },

  {
    pattern : 'http://nproxy6.com/??c1.js,c2.js,js/he.js',
    responder : 'combo',
    options : {
      base: '/Users/john/Work/repos/nproxy/test/support/files/replaced/'
    }
  },

  {
    pattern : 'http://nproxy6.com/d.js',
    responder : 'kissy-combo',
    options : {
      packages: [{
        'name': 'mt',
        'path': '/Users/john/Work/repos/tb-buy/mt',
        'charset': 'gbk'
      }],
      input: '/Users/john/Work/repos/tb-buy/mt/index.js' 
    }
  }
];