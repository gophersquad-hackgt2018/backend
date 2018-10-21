const mongoose = require("mongoose");
const strftime = require("strftime");
const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        default: () => {
            return strftime("%b %o, %Y");
        }
    },
    url: { type: String, required: true },
    previewURL: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
