var fs = require('fs');
var path = require('path');
var mime =require('mime');
var responders = {
  local : require('./responders/local'),
  web : require('./responders/web'),
  concat : require('./responders/concat'),
  combo : require('./responders/combo'),
  'kissy-combo' : require('./responders/kissy-combo')
};
var utils = require('../utils');
var log = require('../log');

var httpRxg = /^http/;
var imgRxg = /(\.(img|png|gif|jpg|jpeg))$/i

/**
 * Respond to the request with the specified responder if the url
 * matches the defined url pattern from the responder list file.
 * The following three kinds of responders are supported.
 * 1. Single file (from local or internet)
 * 2. Combo file
 * 3. Directory Mapping
 * 4. custom function(for other combo cases)(TODO)
 *
 * @param {String} responderListFilePath 
 */
function respond(responderListFilePath, watchPath){
  var responderList = _loadResponderList(responderListFilePath);
  
  var timer;

  function loadResponderListFile(){
    clearTimeout(timer);
    timer = setTimeout(function(){
      log.warn('The rule file has been modified!');
      responderList = _loadResponderList(responderListFilePath);
    }, 100);
  }

  //watch the rule file
  _watchRuleFile(responderListFilePath, loadResponderListFile);

  if(watchPath && watchPath != responderListFilePath){
    _watchRuleFile(watchPath, loadResponderListFile);
  }

  return function respond(req, res, next){
    var url = utils.processUrl(req);
    var pattern; // url pattern
    var originalPattern;
    var responder;
    var options;

    var matchFn;
    var matchInfo;
    var matched = false;
    var respondObj;
    var stat;

    /**
     * For directory mapping
     */
    var extDirectoryOfRequestUrl;
    var localDirectory;


    var imgFileBasePath;

    log.debug('respond: ' + url);

    for(var i = 0, len = responderList.length; i < len; i++){
      respondObj = responderList[i];
      originalPattern = respondObj.pattern;
      responder = respondObj.responder;
      options = respondObj.options;

      // adapter pattern to RegExp object or function
      if(
        typeof originalPattern !== 'string' && 
        !(originalPattern instanceof RegExp) &&
        typeof originalPattern !== 'function'
        ){
        log.error('Illegal pattern');
        throw new Error('pattern must be a RegExp Object or a string for RegExp');
      }

      if(typeof originalPattern === 'string'){
        matchFn = _matchByString;
        matchInfo = originalPattern;
      }
      else if(originalPattern instanceof RegExp){
        matchFn = _matchByRegx;
        matchInfo = originalPattern;
      }
      else if(typeof originalPattern == 'function'){
        matchFn = originalPattern;
        matchInfo = 'custom function';
      }

      pattern = originalPattern;

      if(matchFn(url, pattern, req, res)){
        log.info('matched url: ' + url);
        log.debug('pattern: ' + matchInfo);
        matched = true;

        if(typeof responder == 'function'){
          log.debug('custom responder');
          responder(pattern, options, req, res, next);
          return;
        }

        //log.debug('before fix responder: ' + responder);

        //responder = fixResponder(url, pattern, responder);

        //log.debug('after fix responder: ' + responder);

        if( ! responders[responder]){
          log.error('responder '+responder+' not exist');
          throw new Error('responder not exist');
          res.send(500);
          return;
        }

        responders[responder](pattern, options, req, res, next);
        
        break;
      }
    }

    if(!matched){

      // log.info('forward: ' + url);
      next();
    }
  }
};

/**
 * For some responder with regular expression variable like $1, $2, 
 * it should be replaced with the actual value
 * 
 * @param {Regular Express Object} pattern matched array
 * @param {String} responder, replaced string
 */
function fixResponder(url, pattern, responder){
  var $v = /\$\d+/g;
  var m;
  var newRx;
  if(!$v.test(responder)){
    return responder;
  }

  m = url.match(pattern);

  if(!Array.isArray(m)){
    return responder;
  }

  for(var i = 0, l = m.length; i < l; i++){
    newRx = new RegExp('\\$' + i, 'g');
    responder = responder.replace(newRx, m[i]);
  }

  return responder;
}

/**
 * match url by Regx
 * @param {String} url the url string
 * @param {Regx} pattern
 */
function _matchByRegx(url, pattern){
  return pattern.test(url);
}

function _matchByString(url, pattern){
  log.debug(url);
  log.debug(pattern)
  return url.indexOf(pattern) >= 0; 
}

/**
 * Watch the rule file to support applying changed rules without restart the proxy
 *
 * @param {String} file the path of the file
 * @param {Function} callback
 */
function _watchRuleFile(file, callback){
  log.debug('watch path: '+file);
  if(!file){
    return;
  }
  fs.watch(file, function(curr, prev){
    callback();
  });
};

/**
 * Load the list file and return the list object
 *
 * @param {String} responderListFilePath
 * @return {Array} responder list
 * 
 * @api private
 */
function _loadResponderList(responderListFilePath){
  var filePath = responderListFilePath;

  if(typeof filePath !== 'string'){
    return null;
  }

  if(!fs.existsSync(responderListFilePath)){
    throw new Error('File doesn\'t exist!');
  }

  if(!utils.isAbsolutePath(responderListFilePath)){
    filePath = path.join(process.cwd(), filePath);
  }

  return _loadFile(filePath);
}

/**
 * Load file without cache
 *
 * @return {Array} load list from a file
 */
function _loadFile(filename){
  var module = require(filename);
  delete require.cache[require.resolve(filename)];
  return module;
}

module.exports = respond;