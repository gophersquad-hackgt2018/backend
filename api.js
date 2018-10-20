const router = require("express").Router();
const Document = require("./models/Document");
const multer = require("multer");
const blob = require("./blob");
const latexer = require("./latexer");
const wsClient = require("./ws");

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
router.post("/documents", (req, res, next) => {
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
            throw new Error("Error while deleting document");
        });
});

router.delete("/documents", async (req, res) => {
    if (!req.body.id) {
        throw new Error("No 'id' field found in request body");
    }
    try {
        await Document.findByIdAndDelete(req.body.id);
        res.json({
            status: true,
            message: "Successfully deleted document"
        });
    } catch (err) {
        throw new Error("Error while deleting document");
    }
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

router.post("/upload", upload.single("image"), async (req, res) => {
    const fileName = req.file.filename;
    res.json({
        success: true,
        message: "Image upload was successful",
        id: fileName
    });
    try {
        const data = await latexer.processImage(fileName);
        const blobURL = await blob.uploadFile(data.fileName);
        const doc = await Document.create({
            url: blobURL
        });
        console.log(`New document created: ${doc}`);
        wsClient.sendDocument(fileName, doc);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
