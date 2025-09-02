const mongoose = require("mongoose");

const AnswerItemSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true }, // 0-based index
  questionText: { type: String, default: "" },     // optional snapshot of question text
  answer: { type: [String], default: [] },         // selected answers (array)
  value: { type: mongoose.Schema.Types.Mixed, default: null }, // optional numeric/string value for quota checks
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }    // optional extra info
}, { _id: false });

const EvaluatedQuotaSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },    // which question the quota refers to
  option: { type: String, default: null },            // optional: if quota is option-level
  condition: { type: String, enum: ["=", "<", ">"], required: true },
  value: { type: Number, required: true },            // numeric comparator
  passed: { type: Boolean, required: true }           // result of the check
}, { _id: false });

const FormResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: "FormDefinition", required: false },
  formSnapshot: { type: [mongoose.Schema.Types.Mixed], default: [] }, // optional snapshot at submit time
  answers: { type: [AnswerItemSchema], default: [] },
  evaluatedQuotas: { type: [EvaluatedQuotaSchema], default: [] },     // simple audit of quota checks
  submittedAt: { type: Date, default: Date.now },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("FormResponse", FormResponseSchema);
