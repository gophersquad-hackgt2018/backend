const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy"
    });
});

router.post("/upload", upload.single("image"), (req, res) => {
    console.log(`Image received with ${req.file.size} bytes`);
    res.json({
        success: true,
        message: "Image upload was successful"
    });
});

module.exports = router;
