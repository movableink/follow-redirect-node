function urlResponse(response){

  $.each(response, (i, v) =>{

    var url       = v.url;
    var paramHtml = '';

    if(v.urlType === 'tracks the click at the campaign level'){

      var ids = checkCampaignIdsAreSame(v.url, v.imageUrl);
      var isError = (ids.match) ? 'green' : 'red';

      paramHtml = [
        '<div class="url"><b>Campaign Ids</b></div>',
        '<div class="row">',
          '<div class="params"><h2>ID on Link Tag:</h2>',
            '<div class="'+isError+'">' + ids.link + '</div>',
          '</div>',
          '<div class="params"><h2>ID on Image Tag:</h2>',
            '<div class="'+isError+'">' +ids.img + '</div>',
          '</div>',
        '</div>',
      ].join('');
    }

    if(v.urlType === 'tracks the click at the block level'){
      var urlParams   = splitParam(url);
      var imageParams = splitParam(v.imageUrl);

      urlParams = compareObjects(urlParams, imageParams);

      paramHtml = [
        '<div class="url"><b>Image URL</b>: <div>' + v.imageUrl + '</div></div>',
        '<div class="status"><h2>Note: Params need to match and be in the same order</h2></div>',
        '<div class="row">',
          '<div class="params"><h2>URL Params:</h2>',
          buildParams(urlParams),
          '</div>',
          '<div class="params"><h2>Image Params:</h2>',
          buildParams(imageParams),
          '</div>',
        '</div>',
        // this is to show the ignored params in a seperate block / column
        '<div class="row">',
          '<div class="params"><h2>Ignored URL Params:</h2>',
          buildParams(urlParams, true),
          '</div>',
          '<div class="params"><h2>Ignored Image Params:</h2>',
          buildParams(imageParams, true),
          '</div>',
        '</div>',

      ].join('');

    }

    var html = [
      '<div class="row">',
        '<div class="status">',
          'Redirect Status: ' + v.status + ' - <span>' + v.urlType + '</span>',
        '</div>',
        '<div class="url">',
          '<b>URL</b>: <div>' + url + '</div>',
        '</div>',
        paramHtml,
      '</div>'
    ].join('');

    $('section').append(html);

  });

}


function checkCampaignIdsAreSame(linkUrl, imgUrl){
  const link = getCampaignId(linkUrl, '%2Fp%2Frp%2F', '%2F');
  const img = getCampaignId(imgUrl, '/p/rp/', '.');
  return {
    link,
    img,
    match : link === img
  }
}

function getCampaignId(path, str1='', str2=''){
  let campaignIdArr = (path) ? path.split(str1) : '';
  return (campaignIdArr && campaignIdArr[1]) ? campaignIdArr[1].split(str2)[0] : '';
}

/*
  Split the params and dump them into a key = value object
*/
function splitParam(url){

  var query  = (url + '').split('?');
  var object = {};
  var params = '';

  if(query[1]){
    params = query[1].split('&');
  }

  $.each(params, (i, v) =>{

    var key   = v.split('=')[0];
    var value = v.split('=')[1];

    object[key] = {
      'key'   : key,
      'value' : value
    };

  });

  return object;

}

/*
  Compare the params and the image params to see if they match up
  If not then mark the params in red
*/
function compareObjects(url, image){

  var urlKeys = getParamOrder(url);
  var imageKeys = getParamOrder(image);

  urlKeys.forEach( (key, index) => {
    
    // check to see if params are in the same order & if params have the same value
    if( urlKeys[index] !== imageKeys[index] && url[key] !== image[key]){
      url[key]['red'] = true;
      image[key]['red'] = true;
    }else{
      url[key]['red'] = false;
      image[key]['red'] = false;
    }

  });

  return url;

}

/*
  Destruct the object into html to display on the page
  2nd property dictates if we should show ignored params only or normal params (true to only show ignored params)
*/
function buildParams(object, showIgnored = false){

  var html = '';
  $.each(object, (i, v) => {

    // only show the params that are not globally ignored
    if(!showIgnored){

      if(!v.hasOwnProperty('red')){
        // html += '<div>' + i + '=' + v.value + '</div>';
      } else if(v.red){
        html += '<div class="red">' + i + '=' + v.value + '</div>';
      } else {
        html += '<div class="green">' + i + '=' + v.value + '</div>';
      }

    }else{

      if(!v.hasOwnProperty('red')){
        html += '<div>' + i + '=' + v.value + '</div>';
      }

    }

  });

  return html;

}

/**
 * Splits the objects by keys and stores them in an Array that way we can determine the order
 * Dynamic links are order based
 *
 * @param      {Object} Contains object of key and values from the QS
 * 
 * @return     {Array} Keys excluding the ignored params in order so we can match
 */
function getParamOrder(object){

  var globalIgnoreParam = ["utm_source", "utm_medium", "utm_term",
                           "utm_content", "utm_id", "utm_campaign", "gclid",
                           "om_rid", "om_mid", "om_lid", "cellid", "ECID",
                           "mi_link_position", "mi_cachebuster"];
  
  var keys = Object.keys(object).filter( key => globalIgnoreParam.indexOf(key) < 0);
  return keys;

}
