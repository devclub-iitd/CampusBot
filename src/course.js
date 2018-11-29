var fs = require("fs-extra");
var request = require('request');
var URL = process.env.PANT_URL_COURSE;
var key = process.env.PANT_API_KEY;
var appname = process.env.APPNAME;

// var COURSES_DB_PATH ="./database/"+process.env.DB_PATH+"/courses.json";

// var course_db = JSON.parse(fs.readFileSync(COURSES_DB_PATH));

function get_course(code)
{
	code = code.toUpperCase();

    request.post(URL, {
            headers: {
                "api-key": key,
                "application-name": appname,
                "Content-Type":"application/x-www-form-urlencoded"
            },
            form:{
                "course_code": code.toUpperCase()
            }
        }, function(err, res, body) {
            console.log(body);
            if(err){
                console.log(err);
                return undefined;
            }
            return body;
    });
}
// get_course("COL215")

function pretty_course(course)
{
	if(course === undefined)
	{
		return "";
	}
	else
	{
		var pretty = course.name+" ["+course.limit+"]\n\nCredit = "+course.credit+"\n\nSlot = "+course.slot +"\n\nStructure = "+course.structure + "\n\nCourse Coordinator: " + course.coordinator;
		return pretty;
	}
}

module.exports = {
	get_course: get_course,
	pretty_course: pretty_course
};