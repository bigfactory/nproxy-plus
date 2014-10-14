


var fs = require('fs');
var async = require('async');
var path = require('path');

module.exports = function(callback, options){
    var charset = options.charset || 'utf-8';

    async.concat(options.files, function(item, iterator){
        if(item.indexOf('.') === -1){
            item += '.js';
        }
        if(options.base){
            item = path.join(options.base, item);
        }
        var content = fs.readFileSync(item, {encoding : charset});
        iterator(null, content);
    }, function(err, result){
        callback(err, result.join(''))
    });

};
