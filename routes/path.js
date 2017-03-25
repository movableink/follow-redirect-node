var express       = require('express');
var router        = express.Router();
var http          = require('http');
var https         = require('https');
var urls          = require('url');

/* GET users listing. */
router.get('/', function(req, res, next) {

	var url = req.query.sentURL || null;
	
  if(url){
    traceURL(url, req, res)
  }else{
    noURL(res);
  }

});

function traceURL(url, req, res){

  var imageUrl    = req.query.imageURL;
  var userAgent   = getUserAgent(req.query.agentType);

  return new Promise(function(resolve, reject){
    //The response object to return
    var json = {
      responses : []
    };

    function get(url) {
      
      var h = (url.indexOf('https:') > -1) ? https : http;

      var options = urls.parse(url);
      options.headers = {
        'User-Agent' : userAgent
      }

      h.get(options, (response) => {

        var urlType = determineURLType(url);
        var data = {
          status : response.statusCode,
          url : url,
          urlType : urlType,
          imageUrl : imageUrl
        };

        json.responses.push(data);

        if(response.statusCode === 200){
          done(json, res);
        } else {
          get(response.headers.location);
        }

      }).on('error', function(err){
  	    console.error(err);
        
        json.responses.push({
          status : 'Error with URL',
          url : url,
          urlType : '',
          imageUrl : imageUrl
        });

        done(json, res);
  	  });
    }

    get(url);

  }).catch((error) => {
    assert.isNotOk(error,'Promise error');
    done(json, res);
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

function getUserAgent(agentType){

  if(agentType === 'desktop'){
    return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14';
  }else{
    return 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1';
  }

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