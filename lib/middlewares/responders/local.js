var fs =require('fs');
var path = require('path');
var mime =require('mime');
var utils = require('../../utils');
var log = require('../../log');

function respondFromLocalFile(pattern, options, req, res, next){
  var filePath = options.file;
  var url = req.url;

  if(!utils.isAbsolutePath(filePath)){
    throw new Error('Not a valid file path');
  }

  fs.stat(filePath, function(err, stat){
    if(err){
      log.error(err.message + 'for (' + url + ')' +
          ' then directly forward it!');
      res.status(500).end();
    }else{
      if(stat.isFile()){ // local file
        utils.writeFileStream(filePath, req, res, next);
      }else if(stat.isDirectory()){ // directory mapping
        var urlWithoutQS = utils.processUrlWithQSAbandoned(url);
        var directoryPattern = url.match(pattern)[0];
        extDirectoryOfRequestUrl = urlWithoutQS.substr(
            urlWithoutQS.indexOf(directoryPattern) + directoryPattern.length);
        localDirectory = path.join(filePath, 
            path.dirname(extDirectoryOfRequestUrl));

        utils.findFile(localDirectory, 
            path.basename(extDirectoryOfRequestUrl),
            function(err, file){
              log.debug('Find local file: ' + file + ' for (' + url + ')');
              if(err){
                log.error(err.message + ' for (' + url + ')' + 
                    ' then directly forward it!');
                next();
              }else{
                utils.writeFileStream(file, req, res, next);
              }
        });
      }
    }
  });

}



module.exports = respondFromLocalFile;