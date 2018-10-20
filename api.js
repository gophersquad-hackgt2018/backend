const router = require("express").Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy"
    });
});

module.exports = router;
