const crop = require("./crop")


function process(filename) {
  let croppedFiles = crop.getCrops(filename)
  for (imgBuff in croppedFiles) {
    let b64 = imgBuff.toString('base64')
  }
}

module.exports = {
  process: process
}