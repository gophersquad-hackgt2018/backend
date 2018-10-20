const crop = require('./crop')
const axios = require('axios')
const fs = require('fs')
const latex = require('node-latex')
const style = require('./defaultStyle')
const {spawn} = require('child_process')
const Readable = require('stream').Readable

require('dotenv').config()

async function processImage(filename) {
  console.log(`PROCESSING ${filename}`)
  let croppedFiles = crop.getCrops(filename)
  console.log(`FINISHED PROCESSING ${filename}`)
  let responses = []
  const jobs = croppedFiles.map(async croppedName => {
    const b64 = fs.readFileSync(`./crops/${croppedName}`, 'base64')
    let imageURI = `data:image/jpg;base64,${b64}`
    let config = {
      headers: {
        app_id: process.env.APP_ID,
        app_key: process.env.APP_KEY,
        'Content-type': 'application/json',
      },
    }
    try {
      let response = await axios.post(
          'https://api.mathpix.com/v3/latex',
          {
            src: imageURI,
            ocr: ['math', 'text'],
          },
          config,
      )
      if (response.data.latex) {
        responses.push(response.data.latex)
      }
    } catch (err) {
      console.log(err)
    }
  })
  Promise.all(jobs).then(() => {
    let outLatex = style.head
    responses.forEach(resp => {
      let line = resp.replace(/\\\\\S]/g, '\\')
      // align equals signs
      line = line.replace(/=/,'&=')
      outLatex += style.prefix + line + style.postfix
    })
    outLatex += style.tail
    const child = spawn(`pdflatex`, [
      '-output-directory',
      'pdfs',
      `-jobname=${filename}`,
    ]).on('error', function(err) {
      console.log(err)
    })
    let stringStream = new Readable()
    stringStream.push(outLatex)
    stringStream.push('\n')
    stringStream.push(null)

    // child.stdout.on("data", data => {
    //     console.log(`child stdout: ${data}`);
    // });
    child.stderr.on('err', err => {
      console.error(`child stderr:\n${err}`)
    })
    child.on('close', code => {
      if (code == 0) {
        console.log('SUCCESS')
      } else {
        console.log(`ERR: child process exited with code ${code}`)
      }
    })
    stringStream.pipe(child.stdin).on('err', data => {
      console.error(`pipe stderr:\n${data}`)
    })
  })
}

module.exports = {
  processImage: processImage,
}
