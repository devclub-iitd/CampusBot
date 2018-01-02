var fs = require("fs-extra");
var STUDENT_DB_PATH = "./database/"+process.env.DB_PATH+"/student.json";
 
var STUDENT_DB = JSON.parse(fs.readFileSync(STUDENT_DB_PATH));

function get_name(entry_no){
	entry_no = entry_no.toUpperCase().trim();
	if(entry_no in STUDENT_DB){
		return STUDENT_DB[entry_no]["name"];
	}
	return undefined;
}

module.exports = get_name;