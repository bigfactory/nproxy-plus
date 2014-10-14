
var fs = require('fs');
var kmc = require('kmc');

module.exports = function(callback, options){
    var charset = options.charset || 'utf-8';
    var tmpFilePath = '/tmp/kmc.js';
    kmc.config(options);
    kmc.build(options.input, tmpFilePath);

    var content = fs.readFileSync(tmpFilePath, {encoding : charset});
    callback(null, content);
};