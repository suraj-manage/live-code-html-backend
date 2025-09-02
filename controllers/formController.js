const FormDefinition = require("../models/FormDefinition");
const FormResponse = require("../models/FormResponse");
const mongoose = require("mongoose");

/**
 * Save a form definition (editor -> backend)
 * POST /api/forms/submit
 */
exports.saveFormDefinition = async (req, res) => {
  try {
    const payload = req.body;
    // minimal validation
    if (!payload || !Array.isArray(payload.form)) {
      return res.status(400).json({ error: "Invalid payload: missing form array" });
    }

    const def = await FormDefinition.create({
      title: payload.title || "Untitled form",
      description: payload.description || "",
      form: payload.form,
      meta: payload.meta || {}
    });

    return res.status(201).json({ message: "Form saved", form: def });
  } catch (err) {
    console.error("saveFormDefinition error:", err);
    return res.status(500).json({ error: "Error saving form definition" });
  }
};

/**
 * Fetch all form definitions
 * GET /api/forms
 */
exports.getFormDefinitions = async (req, res) => {
  try {
    const forms = await FormDefinition.find().sort({ createdAt: -1 });
    return res.json(forms);
  } catch (err) {
    console.error("getFormDefinitions error:", err);
    return res.status(500).json({ error: "Error fetching forms" });
  }
};

/**
 * Fetch a single form definition by id
 * GET /api/forms/:id
 */
exports.getFormDefinitionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid id" });

    const form = await FormDefinition.findById(id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    return res.json(form);
  } catch (err) {
    console.error("getFormDefinitionById error:", err);
    return res.status(500).json({ error: "Error fetching form" });
  }
};

/**
 * Save an end-user response
 * POST /api/forms/response
 *
 * Expected body shape (example)
 * {
 *   formId: "<optional form id>",
 *   answers: [
 *     { questionIndex: 0, questionText: "...", answer: ["Red"] },
 *     { questionIndex: 1, questionText: "...", answer: ["Yes"] }
 *   ],
 *   formSnapshot: [ ... optional snapshot ... ],
 *   meta: { ip: "...", userAgent: "..." }
 * }
 */
exports.saveFormResponse = async (req, res) => {
  try {
    const payload = req.body;
    const answers = payload.answers || payload.form; // accept either
    
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid payload: missing answers/form array" });
    }

    const doc = await FormResponse.create({
      formId: payload.formId && mongoose.Types.ObjectId.isValid(payload.formId) ? payload.formId : undefined,
      answers: answers.map((a, idx) => ({
        questionIndex: a.questionIndex ?? idx,   // if no index, fallback to loop index
        questionText: a.questionText || a.question || "", // support both props
        answer: Array.isArray(a.answer)
          ? a.answer
          : (a.answer ? [String(a.answer)] : [])
      })),
      formSnapshot: payload.formSnapshot || [],
      meta: payload.meta || {}
    });

    return res.status(201).json({ message: "Response saved", response: doc });
  } catch (err) {
    console.error("saveFormResponse error:", err);
    return res.status(500).json({ error: "Error saving response" });
  }
};

/**
 * Fetch responses (optionally filter by formId)
 * GET /api/forms/responses?formId=<id>
 */
exports.getResponses = async (req, res) => {
  try {
    const { formId } = req.query;
    const filter = {};
    if (formId && mongoose.Types.ObjectId.isValid(formId)) filter.formId = formId;
    const responses = await FormResponse.find(filter).sort({ submittedAt: -1 });
    return res.json(responses);
  } catch (err) {
    console.error("getResponses error:", err);
    return res.status(500).json({ error: "Error fetching responses" });
  }
};
