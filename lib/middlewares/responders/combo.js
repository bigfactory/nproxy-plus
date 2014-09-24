

var comboHandler = require('combo-handler');

module.exports = function(pattern, options, req, res, next){
	var handler = comboHandler(options);
	handler(req, res, next);
};