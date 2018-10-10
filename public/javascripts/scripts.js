function urlResponse(response){

  $.each(response, (i, v) =>{

    var url       = v.url;
    var paramHtml = '';

    if(v.urlType === 'tracks the click at the campaign level'){

      var ids = checkCampaignIdsAreSame(v.url, v.imageUrl);
      var isError = (!!ids.match) ? 'green' : 'red';

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
        '<div class="row">',
        '<div class="params"><h2>Params:</h2>',
        buildParams(urlParams),
        '</div>',
        '<div class="params"><h2>Image Params:</h2>',
        buildParams(imageParams),
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
  let campaignIdArr = (!!path) ? path.split(str1) : '';
  return (!!campaignIdArr && campaignIdArr[1]) ? campaignIdArr[1].split(str2)[0] : '';
}

/*
  Split the params and dump them into a key = value object
*/
function splitParam(url){

  var query  = url.split('?');
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

  var globalIgnoreParam = ["utm_source", "utm_medium", "utm_term",
                           "utm_content", "utm_id", "utm_campaign", "gclid",
                           "om_rid", "om_mid", "om_lid", "cellid", "ECID",
                           "mi_link_position", "mi_cachebuster"];

  $.each(url, (i, v) =>{

    if(globalIgnoreParam.indexOf(i) < 0 && (!image.hasOwnProperty(i) || image[i]['value'] !== url[i]['value'])){
      url[i]['red'] = true;
    } else{
      url[i]['red'] = false;
    }

  });

  return url;

}

/*
  Destruct the object into html to display on the page
*/
function buildParams(object){

  var html = '';
  $.each(object, (i, v) =>{

    if(!v.hasOwnProperty('red')){
      html += '<div>' + i + '=' + v.value + '</div>';
    } else if(v.red){
      html += '<div class="red">' + i + '=' + v.value + '</div>';
    } else{
      html += '<div class="green">' + i + '=' + v.value + '</div>';
    }

  });

  return html;

}