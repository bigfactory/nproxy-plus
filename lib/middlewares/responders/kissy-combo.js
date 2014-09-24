

var kmc = require('kmc');
var util = require('../../utils');

module.exports = function(pattern, options, req, res, next){
	var tmpFilePath = '/tmp/kmc.js';

	kmc.config(options);

	kmc.build(options.input, tmpFilePath);

	util.writeFileStream(tmpFilePath, req, res, next);

};