const mongoose = require("mongoose");

// ----- Logic schema (extended with quota conditions) -----
const LogicSchema = new mongoose.Schema({
  option: { type: String, required: true },            // option text that triggers
  showQuestions: { type: [Number], default: [] },      // indices (0-based) of questions to show
  quotaCheck: {
    type: [
      {
        questionIndex: { type: Number, required: true },  // which question's value to check
        condition: { type: String, enum: ["=", "<", ">"], required: true },
        value: { type: Number, required: true },          // number to compare against
        meetRequirement: { type: Boolean} // whether meeting the condition is required,
      }
    ],
    default: []
  }
}, { _id: false });

// ----- Question block schema -----
const QuestionBlockSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: [String], default: [] },
  type: {
    type: String,
    enum: ["radio", "checkbox"],
    default: "radio"
  },
  options: { type: [String], default: [] },
  logic: { type: [LogicSchema], default: [] }          // conditional branching rules
}, { _id: false });

// ----- Form definition schema -----
const FormDefinitionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled form" },
    description: { type: String, default: "" },
    form: { type: [QuestionBlockSchema], required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormDefinition", FormDefinitionSchema);
