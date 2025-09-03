const mongoose = require("mongoose");

const AnswerItemSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },      // 0-based index
  questionText: { type: String, default: "" },          // snapshot of question text at submit time
  answer: { type: [String], default: [] },              // selected answers (array format)
  value: { type: mongoose.Schema.Types.Mixed, default: null }, // optional extra value
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }     // optional extra metadata
}, { _id: false });

const EvaluatedQuotaSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },      // which question the quota refers to
  option: { type: String, default: null },              // option (null for question-level quotas)
  condition: { type: String, enum: ["=", "<", ">"], required: true },
  value: { type: Number, required: true },              // numeric comparator
  passed: { type: Boolean, required: true }             // result of the quota check
}, { _id: false });

const FormResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "FormDefinition", required: false },
  formSnapshot: { type: [mongoose.Schema.Types.Mixed], default: [] }, // snapshot of form at submit time
  answers: { type: [AnswerItemSchema], default: [] },
  evaluatedQuotas: { type: [EvaluatedQuotaSchema], default: [] },     // results of quota evaluations
  submittedAt: { type: Date, default: Date.now },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("FormResponse", FormResponseSchema);