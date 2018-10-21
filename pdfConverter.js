const pdf2img = require("pdf2img");
const blob = require("./blob");
const path = require("path");

pdf2img.setOptions({
    type: "jpg",
    outputdir: path.resolve(__dirname, "pdfs"),
    page: 1
});

const getPreviewImage = async filePath => {
    return new Promsise((resolve, reject) => {
        pdf2img.convert(filePath, function(err, res) {
            if (err) reject(err);
            else {
                console.log(res);
                resolve("test");
                // blob.uploadFile(imagePath)
                //     .then(resolve)
                //     .catch(reject);
            }
        });
    });
};

module.exports = {
    getPreviewImage: getPreviewImage
};
