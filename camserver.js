var http = require('http');
var url = require('url');
var fs = require('fs');

var client = require('./connection.js'); //ambika
var moment = require('moment'); //ambika

//var current_time = moment().format("MMMM Do YYYY, h:mm:ss"); //ambika
var AWS = require('aws-sdk');
//AWS.config.update({region:'us-west-2'});
AWS.config.update({accessKeyId:"AKIAJBQ3H6V45DZTSVDQ",
                   secretAccessKey:"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",
                   "region":"us-west-2"});


var watson = require('watson-developer-cloud');
//var fs = require('fs');

var visual_recognition = watson.visual_recognition({
  api_key: '187902a91b81e6327e22fcd1b0366854b7492457',
  version: 'v3',
  version_date: '2016-05-20'
});

var sns = new AWS.SNS();
var sendNotif=function(object){
    var params = {
    Message: 'STRING_VALUE', /* required */
    MessageAttributes: {
      'sampleAlert': {
        DataType: 'String', /* required */
        //BinaryValue: new Buffer('...') || 'STRING_VALUE',
        StringValue: 'Some shit'
      },
      /* '<String>': ... */
    },
    MessageStructure: 'json',
    Message:'{"default":"Some more shit","email":"yay..its finally working'+object+'"}',
    Subject: 'Be alertful',
    //TargetArn: 'arn:aws:sns:us-west-2:394476956221:alertQueue',
    TopicArn: 'arn:aws:sns:us-west-2:394476956221:alertQueue'
    };
    sns.publish(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response:Q
    });
}

var server = http.createServer(function(req, res) {
var page = url.parse(req.url).pathname;
console.log(page);

// Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
if (page == '/'){
  console.log("Entered /");
    if (req.method == 'POST') {
            console.log("Entered POST");
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('You\'re at the reception desk. How can I help you?');
            //console.log(req);
            //req.on('data', function(data) {

            //var filePath = '/Users/mulumoodi/Downloads/dl.png';
            console.log("Waiting a sec");
            setTimeout(function(){
              var params = {
                images_file: fs.createReadStream('/Users/mulumoodi/Downloads/dl.png')
              };

              visual_recognition.classify(params, function(err, res) {
                if (err){
                  console.log("Somethings wrong with the service");
                  console.log(err);
                }
                else{
                  var jstring=JSON.stringify(res, null, 2);
                  console.log(jstring);
                  console.log(res["images"][0]["classes"]);
                  if(jstring.indexOf("thumb") > -1){
                      console.log("\n\nThumb is there!!!\n\n");
                      sendNotif("Thumb");
                  }
		  if(jstring.indexOf("bottle") > -1){
                      console.log("\n\nBottle is there!!!\n\n")
                  }
	          if(jstring.indexOf("key") > -1){
                      console.log("\n\nKey is there!!!\n\n")
                  }
		  if(jstring.indexOf("watch") > -1){
                      console.log("\n\nThumb is there!!!\n\n")
                  }
		  if(jstring.indexOf("clock") > -1){
                      console.log("\n\nThumb is there!!!\n\n")
                  }
                  //var obj = JSON.parse(res);
                  var obj2=res["images"][0];
                  var obj3=obj2["classifiers"][0];
                  console.log("Heyyyyy");
                  console.log(obj3["classes"]);
                  client.index({   //ambika
                    index: 'new_index',
                    type: 'scores_2',
                    body: {
                      "post_date":moment().format("MMMM Do YYYY, hh:mm:ss"),
                      "scores":obj3["classes"]
                    }
                  },function(err,resp,status) {
                    if(err) {
                      console.log(err);
                    }
                    else {
                      console.log("create",resp);
                    }
                  }) //ambika
                  fs.unlinkSync('/Users/mulumoodi/Downloads/dl.png');
                  console.log("Deletion succesful");


                }
              });

            }, 1000);




          //})

            res.write('You\'re at the reception desk. How can I help you?');
            res.end('post received');
        }
      }

/*res.writeHead(200, {"Content-Type": "text/plain"});
if (page == '/') {
res.write('You\'re at the reception desk. How can I help you?');
}
else if (page == '/basement') {
res.write('You\'re in the wine cellar. These bottles are mine!');
}
else if (page == '/floor/1/bedroom') {
res.write('Hey, this is a private area!');
}
res.end();*/
});
server.listen(8080);
