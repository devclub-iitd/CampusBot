var natural = require('natural');
var fs = require("fs-extra");
var SAVE_FILE = process.env.USE_SAVE_FILE;

var classifier = new natural.BayesClassifier();

function classify(dialog, callback){
	console.log("Save file: " + SAVE_FILE);
	if(fs.existsSync(SAVE_FILE)){
		natural.BayesClassifier.load(SAVE_FILE, null, function(err, classifier) {
	    	if(err){
	    		console.log(err);
	    		console.log("Classification Failed");
	    	}else{
	    		console.log("Classified");
	    		callback(classifier.classify(dialog));
			}
		});
	}else{
		console.log("Could not find the trained file");
	}
}

module.exports = {
	classify: classify
};