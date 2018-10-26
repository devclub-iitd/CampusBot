var builder = require('botbuilder');
var builder_cognitiveservices = require("botbuilder-cognitiveservices");
var azure = require('botbuilder-azure'); 
var request = require('request');
var bodyParser = require('body-parser');

// Custom JS for various functionalities 
var entry2name = require('./src/entry2name');
var whois = require('./src/whois');
var events = require('./src/events');
var schedule = require('./src/schedule');
var course = require('./src/course');
var intelligence = require('./src/intelligence');
var verificationController = require('./src/FBverification');
// var messageWebhookController = require('./src/messageWebhook');

var MICROSOFT_APP_ID = process.env.MICROSOFT_APP_ID;
var MICROSOFT_APP_PASSWORD = process.env.MICROSOFT_APP_PASSWORD;
var LUIS_SUBSCRIPTION_KEY = process.env.LUIS_SUBSCRIPTION_KEY;
var QNA_KNOWLEDGE_ID = process.env.QNA_KNOWLEDGE_ID;
var QNA_SUBSCRIPTION_KEY = process.env.QNA_SUBSCRIPTION_KEY;
var AZURE_DOCUMENT_DB_URI = process.env.AZURE_DOCUMENT_DB_URI;
var AZURE_DOCUMENT_DB_KEY = process.env.AZURE_DOCUMENT_DB_KEY;
var COURSES_RELEASED = process.env.COURSES_RELEASED;

if(COURSES_RELEASED.toUpperCase()=='TRUE'){
    COURSES_RELEASED=true;
}
else{
    COURSES_RELEASED=false;
}

var EXAMS_RELEASED = process.env.EXAMS_RELEASED

if(EXAMS_RELEASED.toUpperCase()=='TRUE'){
    EXAMS_RELEASED=true;
}
else{
    EXAMS_RELEASED=false;
}




var introMessage = ['Main functionalities are described below-\n\nProfile : Say \'hi\' or \'setup\' at any time to setup your profile.\n\nFAQ : Say \'faq\' or \'question answer\' to ask the bot a FAQ about insti',
'Class Schedule : Ask the bot "My schedule for the week" or "Monday schedule" or "schedule tomorrow" to get your lecture schedule.',
'Who is :   Ask the bot \'Who is Name/EN\' to find students in the institute with that Name/EN.\n\nEvents :   Ask \'events\' to find upcoming events in the campus (from facebook).',
'Course info :  Ask "Course information COL216" or "details of COL331 course to see some details about that course.\n\n'
];

var talk_to_bot = false;
var talk_to_human = false;

// Create chat connector for communicating with the Bot Framework Service
// console.log();
var connector = new builder.ChatConnector({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
});

var documentDbOptions = {
    host: AZURE_DOCUMENT_DB_URI, 
    masterKey: AZURE_DOCUMENT_DB_KEY, 
    database: 'botdocs',   
    collection: 'botdata'
};

var docDbClient = new azure.DocumentDbClient(documentDbOptions);
var cosmosStorage = new azure.AzureBotStorage({ gzipData: false }, docDbClient);
var inMemoryStorage = new builder.MemoryBotStorage();

// var bot = new builder.UniversalBot(connector).set('storage', cosmosStorage);;
var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);;

bot.endConversationAction('goodbye', 'Goodbye :)', { matches: /^(goodbye)|(bye)|(exit)|(end)|(quit)/i });



// var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/8ada66e7-cfe5-4f02-beb9-80fffec5e15c?subscription-key='+LUIS_SUBSCRIPTION_KEY+'&verbose=true&timezoneOffset=0&q=');
// var intents = new builder.IntentDialog({ recognizers: [recognizer] });

var recognizerqna = new builder_cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: QNA_KNOWLEDGE_ID,
    subscriptionKey: QNA_SUBSCRIPTION_KEY
});
    
var basicQnAMakerDialog = new builder_cognitiveservices.QnAMakerDialog({
    recognizers: [recognizerqna],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3}
);    
    
    
// bot.dialog('/', intents);
bot.dialog('/', [
    function(session, args, next){
        if((!talk_to_bot) && (!talk_to_human)){    
            if(!session.userData.en || !session.userData.name){
                builder.Prompts.text(session, "Hi! I am Campus-Bot. If you want to talk to the club members please type in (message) and if you want to interact with me please type in (bot)");
                next();
                // session.beginDialog('/profile');
            }
            else{
                builder.Prompts.text(session, "Hi " + session.userData.name + "! I am Campus-Bot. If you want to talk to the club members please type in (message) and if you want to interact with me please type in (bot)");
                next();
            }
        }else{
            next();
        }
    },
    function(session, results, next){
        if((!talk_to_bot) && (!talk_to_human)){
            if(results.response){
                if((results.response === "bot") || (results.response  === "(bot)")){
                    talk_to_bot = true;
                    talk_to_human = false;
                    next()
                }else{
                    session.send('Hi! Send your message to the club members\n Type <end> to end chat with members and chat with Campus-Bot');        
                    talk_to_human = true;
                    talk_to_bot = false;
                    session.beginDialog('/messagePage');
                }
            }else{
                talk_to_human = false;
                talk_to_bot = false;
                session.endDialog("Invalid Response. You can call again by saying Hi");
            }
        }else if(talk_to_bot){
            next();
        }else{
            if(results.response === undefined){
                talk_to_bot = false;
                talk_to_human = false;
                session.beginDialog('/');
            }else{
                session.beginDialog('/messagePage');        
            }
        }
    },
    function (session, args, next) {
        // session.beginDialog('/main');
        intelligence.classify(session.message.text, function(data){
            if(data != ""){
                session.beginDialog(String(data));
            }else{
                session.beginDialog('/main');
            }
        });        
    }
]);

// bot.dialog('/bot', [
//     function(session, args, next){
//         intelligence.classify(session.message.text, function(data){
//             session.beginDialog(String(data));
//         });
//     },
//     function(session, args, next){
//         session.replaceDialog('/bot');
//     } 
// ]);

// intents.matches('main','/main');
// intents.matches('events', '/events');
// intents.matches('schedule', '/schedule');
// intents.matches('whois', '/whois');
// intents.matches('exam','/exam');
// intents.matches('qna','/qna');
// intents.matches('course','/course');
// intents.matches('profile', '/profile');
bot.beginDialogAction('help', '/help', { matches: /^help/i });
// bot.beginDialogAction('end', '/end', { matches: /^help/i });
// intents.matches('developers','/developers');
// intents.matches('repeat', '/repeat');
// intents.matches('messagePage','/messagePage');

// intents.onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."));

/*
bot.dialog('/',[
    function(session)
    {
        console.log(session);
        session.endDialog("to be implemented");
    }
]);
*/

bot.dialog('/bot', function(session){
    session.beginDialog('/main');
});

bot.dialog('/main',[
    function(session,args,next) {
        if(!session.userData.en || !session.userData.name){
            session.beginDialog('/profile');
        }
        else{
            next();
        }
    },
    function(session,args,next) {
        builder.Prompts.choice(session, "What would you like to get (type end to quit)?", "Message Page|Upcoming Events|Class Schedule|Who is|Exam Schedule|Course Info|Profile Setup| Help|Developers");
    },
    function(session,results){
        if(results.response){
            if(results.response.entity === 'Exit'){
                talk_to_human = false;
                talk_to_bot = false;
                session.endDialog("Thanks for using. You can chat again by saying Hi");
            }
            else{
                switch(results.response.entity){
                    case "Upcoming Events":
                        session.beginDialog('/events');
                        break;
                    case "Class Schedule":
                        session.beginDialog('/schedule');
                        break;
                    case "Who is":
                        session.beginDialog('/whois');
                        break;
                    case "Profile Setup":
                        session.userData.en = undefined;
                        session.userData.name = undefined;
                        session.beginDialog('/profile');
                        break;
                    case "Exam Schedule":
                        session.beginDialog('/exam');
                        break;
                    case "Course Info":
                        session.beginDialog('/course');
                        break;
                    case "Developers":
                        session.beginDialog('/developers');
                        break;
                    case "Help":
                        session.beginDialog('/help');
                        break;
                    case "Message Page":
                        session.send('Hi! Send your message to the page admins\n Type end to chat with Campus-Bot');
                        session.beginDialog('/messagePage');
                        break;
                    // case "Complaint":
                    //     session.beginDialog('/complaint');
                        // break;
                    // case "Converse":
                    //     session.beginDialog('/converse');
                    //     break;
                    // case "Papers Download":
                    //     session.beginDialog('/papers');
                    //     break;
                    // case "Mess Schedule":
                    //     session.beginDialog('/mess');
                    //     break;
                    // case "FAQ":
                    //     session.beginDialog('/qna');
                    //     break;
                    // case "Course Review":
                    //     session.beginDialog('/review');
                    //     break;
                    // case "Course Material":
                    //     session.beginDialog('/material');
                    //     break;
                    // case "TimePass":
                    //     session.beginDialog('/converse');
                    //     break;
                }
            }
        }
        else{
            talk_to_human = false;
            talk_to_bot = false;
            session.endDialog("Invalid Response. You can call again by saying Hi");
        }
    },
    function (session, results) {
        // The menu runs a loop until the user chooses to (quit).
        session.replaceDialog('/main');
    }
]);

bot.dialog('/help',[
    function(session)
    {
        if(talk_to_bot){ 
            var introCard = new builder.HeroCard(session)
                    .title("Campus Bot")
                    .text("Your own campus assistant")
                    .images([
                        builder.CardImage.create(session, "https://s24.postimg.org/jwjmzedid/dev.png")
                    ]);
            var msg = new builder.Message(session).attachments([introCard]);
            session.send(msg);
            introMessage.forEach(function(ms){
                session.send(ms);
            });
            session.endDialog();
        }
        // session.replaceDialog('/main');
    }
]);

bot.dialog('/profile', [
    function (session, args, next) {
        builder.Prompts.text(session, "Hi! Do you have your entry number? (Yes/No)");
    },function (session, results, next) {
        if(results.response.toLowerCase().match("yes")){
            next()
        }else{
            session.send("We are sorry but External people can't interact with Campus-Bot.");
            talk_to_bot = false;
            talk_to_human = false;
            session.replaceDialog('/');
            // session.endDialog();
        }
    },function (session, args, next) {
        builder.Prompts.text(session, "What is your entry number?");
    },
    function (session, results, next) {
        if (results.response) {
            session.userData.en = results.response.toUpperCase();
            session.userData.name = entry2name(session.userData.en);
            if(session.userData.name === undefined) {
                session.send("Invalid Entry Number Given. Please try again");
                session.replaceDialog('/profile');
            }
            else{
                var name = session.userData.name.split(" ")[0].toLowerCase();
                session.userData.name = name[0].toUpperCase()+name.substring(1);
                session.send('Hi '+session.userData.name+", Welcome to CampusBot");
            }
        }
        session.replaceDialog('/main');
        // session.endDialog();
    }
]);

bot.dialog('/whois', [
    function (session,args,next) {
      var nameoren = [];
      try {
        nameoren = builder.EntityRecognizer.findAllEntities(args.entities, 'whoisent');
      }
      catch(e) {
        nameoren = [];
      }
      if (!nameoren || nameoren.length === 0) {
         builder.Prompts.text(session, 'Give me the Entry number you want to lookup');
      } else {
        var name ="";
        for( var i =0; i<nameoren.length-1;i++)
        {
            name += nameoren[i].entity + " ";
        }
        name += nameoren[nameoren.length-1].entity;
        next({ response: name });
      }
    },
    function (session, results) {
        var result = whois.identify(results.response);
        if(result.length === 0) {
            session.send("No matches found. Please try again.");
        }
        else {
            var attach = [];
            // result = whois.priority(result,session.userData.en);
            // if(result.length > 4){
            //     session.send("Your query was too general. Here are top 4 results personalized for you :");
            // }
            for(var i=0;i<result.length && i < 4;i++){
                attach.push(
                    new builder.HeroCard(session)
                        .title(result[i].name)
                        .text("Entry - "+result[i].entry+"\n"+"Email - "+result[i].email)
                    );
            }
            var msg = new builder.Message(session)
                    .attachments(attach);
            session.send(msg);
        }
        session.replaceDialog('/main');
        // session.endDialog();
    }
]);

bot.dialog('/developers', [
    function (session) {
        session.send('The Developers are : \n1. Aman Agrawal \n2. Suyash Agrawal \n3. Madhur Singhal');
        session.replaceDialog('/main');
        // session.endDialog();
    }
]);

// bot.dialog('/repeat', [
//     function (session) {
//         builder.Prompts.text(session, 'Hi! I repeat everything!');
//     },
//     function (session, results) {
//         session.send(results.response);
//         session.endDialog();
//     }
// ]);

bot.dialog('/events',[
    function(session,args)
    {
        events.get_events(function(result){
            var attach = [];
            result.forEach(function(ev){
                var card = new builder.ThumbnailCard(session)
                            .title(ev.name)
                            .subtitle(ev.start_time+" - "+ev.end_time)
                            .tap(
                                builder.CardAction.openUrl(session,ev.link)
                            );
                if(ev.cover){
                    card = card.images([builder.CardImage.create(session,ev.cover)]);
                }
                attach.push(card);
            });
            var msg = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments(attach);
            session.replaceDialog('/main');
            // session.endDialog(msg);
        });
    }
]);

bot.dialog('/exam',[
    function(session){
        if(EXAMS_RELEASED==false){
            session.endDialog("Exam Schedule not yet updated!\nCheck after schedule has been released");
        }
        else{
            builder.Prompts.choice(session,"Select exam","Minor1|Minor2|Major");
        }
    },
    function(session,results)
    {
        if((["MINOR1","MINOR2","MAJOR"]).includes(results.response.entity.toUpperCase())){
            if(!session.userData.en){
                session.beginDialog('/profile');
            }
            var courses = schedule.courses(session.userData.en);
            if(courses){
                session.userData.exam_type = results.response.entity;
                var sch = schedule.exam_schedule(results.response.entity,courses.courses);
                if(sch.length === 0){
                    var attach = [];
                    attach.push(
                        new builder.HeroCard(session)
                            .title("Woohoo! No Exams :D")
                            .subtitle("Have fun")
                    );
                    var msg = new builder.Message(session)
                                    .attachments(attach);
                }
                else{
                    var week = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
                    for(var day in sch){
                        var attach = [];
                        var parts = sch[day][0].split("/");
                        var dt = new Date(parseInt(parts[2], 10),
                                          parseInt(parts[1], 10) - 1,
                                          parseInt(parts[0], 10));
                        session.send(dt.toDateString());
                        for(var i=1;i<sch[day].length;i++){
                            var c = course.get_course(sch[day][i].course);
                            var slot = sch[day][i].slot;
                            attach.push(
                                new builder.HeroCard(session)
                                    .title(c.code+"("+slot+")")
                                    .subtitle(c.name)
                            );
                        }
                        var msg = new builder.Message(session)
                                    .attachments(attach);
                        session.send(msg);
                    }
                    // session.endDialog("All the Best for Exams");
                    session.send("All the Best for Exams");
                    session.replaceDialog('/main');
                }
            }
            else{
                // session.endDialog("Sorry, some error occurred");
                session.send("Sorry, some error occurred");
                session.replaceDialog('/main');
            }
        }
        else{
            // session.endDialog("You entered an invalid response");
            session.send("You entered an invalid response");
            session.replaceDialog('/main');
        }
    }
]);

bot.dialog('/schedule',[
    function(session,args,next) {
        if(COURSES_RELEASED==false){
            session.endDialog("Enjoy your Vacations !\nCheck after schedule has been released");
        }
        else{
            session.dialogData.arrr = args;
            if (!session.userData.en) {
                builder.Prompts.text(session, "What's your entry number?");
            } else {
                next();
            }
        }
    },
    function(session,results){
        var days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
        var day = undefined;
        try{
            var str = session.dialogData.arrr.entities[0].resolution.values[0].timex;
            if(str.substr(0,9)==="XXXX-WXX-"){
                day = days[parseInt(str[9])];
            }
            else if(str.substr(0,4)==="XXXX"){
                day = new Date(Date.now()).getFullYear()+str.substr(4);
                day = days[new Date(str).getDay()];
            }
            else{
                day = days[new Date(str).getDay()];
            }
        } catch(e) {
            day = undefined;
        }
        session.dialogData.arrr = undefined;

        if (results.response) {
            session.userData.en = results.response;
        }
        var courses = schedule.courses(session.userData.en);
        if(courses !== undefined)
        {
            var week = schedule.week_schedule(courses.courses);
            if(day === undefined)
            {
                for(var i in week)
                {
                    var attach = [];
                    if(week[i] !== undefined)
                    {
                        for(var c in week[i])
                        {
                            attach.push(
                                    new builder.ThumbnailCard(session)
                                        .title(week[i][c].course)
                                        .text(week[i][c].location+": "+week[i][c].timing.start+"-"+week[i][c].timing.end)
                            );
                        }
                        var msg = new builder.Message(session)
                            .textFormat(builder.TextFormat.markdown)
                            .attachmentLayout(builder.AttachmentLayout.carousel)
                            .attachments(attach);
                        session.send(i);
                        session.send(msg);
                    }
                }
            }
            else
            {
                if(["SUNDAY","SATURDAY"].includes(day))
                {
                    session.send(day+" is a holiday!");
                }
                else
                {
                    var attach = [];
                    day = day.toUpperCase();
                    for(var i in week[day])
                    {
                        attach.push(
                            new builder.ThumbnailCard(session)
                                .title(week[day][i].course)
                                .text(week[day][i].location+": "+week[day][i].timing.start+"-"+week[day][i].timing.end)
                            );
                    }
                    var msg = new builder.Message(session)
                            .attachments(attach);
                    session.send(day);
                    session.send(msg);
                }
            }
        }
        else
        {
            session.userData.en = undefined;
            session.send("Invalid entry number provided!");
        }
        session.replaceDialog('/main');
        // session.endDialog();
    }
]);

bot.dialog('/course',[
    function(session,args,next){
        if(COURSES_RELEASED==false){
            session.endDialog("Enjoy your Vacations !\nCheck after schedule has been released");
        }
        else{
            var coursecode = undefined
            try{
                coursecode = builder.EntityRecognizer.findEntity(args.entities, 'courseent');
            }
            catch(e){
                coursecode = undefined
            }
            if (!coursecode) {
                builder.Prompts.text(session,"Give me the course code");
            } else {
                next({ response: coursecode.entity });
            }
        }
    },
    function(session,results) {
        var c = course.get_course(results.response);
        if(c === undefined) {
            session.send("No such course code found!");
        }
        else {
            session.send(course.pretty_course(c));
        }
        session.replaceDialog('/main');
        // session.endDialog();
    }
]);


// bot.dialog('/qna', [
//     function (session) {
//         builder.Prompts.text(session, 'Ask me anything!');
//     },
//     function (session, results) {
//         var postBody = '{"question":"' + results.response + '"}';
//         console.log(postBody)
//             request({
//                 url: "https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/"+QNA_KNOWLEDGE_ID+"/generateAnswer",
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Ocp-Apim-Subscription-Key': QNA_SUBSCRIPTION_KEY
//                 },
//                 body: postBody
//             },
//             function (error, response, body) {
//                 var result;
//                 result = JSON.parse(body);
//                 result = result.answers[0];
//                 if(result.score < 50){
//                     session.endDialog('Did not find a good answer for yout question :(')
//                 }
//                 else{
//                     session.endDialog(result.answer);
//                 }
//             }
//             );
//         session.endDialog();
//     }
// ]);

bot.dialog('/messagePage', [
    function (session) {
    },
    function (session, results) {
        session.replaceDialog('/messagePage');
    }
]);



// Functions to be implemented with new study portal
/*
bot.dialog('/papers', [
    function (session, args, next) {
        if (!session.userData.en) {
            builder.Prompts.text(session, "What's your entry number?");
        } else {
            next();
        }
    },
    function (session, results) {
      if (results.response) {
        session.userData.en = results.response;
        }
        var http = require('http');
        var options = {
            host: 'www.cse.iitd.ernet.in',
            path: '/aces-acm/api?entry='+ session.userData.en
        };
        http.get(options, function(resp){
          resp.on('data', function(chunk){
          });
        }).on("error", function(e){
          session.send("Got some error, please try later");
        });
        // var message = new builder.Message(session)
        //     .attachments([{
        //         name: "Question Paper",
        //         contentType: "application/zip",
        //         contentUrl: "https://www.cse.iitd.ernet.in/aces-acm/download/"+ session.userData.en.toUpperCase() + ".zip"
        //     }]);
        //
        var message = new builder.Message(session)
                .attachments([
                    new builder.HeroCard(session)
                        .title("Exam Papers")
                        .subtitle("Magna was never so easy :P")
                        .buttons([builder.CardAction.downloadFile(session,"https://www.cse.iitd.ernet.in/aces-acm/download/"+ session.userData.en.toUpperCase() + ".zip","Download")])
                ]);
        session.endDialog(message);

    }
]);

bot.dialog('/complaint', [
    function (session, args, next) {
        if(!session.userData.name){
            builder.Prompts.text(session, "What's your Name?");
        }
        else{
        next();
        }
    },
 function (session,results,next) {
        if (results.response) {
             session.userData.name = results.response;
        }
        if(!session.userData.en){
            builder.Prompts.text(session, "What's your Entry No.?");
        }
        else{
        next();
        }
    },
    function (session,results,next) {
        if (results.response) {
             session.userData.en = results.response;
        }
        builder.Prompts.text(session, "Enter the subject of your complaint");
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.sub = results.response;
        }
        builder.Prompts.text(session, "Describe the complaint in detail");
    },
    function (session, results) {
        if (results.response) {
            session.dialogData.desc = results.response;
        }
        builder.Prompts.text(session, "Who is/are responsible for the matter mentioned in the complaint?");
    },
    function (session, results) {
       if (results.response) {
            session.dialogData.resp = results.response;
        }
        session.send("Your complaint is about "+session.dialogData.sub+". The detailed description is "+session.dialogData.desc+" and people responsible are "+session.dialogData.resp);
        var request = require("request");
        var options = { method: 'POST',
          url: 'http://www.cse.iitd.ernet.in/aces-acm/api',
          headers:
           { 'postman-token': '504d20da-90fb-ec0b-fa29-7c90d5652c36',
             'cache-control': 'no-cache',
             'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' },
          formData:
           { action: 'postcomplaint',
             Subject: session.dialogData.sub,
             Description: session.dialogData.desc,
            'People In-Charge': session.dialogData.resp,
             Name: session.userData.name,
            'Entry Number': session.userData.en } };
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          console.log(body);
        });
        session.endDialog();
     }
]);

bot.dialog('/mess',[
    function(session,args,next) {
        session.dialogData.arrr = args;
        builder.Prompts.text(session, "Which Hostel?");
    },
    function(session,results)
    {
        var days = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
        var day = undefined;
        try
        {
            var str = session.dialogData.arrr.entities[0].resolution.date;
            if(str.substr(0,9)==="XXXX-WXX-")
            {
                day = days[parseInt(str[9])];
            }
            else if(str.substr(0,4)==="XXXX")
            {
                day = new Date(Date.now()).getFullYear()+str.substr(4);
                day = days[new Date(str).getDay()];
            }
            else
            {
                day = days[new Date(str).getDay()];
            }
        }
        catch(e)
        {
            day = undefined;
        }
        if(day === undefined)
        {
            var dd = new Date(Date.now());
            var day =dd.toLocaleDateString('en-US',{weekday: "long", timeZone: "Asia/Kolkata"});
            day = day.toUpperCase();
        }
        session.dialogData.arrr = undefined;

        if (results.response) {
            session.userData.hostel = results.response;
        }
        var hostel = mess.get_mess_hostel(session.userData.hostel);
        if(hostel!==null)
        {
            var menu_day = mess.get_mess_day(hostel,day);
            var pretty_menu = mess.pretty_mess(menu_day);
            session.send(pretty_menu[0]);
            session.send(pretty_menu[1]);
            session.send(pretty_menu[2]);
        }
        else
        {
            session.userData.hostel = undefined;
            session.send("Invalid Hostel provided!");
        }
        session.endDialog();
    }
]);

bot.dialog('/converse', [
    function(session,args,next)
    {
        if(args.in_conv !== "yes")
        {
            builder.Prompts.text(session, "Hi!, what would you like to talk about? (type \"end\" to exit)");
        }
        else
        {
            builder.Prompts.text(session,args.msg);
        }
    },
    function(session,results)
    {
        var check;
        // console.log(results.response);
        if((typeof results.response !== 'undefined') && results.response){
            check = results.response.toUpperCase().trim();
        }
        if(check === "END" || check === "\"END\"")
        {
            session.send("Thank you for chatting :)");
            session.endDialog();
        }
        else
        {

		cleverbot.write(results.response, function (response) {
     		session.endDialog();
                session.beginDialog('/converse',{in_conv: "yes",msg: response.message});
    		});


        }
    }
]);

bot.dialog('/material', [
    function(session) {
        builder.Prompts.choice(session,"Do you want to contribute material or download it?","Download|Contribute|View Repository");
    },
    function(session,results)
    {
        if(results.response.entity.toUpperCase() === "DOWNLOAD")
        {
            session.beginDialog('/download');
        }
        else if(results.response.entity.toUpperCase() === "CONTRIBUTE")
        {
            // console.log("Function was here");
            session.beginDialog('/upload');
        }
        else if(results.response.entity.toUpperCase() === "VIEW REPOSITORY")
        {
            session.beginDialog('/view_repo');
        }
        else
        {
            session.endDialog("You entered an invalid response");
        }
    }
]);

bot.dialog('/upload',[
    function(session,args,next)
    {
        // console.log("still going right");
        builder.Prompts.text(session,"Enter course code of material being uploaded");
    },
    function(session,results)
    {
        // console.log("what happened? = "+results.response);
        session.dialogData.course = results.response;
        if(!dropbox.correct(session.dialogData.course))
        {
            session.endDialog("You entered an invalid course code!");
        }
        else
        {
            builder.Prompts.attachment(session,"Please attach and send the file to be uploaded");
        }
    },
    function(session,results)
    {
        if(results.response.length === 0)
        {
            session.endDialog("You didn't upload any attachment");
        }
        else
        {
            results.response.forEach(
                function(attachment)
                {
                    console.log(attachment);
                    dropbox.put(session.dialogData.course,attachment.contentUrl,function(){console.log("Uploaded");});
                }
            );
        }
        session.endDialog("Thank you for contributing");
    }
]);

bot.dialog('/download',[
    function(session)
    {
        builder.Prompts.text(session,"Enter code of course that you want to download");
    },
    function(session,results)
    {
        session.dialogData.course = results.response;
        if(!dropbox.correct(session.dialogData.course))
        {
            session.endDialog("You entered an invalid course code!");
        }
        else
        {
            try
            {
                dropbox.get(session.dialogData.course,function(link)
                    {
                        // console.log(link);
                        var message = new builder.Message(session)
                                    .attachments([
                                        new builder.HeroCard(session)
                                            .title(link.name)
                                            .subtitle("Course Material")
                                            .buttons([builder.CardAction.downloadFile(session,link.url,"Download")])
                                    ]);
                        session.endDialog(message);
                    });
            }
            catch(e)
            {
                session.endDialog("Sorry, some error occurred :(");
            }

        }
    }
]);

bot.dialog('/view_repo',[
    function(session)
    {
        builder.Prompts.text(session,"Enter code of course that you want to download");
    },
    function(session,results)
    {
        session.dialogData.course = results.response;
        if(!dropbox.correct(session.dialogData.course))
        {
            session.endDialog("You entered an invalid course code!");
        }
        else
        {
            try
            {
                dropbox.list(session.dialogData.course,function(files)
                    {
                        // console.log(link);
                        var attach = [];
                        files.entries.forEach(
                            function(val)
                            {
                                attach.push(
                                    new builder.ThumbnailCard(session)
                                        .title(val.name)
                                        .subtitle(dropbox.convert(val.size))
                                );
                            }
                        );
                        var message = new builder.Message(session)
                                    .attachments(attach);
                        session.endDialog(message);
                    });
            }
            catch(e)
            {
                session.endDialog("Sorry, some error occurred :(");
            }

        }
    }
]);

bot.dialog('/review', [
    function (session, args) {
		builder.Prompts.text(session, "What's the name of the course?");
    },
    function (session, results, next) {
        if (results.response) {
			session.dialogData.cod = results.response;
			if(review.get_course(results.response)===undefined){
				session.send("Invalid response. Say 'review' again to retry.")
                session.endDialog();
			}
            else
            {
                var res = review.get_reviews(results.response);
                if(res===undefined){
                    session.send("Invalid response. Say 'review' again to retry.")
                    session.endDialog();
                }
                else
                {
        			if(res.length==0){
        				session.send("Sorry there are no reviews yet.");
        			}
        			else{
        				session.send("Reviews for this course are - ");
        				for(var i=0;i<res.length;i++){
        					session.send(res[i]);
        				}
        			}
        			builder.Prompts.text(session, "Would you like to add a review for this course?");
                }
            }
        }
        else{
            session.send("Invalid response. Say 'review' again to retry.")
			session.endDialog();
		}
    },
    function (session, results) {
        if (results.response) {
			var rr = results.response;
			rr = rr.toUpperCase();
			if(rr=="YES"||rr=="YEAH"||rr=="Y"){
				builder.Prompts.text(session, "What is your review?");
			}
			else{
                session.send("Okay.");
				session.endDialog();
			}
		}
       // session.endDialog();
    },
	function (session, results) {
		if (results.response) {
            review.record_review(session.dialogData.cod,results.response);
            session.send("Thanks! Your review has been recorded.");
        }
        session.endDialog();
    }
]);

*/


// Setup Restify Server
var restify = require('restify');
var server = restify.createServer();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended:true}));
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});


// Listen for messages from users 
server.get('/', verificationController);
// server.post('/message', messageWebhookController);
server.post('/', connector.listen());
