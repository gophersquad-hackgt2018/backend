const pdf2img = require("pdf2img");
const blob = require("./blob");
const path = require("path");

pdf2img.setOptions({
    type: "jpg",
    outputdir: path.resolve(__dirname, "pdfs"),
    page: 0
});

const getPreviewImage = async filePath => {
    return new Promise((resolve, reject) => {
        const base = path.basename(filePath);
        pdf2img.setOptions({
            outputname: base
        });
        pdf2img.convert(filePath, function(err, res) {
            if (err) reject(err);
            else {
                const imagePath = res.message[0].path;
                blob.uploadFile(imagePath)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
};

module.exports = {
    getPreviewImage: getPreviewImage
};
