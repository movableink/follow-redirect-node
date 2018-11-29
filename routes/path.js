/**
 * External dependencies
 */
const express = require("express");
const fetch = require("node-fetch");

/**
 * Internal dependencies
 */
const log = require("../utils/log");

const router = express.Router();

router.get("/", async function(req, res) {
  try {
    const { sentURL, imageURL, agentType } = req.query;
    const userAgent = getUserAgent(agentType);

    if (!sentURL) {
      throw new Error("No URL provided");
    }

    const traceURLResults = await traceURL({
      linkURL: sentURL,
      imageURL: imageURL,
      userAgent: userAgent
    });

    res.render("path", {
      title: "Redirect Tracker",
      url: "",
      errorMsg: null,
      response: JSON.stringify(traceURLResults || [])
    });
  } catch (error) {
    log(error);
    res.render("path", {
      title: "Redirect Tracker",
      url: "",
      errorMsg: error.message,
      response: JSON.stringify([])
    });
  }
});

/**
 *
 * @param {*} props
 */
async function traceURL(props) {
  const traceLimit = 20;
  let totalTracesDone = 0;
  let traceResults = [];

  async function _traceURL({ linkURL, imageURL, userAgent }) {
    const { nextUrl, status, error } = await trace(linkURL, userAgent);

    // increment to match limit
    totalTracesDone++;

    // bail early
    if (error) {
      throw new Error(error);
    }

    // store result of trace
    traceResults.push({
      status,
      url: linkURL,
      urlType: getURLType(linkURL),
      imageUrl: imageURL
    });

    // if nextUrl a redirect was found so trace again
    if (nextUrl && totalTracesDone < traceLimit) {
      return await _traceURL({ linkURL: nextUrl, imageURL, userAgent });
    }

    if(totalTracesDone >= traceLimit){
      throw new Error('This link has been redirected 20 times. This site may be treating the SE Link Tracer as a bot and cannot be used to trouble shoot this link.');
    }

    return traceResults;
  }

  return await _traceURL(props);
}

/**
 *
 * @param {*} linkURL
 * @param {*} userAgent
 */
async function trace(linkURL, userAgent) {
  try {
    let nextUrl = null;
    const response = await fetch(linkURL, {
      headers: {
        "User-Agent": userAgent
      },
      redirect: "manual", // `follow, `manual`, `error`
      timeout: 8000 // 8 sec
    });
    const { status, headers } = response;

    log(status, "status");
    log(headers.get("location"), "next url");

    if (status > 400) {
      throw new Error("status above 400");
    }

    nextUrl = headers.get("location") || null;

    return {
      status,
      nextUrl
    };
  } catch (error) {
    log(error);
    return {
      error
    };
  }
}

/**
 *
 * @param {*} url
 */
function getURLType(url) {
  var path = url.split("?")[0];
  path = path.split(".com/")[1];
  var msg = "";

  if (path) {
    let valToCompare = path.substring(1, 4);
    if (valToCompare === "/cp" && path.substr(-2) == "/c") {
      msg = "tracks the click at the campaign level";
    } else if (valToCompare === "/cp" && path.substr(-2) == "/r") {
      msg = "sets the user cookies and finds the block level redirect";
    } else if (valToCompare === "/rp" && path.substr(-4) == "/url") {
      msg = "tracks the click at the block level";
    }
  }
  return msg;
}

/**
 *
 * @param {*} agentType
 */
function getUserAgent(agentType) {
  if (agentType === "desktop") {
    return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14";
  } else {
    return "Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1";
  }
}

module.exports = router;
