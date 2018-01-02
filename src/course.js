var fs = require("fs-extra");

var COURSES_DB_PATH ="./database/"+process.env.DB_PATH+"/courses.json";

var course_db = JSON.parse(fs.readFileSync(COURSES_DB_PATH));

function get_course(code)
{
	code = code.toUpperCase();
	if(code in course_db)
	{
		var temp = course_db[code];
		temp.code = code;
		return temp;
	}
	else
	{
		return undefined;
	}
}

function pretty_course(course)
{
	if(course === undefined)
	{
		return "";
	}
	else
	{
		var pretty = course.name+" ["+course.code+"]\n\nCredit = "+course.credit+"\n\nSlot = "+course.slot +"\n\nStructure = "+course.structure + "\n\nCourse Coordinator: " + course.coordinator;
		return pretty;
	}
}

module.exports = {
	get_course: get_course,
	pretty_course: pretty_course
};