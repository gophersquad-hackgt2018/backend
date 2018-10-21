const crop = require("./crop");
const axios = require("axios");
const fs = require("fs");
const latex = require("node-latex");
const style = require("./defaultStyle");
const { spawn } = require("child_process");
const Readable = require("stream").Readable;
const path = require("path");
require("dotenv").config();

async function processImage(filename) {
    return new Promise(async (resolve, reject) => {
        console.log(`PROCESSING ${filename}`);
        let croppedFiles = crop.getCrops(filename);
        console.log(`FINISHED PROCESSING ${filename}`);
        let responses = Array.apply(null, Array(croppedFiles.length));
        let jobs = croppedFiles.map(async (croppedName, idx) => {
            const b64 = fs.readFileSync(`./crops/${croppedName}`, "base64");
            let imageURI = `data:image/jpg;base64,${b64}`;
            let config = {
                headers: {
                    app_id: process.env.MATHPIX_APP_ID,
                    app_key: process.env.MATHPIX_APP_KEY,
                    "Content-type": "application/json"
                }
            };
            try {
                let response = await axios.post(
                    "https://api.mathpix.com/v3/latex",
                    {
                        src: imageURI,
                        ocr: ["math", "text"]
                    },
                    config
                );
                if (
                    response.data &&
                    response.data.latex &&
                    response.data.latex_confidence_rate > 0.7
                ) {
                    responses[idx] = response.data.latex;
                }
            } catch (err) {
                reject(err);
            }
        });
        Promise.all(jobs).then(() => {
            responses = responses.filter(el => el != null);
            let prom2 = new Promise(async (resolve, reject) => {
                if (responses.length === 0) {
                    const b64 = fs.readFileSync(
                        `./uploads/${filename}`,
                        "base64"
                    );
                    let imageURI = `data:image/jpg;base64,${b64}`;
                    let config = {
                        headers: {
                            app_id: process.env.MATHPIX_APP_ID,
                            app_key: process.env.MATHPIX_APP_KEY,
                            "Content-type": "application/json"
                        }
                    };
                    try {
                        let response = await axios.post(
                            "https://api.mathpix.com/v3/latex",
                            {
                                src: imageURI,
                                ocr: ["math", "text"]
                            },
                            config
                        );
                        if (
                            response.data &&
                            response.data.latex &&
                            response.data.latex_confidence_rate > 0.65
                        ) {
                            responses = [response.data.latex];
                            resolve();
                        }
                    } catch (err) {
                        reject(err);
                    }
                } else {
                    resolve();
                }
            });
            Promise.all([prom2]).then(() => {
                let outLatex = style.head;
                responses.forEach(resp => {
                    let line = resp.replace(/\\\\\S]/g, "\\");
                    // align equals signs, only if not in array
                    let re = /\\begin{array}/g;
                    if (!re.exec(line)) {
                        line = line.replace(/=/, "&=");
                    }
                    // If find [a-zA-Z0-9]), then add type to stack
                    re = /[a-zA-Z0-9][)\]]/g;
                    if (re.exec(line)) {
                    }
                    outLatex += style.prefix + line + style.postfix;
                });
                outLatex += style.tail;
                console.log(outLatex);
                const child = spawn(`pdflatex`, [
                    "-output-directory",
                    "pdfs",
                    `-jobname=${filename}`
                ]).on("error", function(err) {
                    console.log(err);
                });
                let stringStream = new Readable();
                stringStream.push(outLatex);
                stringStream.push("\n");
                stringStream.push(null);

                child.stderr.on("err", err => {
                    console.error(`child stderr:\n${err}`);
                });
                child.on("close", code => {
                    if (code == 0) {
                        resolve({
                            fileName: path.resolve(
                                path.join("pdfs", `${filename}.pdf`)
                            )
                        });
                    } else {
                        reject(`ERR: child process exited with code ${code}`);
                    }
                });
                stringStream.pipe(child.stdin).on("err", data => {
                    console.error(`pipe stderr:\n${data}`);
                });
            });
        });
    });
}

module.exports = {
    processImage: processImage
};
