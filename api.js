const router = require("express").Router();
const multer = require("multer");
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

router.post("/upload", upload.single("image"), (req, res) => {
    res.json({
        success: true,
        message: "Image upload was successful"
    });
});

module.exports = router;
