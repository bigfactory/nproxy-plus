
var fs = require('fs');

module.exports = function(callback, file, charset){
    charset = charset || 'utf-8';

    var content = fs.readFileSync(file, {encoding : charset});
    callback(null, content);
};
