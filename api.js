const router = require("express").Router();
const Document = require("./models/Document");
const multer = require("multer");
const azure = require("azure-storage");
const latexer = require("./latexer")

const imageFilter = function(req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
const upload = multer({ dest: "uploads/", fileFilter: imageFilter });

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy"
    });
});

// Test endpoint for creating documents
router.post("/documents", (req, res) => {
    Document.create(req.body)
        .then(resp => {
            console.log(resp);
            res.json({
                status: true,
                message: "Successfully created document",
                data: resp
            });
        })
        .catch(err => {
            console.log(err);
            throw new Error("Error when creating document");
        });
});

router.get("/documents", (req, res) => {
    Document.find()
        .sort({ date: -1 })
        .then(resp => {
            res.json({
                status: true,
                message: "Successfully retrieved documents",
                data: resp
            });
        })
        .catch(err => {
            console.log(err);
            throw new Error("Error retrieving documents");
        });
});

router.post("/upload", upload.single("image"), (req, res) => {
    res.json({
        success: true,
        message: "Image upload was successful"
    });
    latexer.process(req.file.filename, process.env.MATHPIX_APPID, process.env.MATHPIX_APPKEY)
});

module.exports = router;
