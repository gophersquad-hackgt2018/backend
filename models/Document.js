const mongoose = require("mongoose");
const documentSchema = new mongoose.Schema({
    name: { type: String, default: () => new Date() },
    url: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;
