var http         = require('http');
var https        = require('https');

var url = process.argv[2];

(!url) ? done() : get(url);

function get(url){

	if(url[4] === 's'){ // if https
	  https.get(url, function(response){
	    console.log(response.statusCode);
	    console.log(response.headers.location);
	    if(response.statusCode == '302'){
	      get(response.headers.location)
	    }
	  }).on('error', function(err){
	    console.error(err);
	  });	
	} else { // else http
		  http.get(url, function(response){
	    console.log(response.statusCode);
	    console.log(response.headers.location);
	    if(response.statusCode == '302'){
	      get(response.headers.location)
	    }
	  }).on('error', function(err){
	    console.error(err);
	  });
	}
}

function done(){
	console.log('Please provide a url in the terminal. For example, node server.js http://google.com');
}