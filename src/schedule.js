var fs = require("fs-extra");
var request = require('request');
var URL = process.env.PANT_URL_COURSE_SCHEDULE;
var URL_EXAM = process.env.PANT_URL_EXAM_SCHEDULE;
var key = process.env.PANT_API_KEY;
var appname = process.env.APPNAME;
 
if(process.env.COURSES_RELEASED.toUpperCase()=='TRUE'){
    var STUDENT_DB_PATH = "./database/"+process.env.DB_PATH+"/student.json";
    var student_database = JSON.parse(fs.readFileSync(STUDENT_DB_PATH));
    
    var COURSE_VENUE_DB_PATH = "./database/"+process.env.DB_PATH+"/venue.json";
    var course_venue_database = JSON.parse(fs.readFileSync(COURSE_VENUE_DB_PATH));
    var SLOT_DB_PATH = "./database/"+process.env.DB_PATH+"/slot.json";
    var slot_database = JSON.parse(fs.readFileSync(SLOT_DB_PATH));
}

if(process.env.EXAMS_RELEASED.toUpperCase()=='TRUE'){
    var EXAM_SLOT_DB_PATH = "./database/"+process.env.DB_PATH+"/exam.json";
    var exam_slot_database = JSON.parse(fs.readFileSync(EXAM_SLOT_DB_PATH));
}

function get_exam_schedule(exam_type,entry)
{
    var exams;
    if (exam_type.toUpperCase() == "MINOR1"){
        exams = "M1"
    }else if(exam_type.toUpperCase() == "MINOR2"){
        exams = "M2"
    }else{
        exams = "MJ"
    }
    console.log(URL_EXAM + "?entry=" + entry.toUpperCase() + "&exam_type=" + exams)
    request.get(URL_EXAM + "?entry=" + entry.toUpperCase() + "&exam_type=" + exams, {
            headers: {
                "api-key": key,
                "application-name": appname,
                "Content-Type":"application/x-www-form-urlencoded"
            }
            // ,
            // params: {
            //     "entry": entry.toUpperCase(),
            //     "exam_type": exams
            // }
        }, function(err, res, body) {
            console.log(body);
            var parsed_body = JSON.parse(body);
            if(err){
                console.log(err);
                return undefined;
            }
            var to_ret = []
            for (var sub in parsed_body){
                // console.log(parsed_body[sub])
                var obj = {}
                obj.code = parsed_body[sub].course_code
                obj.slot = parsed_body[sub].slot
                obj.date = parsed_body[sub].date
                to_ret.push(obj)
            }
            console.log(to_ret)
            return to_ret;
    });

    // exam_type = exam_type.toUpperCase().trim();
    // if(!(exam_type in exam_slot_database))
    // {
    //     return undefined;
    // }
    // else
    // {
    //     var sch = exam_slot_database[exam_type];
    //     var res = [];
    //     for(var i=0;i<sch.length;i++)
    //     {
    //         var resp = [];
    //         resp.push(sch[i][0]);
    //         for(var j=1;j<sch[i].length;j++)
    //         {
    //             for(var k=0;k<courses.length;k++)
    //             {
    //                 if(courses[k].slot === sch[i][j])
    //                 {
    //                     resp.push(courses[k]);
    //                 }
    //             }
    //         }
    //         res.push(resp);
    //     }
    //     var final = [];
    //     for(var t=0;t<res.length;t++)
    //     {
    //         if(res[t].length > 1)
    //         {
    //             final.push(res[t]);
    //         }
    //     }
    //     return final;
    // }
}
// get_exam_schedule("Minor1", "2016CS50393")

/* pass an object containing fields course and slot */
function get_class_schedule(course)
{
    var slot = course.slot.toUpperCase().trim();
    course = course.code.toUpperCase().trim();
    if(course in course_venue_database && slot in course_venue_database[course])
    {
        return {"location": course_venue_database[course][slot], "timing": slot_database[slot]};
    }
    else
    {
        return undefined;
    }
}

function get_day_schedule(day,courses)
{
    day = day.toUpperCase();
    var schedule = [];
    for(var i=0;i<courses.length;i++)
    {
        var sch = get_class_schedule(courses[i]);
        if(sch !== undefined && day in sch.timing)
        {
            schedule.push({"course":courses[i].code.toUpperCase().trim(),"slot":courses[i].slot.toUpperCase().trim(),"location":sch.location,"timing":sch.timing[day]});
        }
    }
    schedule.sort(function(a,b)
    {
        return a.timing.start.localeCompare(b.timing.start);
    });
    return schedule;
}

function get_courses(number)
{
    number = number.toUpperCase();
    if(number in student_database)
    {
        var res = student_database[number];
        res.entry = number;
        return res;
    }
    else
    {
        return undefined;
    }
}

function iscoursePresent(entry,course_code) 
{
    courses = get_courses(entry);
    course_code = course_code.toUpperCase().trim();
    courses= courses.courses;
    for(var i=0;i<courses.length;i++)
    {
        if(course_code == courses[i].code.toUpperCase().trim()){
            return true;
        }
    }
    return false;
}

function get_course_exam_date(course_code,exam_type) 
{
    course_code = course_code.toUpperCase();
    exam_type = exam_type.toUpperCase().trim();
    if(course_code in course_venue_database){
        var res = course_venue_database[course_code];
        var keys = Object.keys(res);
        var slot = keys[0];
        if(!(exam_type in exam_slot_database)){
            return undefined;
        }
        else{
            var sch = exam_slot_database[exam_type];
            for(var i=0;i<sch.length;i++){
                var resp = [];
                resp.push(sch[i][0]);
                for(var j=1;j<sch[i].length;j++){
                    if(slot == sch[i][j]){
                        return sch[i][0];
                    }
                }
            }
        }
    }
    else{
        return undefined;
    }
}

function get_week_schedule(entry)
{
    var week = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY"];
    var schedule = {};
    request.get(URL + "?entry=" + entry, {
            headers: {
                "api-key": key,
                "application-name": appname,
                "Content-Type":"application/x-www-form-urlencoded"
            }
            // ,
            // params:{
            //     "entry": "2016CS50393"
            // }
        }, function(err, res, body) {
            console.log(body);
            var parsed_body = JSON.parse(body)
            if(err){
                console.log(err);
                return undefined;
            }
            var to_ret = []
            for (var sub in parsed_body){
                var obj = {}
                obj.code = parsed_body[sub].course_code
                obj.room = parsed_body[sub].room
                obj.schedule = parsed_body[sub].schedule
                to_ret.push(obj)
            }
            console.log(to_ret)
            return to_ret;


            // result.push(synthesize(entry, body.name));          
            // return result;
            // for(var i=0;i<body.length;i++)
            // {
            //     schedule[week[i]] = get_day_schedule(week[i],courses);
            // }
            // return body.schedule;
    });
}
// get_week_schedule("2016CS50393")
function pretty_day_schedule(day,schedule)
{
    if(schedule !== undefined)
    {
        day = day.toUpperCase();
        pretty = day+":\n\n";
        for(var i=0;i<schedule.length;i++)
        {
            pretty+= schedule[i].course+"("+schedule[i].slot+") : "+schedule[i].location+" => "+schedule[i].timing.start+"-"+schedule[i].timing.end+"\n\n";
        }
        return pretty;
    }
    else
    {
        return "";
    }
}

function pretty_schedule(schedule)
{
    var str = "";
    for(var i=0;i<schedule.length;i++)
    {
        str+= schedule[i].course+"("+schedule[i].slot+") : "+schedule[i].location+" \n\t"+schedule[i].timing.start+"-"+schedule[i].timing.end+"\n";
    }
    return str;
}

function pretty_week_schedule(schedule)
{
    if(schedule !== undefined)
    {
        var pretty_sch = [];
        for(var i in schedule)
        {
            if(schedule[i] !== undefined)
            {
                pretty_sch.push(pretty_day_schedule(i,schedule[i]));
            }
            else
            {
                pretty_sch.push("");
            }
        }
        return pretty_sch;
    }
    else
    {
        return [];
    }
}

module.exports = {
    "courses" : get_courses,
    "week_schedule" : get_week_schedule,
    "day_schedule" : get_day_schedule,
    "class_schedule" : get_class_schedule,
    "exam_schedule": get_exam_schedule,
    "pretty_week" : pretty_week_schedule,
    "pretty_day" : pretty_day_schedule,
    "pretty_schedule": pretty_schedule,
    "course_exam_date" : get_course_exam_date,
    "iscoursePresent" : iscoursePresent
};