const mongoose = require("mongoose");

const QuestionBlockSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: [String], default: [] },
  type: { type: String },
  options: { type: [String], default: [] }
});

const FormdataSchema = new mongoose.Schema({
  form: { type: [QuestionBlockSchema], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Formdata", FormdataSchema);
