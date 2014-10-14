
var request = require('request');

module.exports = function(callback, url){

    request(url, function (err, res, body) {
        if(err){
            console.log(arguments)
            console.error(err)
            throw err;
            return;
        }

        callback(null, body);
    })
};
