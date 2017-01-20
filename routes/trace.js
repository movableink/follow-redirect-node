var express = require('express');
var router = express.Router();
var http         = require('http');
var https        = require('https');

router.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers',
    'X-Requested-With,Content-Type, Accept');
  next();
});

router.get('/', function(req, res) {
    var url = 'http://mi.teeoff.com/p/cp/3232ddf9622f498c/c?mi_u=claire1&mi_zip_default=10023&url=http%3A%2F%2Fmi.teeoff.com%2Fp%2Frp%2F1c919e3d92927c15%2Furl';
    //var url = 'http://www.nytimes.com/jack';
    trace(url).then(function(r) {
      console.log('Resolve promise');
      res.send(r);
    }, function(msg){
      res.send(msg);
    });
});

function trace(url){

  return new Promise(function(resolve, reject){
    //The response object to return
    var json = {
      responses : []
    };

    function get(url) {
      var regex = /https:/gi;
      var h = http;
      if(regex.exec(url)) h = https;

      h.get(url, (response) => {

        response.on('data', () =>{
          console.log('data');
        });
        response.on('end', () =>{
          console.log('close');
        });

        var data = {
          status : response.statusCode,
          url : url
        };
        json.responses.push(data);
        if(response.statusCode === 200){
          console.log('resolve callback');
          resolve(json);
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

module.exports = router;
