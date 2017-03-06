var express = require('express');
var router = express.Router();
var http         = require('http');
var https        = require('https');

/* GET users listing. */
router.get('/', function(req, res, next) {

	var url = req.query.sentURL || null;
	if(url){
		traceURL(url, req, res);
	}else{
		noURL(res)
	}

});

function traceURL(url, req, res){

	return new Promise(function(resolve, reject){
    //The response object to return
    var json = {
      responses : []
    };

    function get(url) {
      var regex = /https:/gi;
      var h = http;
      if(regex.exec(url)) { h = https; }
      h.get(url, (response) => {

        response.on('data', () =>{
          // console.log('data'); 
        });

        response.on('end', () => {
          // console.log('end');
        });

        var data = {
          status : response.statusCode,
          url : url
        };
        json.responses.push(data);

        if(response.statusCode === 200){
          // resolve(json);
          done(json, res);
        } else {
          get(response.headers.location);
        }

      }).on('error', function(err){
  	    console.error(err);
        reject({error : err});
  	  });
    }

    get(url);

  });

}

function done(json, res){
	
	res.render('path', 
		{ 
			title 		: 'Redirect Tracker',
			response 	: JSON.stringify(json),
			errorMsg 	: null
		}
  );

}

function noURL(res){

	res.render('path', { 
  		title 		: 'Redirect Tracker',
  		url 			: '',
  		errorMsg 	: 'No URL provided'
  	}
  );

}

module.exports = router;
