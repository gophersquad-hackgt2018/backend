"use strict";

let https = require("https");

let host = "api.cognitive.microsoft.com";
let path = "/bing/v7.0/spellcheck";
/* NOTE: Replace this example key with a valid subscription key (see the Prequisites section above). Also note v5 and v7 require separate subscription keys. */
let key = "faef752e46794b5288c3a7319bf18236";

// These values are used for optional headers (see below).
// let CLIENT_ID = "<Client ID from Previous Response Goes Here>";
// let CLIENT_IP = "999.999.999.999";
// let CLIENT_LOCATION = "+90.0000000000000;long: 00.0000000000000;re:100.000000000000";
function checkSpell(text) {
    return new Promise((resolve, reject) => {
        let mkt = "en-US";
        let mode = "proof";
        let query_string = "?mkt=" + mkt + "&mode=" + mode;

        let request_params = {
            method: "POST",
            hostname: host,
            path: path + query_string,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": text.length + 5,
                "Ocp-Apim-Subscription-Key": key,
                //        'X-Search-Location' : CLIENT_LOCATION,
                //        'X-MSEdge-ClientID' : CLIENT_ID,
                //        'X-MSEdge-ClientIP' : CLIENT_ID,
            }
        };

        let response_handler = function (response) {
            let body = "";
            response.on("data", function (d) {
                body += d;
            });
            response.on("end", function () {
                body = JSON.parse(body);
                body.flaggedTokens.forEach(incr => {
                    var incorrect = incr.token;
                    //console.log(incorrect);
                    var correct = incr.suggestions[0].suggestion;
                    //console.log(correct);
                    text = text.replace(new RegExp(incorrect, "g"), correct);

                });
                resolve(text);
            });
            response.on("error", function (e) {
                console.log("Error: " + e.message);
                reject(e);
            });
            req.end();
        };

        let req = https.request(request_params, response_handler);

        req.write("text=" + text);
        req.end();

    });
}

async function check(text) {
    var rx = /\\text { (.*?) }/g;
    var matches = new Array();
    var old = new Array();
    let match = rx.exec(text)
    while (match !== null) {
        matches.push(match);
        match = rx.exec(text)
    }

    matches.forEach(item => {
        old.push(item[1]);
    });
    const correctedPromises = [];
    old.forEach(item => {
        correctedPromises.push(checkSpell(item));
    });
    const corrected = await Promise.all(correctedPromises);
    for (var i = 0; i < old.length; i++) {
        text = text.replace(old[i], corrected[i]);
    }
    return text;
}

module.exports = {
    check
};
