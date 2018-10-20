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
    return new Promise((resolve, reject) => {
        console.log(`PROCESSING ${filename}`);
        let croppedFiles = crop.getCrops(filename);
        console.log(`FINISHED PROCESSING ${filename}`);
        let responses = [];
        const jobs = croppedFiles.map(async croppedName => {
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
                if (response.data.latex) {
                    responses.push(response.data.latex);
                }
            } catch (err) {
                reject(err);
            }
        });
        Promise.all(jobs).then(() => {
            let outLatex = style.head;
            responses.forEach(resp => {
                outLatex +=
                    style.prefix + resp.replace(/\\\\/g, "\\") + style.postfix;
            });
            outLatex += style.tail;
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

            // child.stdout.on("data", data => {
            //     console.log(`child stdout: ${data}`);
            // });
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
}

module.exports = {
    processImage: processImage
};
