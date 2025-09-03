const FormDefinition = require("../models/FormDefinition");
const FormResponse = require("../models/FormResponse");
const mongoose = require("mongoose");

/**
 * Save a form definition (editor -> backend)
 * POST /api/forms
 * 
 * Expected payload from App.jsx:
 * {
 *   title: "Untitled form",
 *   description: "",
 *   form: [
 *     {
 *       question: "What is your favorite color?",
 *       type: "radio",
 *       options: ["Red", "Blue", "Green"],
 *       logic: [{ option: "Red", showQuestions: [1, 2] }],
 *       quota: { condition: "=", value: 10 }
 *     }
 *   ],
 *   meta: {}
 * }
 */
exports.saveFormDefinition = async (req, res) => {
  try {
    const payload = req.body;
    
    console.log("Received form definition payload:", JSON.stringify(payload, null, 2));
    
    // Validate payload structure
    if (!payload || !Array.isArray(payload.form)) {
      return res.status(400).json({ error: "Invalid payload: missing form array" });
    }

    // Validate each question in the form
    for (let i = 0; i < payload.form.length; i++) {
      const question = payload.form[i];
      if (!question.question || typeof question.question !== 'string') {
        return res.status(400).json({ error: `Invalid question at index ${i}: missing question text` });
      }
      if (!['radio', 'checkbox'].includes(question.type)) {
        return res.status(400).json({ error: `Invalid question type at index ${i}: must be 'radio' or 'checkbox'` });
      }
      if (!Array.isArray(question.options)) {
        return res.status(400).json({ error: `Invalid options at index ${i}: must be an array` });
      }
    }

    const def = await FormDefinition.create({
      title: payload.title || "Untitled form",
      description: payload.description || "",
      form: payload.form,
      meta: payload.meta || {}
    });

    console.log("Form definition saved with ID:", def._id);
    
    return res.status(201).json({ 
      message: "Form saved successfully", 
      _id: def._id,
      form: def 
    });
    
  } catch (err) {
    console.error("saveFormDefinition error:", err);
    return res.status(500).json({ error: "Error saving form definition", details: err.message });
  }
};

/**
 * Submit a form response (end-user -> backend)
 * POST /api/forms/submit
 * 
 * Expected payload from App.jsx:
 * {
 *   formId: null,
 *   formSnapshot: [
 *     {
 *       question: "What is your favorite color?",
 *       type: "radio",
 *       options: ["Red", "Blue", "Green"],
 *       logic: [],
 *       quota: null
 *     }
 *   ],
 *   answers: [
 *     {
 *       questionIndex: 0,
 *       questionText: "What is your favorite color?",
 *       answer: ["Red"],
 *       value: null,
 *       meta: {}
 *     }
 *   ],
 *   evaluatedQuotas: [
 *     {
 *       questionIndex: 0,
 *       option: null,
 *       condition: "=",
 *       value: 10,
 *       passed: true
 *     }
 *   ],
 *   meta: {}
 * }
 */
exports.submitFormResponse = async (req, res) => {
  try {
    const payload = req.body;
    
    console.log("Received form response payload:", JSON.stringify(payload, null, 2));
    
    // Validate payload structure
    if (!payload || !Array.isArray(payload.answers)) {
      return res.status(400).json({ error: "Invalid payload: missing answers array" });
    }

    // Validate answers structure
    for (let i = 0; i < payload.answers.length; i++) {
      const answer = payload.answers[i];
      if (typeof answer.questionIndex !== 'number') {
        return res.status(400).json({ error: `Invalid answer at index ${i}: missing questionIndex` });
      }
      if (!Array.isArray(answer.answer)) {
        return res.status(400).json({ error: `Invalid answer at index ${i}: answer must be an array` });
      }
    }

    // Process formId if provided and valid
    let formObjectId = null;
    if (payload.formId && mongoose.Types.ObjectId.isValid(payload.formId)) {
      formObjectId = payload.formId;
    }

    const response = await FormResponse.create({
      formId: formObjectId,
      formSnapshot: payload.formSnapshot || [],
      answers: payload.answers.map(answer => ({
        questionIndex: answer.questionIndex,
        questionText: answer.questionText || "",
        answer: answer.answer,
        value: answer.value || null,
        meta: answer.meta || {}
      })),
      evaluatedQuotas: payload.evaluatedQuotas || [],
      meta: payload.meta || {}
    });

    console.log("Form response saved with ID:", response._id);
    
    return res.status(201).json({ 
      message: "Response submitted successfully", 
      _id: response._id,
      response: response 
    });
    
  } catch (err) {
    console.error("submitFormResponse error:", err);
    return res.status(500).json({ error: "Error saving form response", details: err.message });
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }

    const form = await FormDefinition.findById(id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }
    
    return res.json(form);
  } catch (err) {
    console.error("getFormDefinitionById error:", err);
    return res.status(500).json({ error: "Error fetching form" });
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
    
    if (formId && mongoose.Types.ObjectId.isValid(formId)) {
      filter.formId = formId;
    }
    
    const responses = await FormResponse.find(filter)
      .sort({ submittedAt: -1 })
      .populate('formId', 'title description');
      
    return res.json(responses);
  } catch (err) {
    console.error("getResponses error:", err);
    return res.status(500).json({ error: "Error fetching responses" });
  }
};

/**
 * Delete a form definition
 * DELETE /api/forms/:id
 */
exports.deleteFormDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }

    const deletedForm = await FormDefinition.findByIdAndDelete(id);
    if (!deletedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    return res.json({ message: "Form deleted successfully", _id: id });
  } catch (err) {
    console.error("deleteFormDefinition error:", err);
    return res.status(500).json({ error: "Error deleting form" });
  }
};

/**
 * Update a form definition
 * PUT /api/forms/:id
 */
exports.updateFormDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid form ID" });
    }

    const payload = req.body;
    if (!payload || !Array.isArray(payload.form)) {
      return res.status(400).json({ error: "Invalid payload: missing form array" });
    }

    const updatedForm = await FormDefinition.findByIdAndUpdate(
      id,
      {
        title: payload.title || "Untitled form",
        description: payload.description || "",
        form: payload.form,
        meta: payload.meta || {}
      },
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ error: "Form not found" });
    }

    return res.json({ 
      message: "Form updated successfully", 
      form: updatedForm 
    });
    
  } catch (err) {
    console.error("updateFormDefinition error:", err);
    return res.status(500).json({ error: "Error updating form" });
  }
};