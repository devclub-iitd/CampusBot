var fs = require("fs-extra");
var csv = require("fast-csv");
var natural = require('natural');
var SAVE_FILE = process.env.SAVE_FILE;
var TRAINING_DATA = process.env.TRAINING_DATA;
var classifier = new natural.BayesClassifier();

function fileread(path, training_data, train_classifier){
	fs.createReadStream(path)
	.pipe(csv())
	.on('data', function(data){
		training_data.push(data);
		console.log(training_data.length);
	})
	.on('end', function(data){
		console.log("read finished");
		train_classifier(training_data);
	});
}

function main(){
	var training_data = [];
	fileread(TRAINING_DATA, training_data, train_classifier);
}

function train_classifier(training_data){
	for(var i = 0; i<training_data.length; i++){
		classifier.addDocument(training_data[i][0], training_data[i][1]);
	}
	classifier.train();
	classifier.save(SAVE_FILE, function(err, classifier) {
		if(err){
			console.log(err);
			console.log("Error Occurred while saving. Please delete training.csv in database folder and restart this script.");
		}else{
			console.log("Training Finished");
		}
	});	
}

main();