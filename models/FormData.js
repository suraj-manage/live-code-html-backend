const mongoose = require("mongoose");

const LogicSchema = new mongoose.Schema({
  option: { type: String, required: true },       // option that triggers
  showQuestions: { type: [Number], default: [] }  // indices/IDs of questions to show
});

const QuestionBlockSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: [String], default: [] },
  type: { 
    type: String, 
  enum: ["radio", "checkbox"], 
    default: "text" 
  },
  options: { type: [String], default: [] },         // answer choices
  logic: { type: [LogicSchema], default: [] }       // conditional branching
});

const FormdataSchema = new mongoose.Schema(
  {
    form: { type: [QuestionBlockSchema], required: true }
  }
);

module.exports = mongoose.model("Formdata", FormdataSchema);
