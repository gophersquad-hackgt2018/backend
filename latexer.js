const crop = require('./crop')
const axios = require('axios')
const fs = require('fs')
const latex = require('node-latex')
require('dotenv').config()

async function process(filename, appid, appkey) {
  console.log(`PROCESSING ${filename}`)
  let croppedFiles = crop.getCrops(filename)
  console.log(`FINISHED PROCESSING ${filename}`)
  let responses = []
  console.log(croppedFiles)
  const jobs = croppedFiles.map(async (croppedName) => {
    // console.log('name', croppedName)
    const b64 = fs.readFileSync(`./crops/${croppedName}`, 'base64')
    // console.log(b64)
    let imageURI = `data:image/jpg;base64,${b64}`
    let config = {
      headers: {
        'app_id': appid,
        'app_key': appkey,
        'Content-type': 'application/json',
      },
    }
    try {
      let response = await
          axios.post('https://api.mathpix.com/v3/latex', {
            src: imageURI,
            ocr: ['math', 'text'],
          }, config)
      if (response.data.latex) {
        responses.push(response.data.latex)
      }
    } catch (err) {
      console.log(err)
    }
  })
  Promise.all(jobs).then(() => {
    let outLatex = ""
    responses.forEach(resp => {
      outLatex += resp.replace(/\\\\/g, "\\") + " \\\\ \n"
    })
    console.log(outLatex)
  })
}

module.exports = {
  process: process,
}