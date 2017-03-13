var express = require('express');
var router = express.Router();
var http         = require('http');
var https        = require('https');

/* GET users listing. */
router.get('/', function(req, res, next) {

	var url = req.query.sentURL || null;
	console.log(url);
	(url) ? traceURL(url, req, res) : noURL(res);

});

function traceURL(url, req, res){

  var imageUrl = req.query.imageURL;

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

        // response.on('data', () =>{
        //   // console.log('data');
        // });
        //
        // response.on('end', () => {
        //   // console.log('end');
        // });

        var urlType = determineURLType(url);
        var data = {
          status : response.statusCode,
          url : url,
          urlType : urlType,
          imageUrl : imageUrl
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

function determineURLType(url){
  var path = url.split('?')[0];
  path = path.split('.com/')[1];

  if(path && path.substring(1,4) === '/cp' && path.substr(-2) == '/c'){
    path = 'tracks the click at the campaign level';
  } else if(path && path.substring(1,4) === '/cp' && path.substr(-2) == '/r'){
    path = 'sets the user cookies and finds the block level redirect';
  } else if(path && path.substring(1,4) === '/rp' && path.substr(-4) == '/url') {
    path = 'tracks the click at the block level';
  } else {
    path = '';
  }

  return path;
}

module.exports = router;

/*
*
* @claire, using this link: http://www.movable-ink-2183.com/p/cp/fc882df30ce19283/c?mi_u=$$ENCRYPTED_USER_ID$$&mi_name=%%firstname%%&mi_zip_default=%%zip%%&mi_country_code=US&url=http%3A%2F%2Fwww.movable-ink-2183.com%2Fp%2Frp%2Fbf1d805feed4ef5a%2Furl
 The first redirect includes /cp and ends with /c —> tracks the click at the campaign level
 The second redirect includes /cp and ends with /r —> sets the user cookies and finds the block level redirect
 The third redirect includes /rp and ends with /url —> tracks the click at the block level
 The fourth redirect goes to the client’s site
* */