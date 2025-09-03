const mongoose = require("mongoose");

// ----- Logic schema for conditional branching -----
const LogicSchema = new mongoose.Schema({
  option: { type: String, required: true },            // option text that triggers
  showQuestions: { type: [Number], default: [] }       // indices (0-based) of questions to show
}, { _id: false });

// ----- Quota schema for question-level quotas -----
const QuotaSchema = new mongoose.Schema({
  condition: { type: String, enum: ["=", "<", ">"], required: true },
  value: { type: Number, required: true }
}, { _id: false });

// ----- Question block schema -----
const QuestionBlockSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ["radio", "checkbox"],
    default: "radio"
  },
  options: { type: [String], default: [] },
  logic: { type: [LogicSchema], default: [] },         // conditional branching rules
  quota: { type: QuotaSchema, default: null }          // quota conditions
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