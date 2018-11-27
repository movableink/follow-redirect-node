/**
 * External dependencies
 */
const express = require("express");
const fetch = require("node-fetch");

/**
 * Internal dependencies
 */
const log = require("../utils/log");

let TRACE_RESULTS = [];
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

function traceURL({ linkURL, imageURL, userAgent }) {
  return new Promise(async (resolve, reject) => {
    const { response, error } = await trace(linkURL, userAgent);
    const { status, headers } = response;

    // sets global
    TRACE_RESULTS.push({
      status: status,
      url: linkURL,
      urlType: determineURLType(linkURL),
      imageUrl: imageURL
    });

    log(status, "response status");
    log(headers.get("location"), "response headers");

    if (error || status > 400) {
      log(error);
      return reject(error);
    }

    if (status === 302 || status === 301) {
      return resolve(
        traceURL({
          linkURL: headers.get("location"),
          imageURL,
          userAgent
        })
      );
    }

    if (status === 200) {
      resolve(TRACE_RESULTS);
      // clears global
      TRACE_RESULTS = [];
    }
  });
}

async function trace(linkURL, userAgent) {
  try {
    const response = await fetch(linkURL, {
      headers: {
        "User-Agent": userAgent
      },
      redirect: "manual", // `follow, `manual`, `error`
      timeout: 8000 // 8 sec
    });
    return {
      response
    };
  } catch (error) {
    return {
      error
    };
  }
}

function determineURLType(url) {
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

function getUserAgent(agentType) {
  if (agentType === "desktop") {
    return "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14";
  } else {
    return "Mozilla/5.0 (iPhone; CPU iPhone OS 10_1_1 like Mac OS X) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0 Mobile/14B100 Safari/602.1";
  }
}

module.exports = router;
