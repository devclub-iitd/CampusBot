// var jsonFile = (process.env.NODE_ENV=="development")?"./database/name_database.json":"D:\\home\\site\\wwwroot\\messages\\database\\name_database.json";
// var fs = require("fs-extra");
// var request = require('ajax-request');
// var FormData = require('form-data');
// var http = require('http');
var request = require('request');
// var STUDENT_DB_PATH = "./database/"+process.env.DB_PATH+"/student.json";
var URL = process.env.PANT_URL_WHOIS;
var key = process.env.PANT_API_KEY;
var appname = process.env.APPNAME;
// var STUDENT_DB = JSON.parse(fs.readFileSync(STUDENT_DB_PATH));

function getmail(entry){
	return entry_to_uid(entry)+"@iitd.ac.in";
}

function synthesize(entry,name){
	return {
		"name":name,
		"entry": entry,
		"email": getmail(entry)
	};
}

//TODO: Properly Implement this function
// function sort_priority(result,en){

// 	var temp = [];
// 	if(en===undefined)
// 		return result;
// 	en = en.toUpperCase();
// 	var year = en.substr(0,4);
// 	var dept = en.substr(4,2).toUpperCase();
// 	var j=0;
// 	for(var i =0;i<result.length;i++)
// 	{
// 		if(result[i]['entry'].substr(0,4)===year)
// 		{
// 			temp[j++]=result[i];
// 		}
// 	}
// 	j=0;
// 	var temp1=[];
// 	for(var i=0;i<temp.length;i++)
// 	{
// 		if(temp[i]['entry'].substr(4,2)===dept)
// 		{
// 			temp1[j++]=temp[i];
// 		}
// 	}
// 	var ans =[];
// 	j=0;
// 	for(var i=0;i<temp1.length;i++)
// 	{
// 		ans[j++]=temp1[i];	
// 	}
// 	for(var i=0;i<temp.length;i++)
// 	{
// 		if(!ans.includes(temp[i]))
// 		{
// 			ans[j++]=temp[i];
// 		}
// 	}
// 	for(var i=0;i<result.length;i++)
// 	{
// 		if(!ans.includes(result[i]))
// 		{
// 			ans[j++]=result[i];
// 		}
// 	}
// 	return ans;	
// }

function match(query, key, name){

	name = name.toUpperCase().replace(/\s\s+/g, ' ');
	query = query.toUpperCase().replace(/\s\s+/g, ' ');
	if(query === key){
		return true;
	}

	if(query.length > 2 && (query == name || name.split(" ").includes(query))){
		return true;
	}
	return false;
}

function entry_to_uid(entry){
	return entry.substr(4,3).toLowerCase()+entry.substr(2,2)+entry.substr(7,4);
}

function get_form(details){
	var formBody = [];
	for (var property in details) {
	  var encodedKey = encodeURIComponent(property);
	  var encodedValue = encodeURIComponent(details[property]);
	  formBody.push(encodedKey + "=" + encodedValue);
	}
	formBody = formBody.join("&");
	return formBody;
}	

function get_data(entry) {
	var result = [];
	// entry = entry.toUpperCase();
	// console.log(appname);
	// console.log(key);
	// var formData = new FormData();
	// formData.append("uid", entry_to_uid(entry));
	// var body = {
	// 	"uid": entry
	// }
	// var formBody = [];
	// formBody = get_form(body);
	// console.log(formBody);
	request.post(URL, {
			// url: URL,
			// contentType: 'application/x-www-form-urlencoded',
			// headers: {
			// 	"api-key": key,
			// 	"application-name": appname
			// },
			headers: {
		        "api-key": key,
		        "application-name": appname,
		        "Content-Type":"application/x-www-form-urlencoded"
		      },
		    form:{
		    	"uid": entry.toLowerCase()
		    }
			// body: require('querystring').stringify(body)
		}, function(err, res, body) {
			// console.log(res);
			console.log(body);
			if(err){
				console.log(err);
				return [];
			}
			result.push(synthesize(entry, body.name));			
			return result;
	});
	// for (var key in STUDENT_DB){
	// 	if(match(name,key,STUDENT_DB[key]["name"])){
	// 		result.push(synthesize(key,STUDENT_DB[key]["name"]));
	// 	}
	// }
	// return result;
}

function make_story(data) {
	return data.name+"\n\nEntry No. "+data.entry+"\n\nContact at - "+data.email+"\n\n";
}
// get_data("CS5160393");

module.exports = {
	identify: get_data,
	// story: make_story,
	// priority: sort_priority
};
