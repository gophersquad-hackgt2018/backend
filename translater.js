'use strict';
var axios = require('axios')
let subscriptionKey = 'd700a4004e97434bb00094cfcea432a9';
function translate(text,language) {
    return new Promise((resolve, reject) => {
        var postData = JSON.stringify ([{'Text' : text}]);

        let axiosConfig = {
            headers: {
                'Content-Type' : 'application/json',
                'Ocp-Apim-Subscription-Key' : subscriptionKey,
                'X-ClientTraceId' : get_guid (),
            }
        };

        let params = language;
        axios.post('https://api.cognitive.microsofttranslator.com/translate?api-version=3.0'+params, postData, axiosConfig)
            .then((res) => {
                //console.log("RESPONSE RECEIVED: ", res.data);
                res.data.forEach(item => {
                    item.translations.forEach(obj => {
                        resolve(obj)
                    })
                })
            })
            .catch((err) => {
                console.log("AXIOS ERROR: ", err);
                reject(e)
            })
    })
}

let get_guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function check(text, language) {
    var rx = /\\text { (*) }/g;
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
        correctedPromises.push(translate(item, language));
    });
    const corrected = await Promise.all(correctedPromises);
    for (var i = 0; i < old.length; i++) {
        text = text.replace(old[i], corrected[i]);
    }
    return text;
}
module.exports = {
    check
}
