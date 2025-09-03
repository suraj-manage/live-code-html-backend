const express = require("express");
const {
  saveFormDefinition,
  submitFormResponse,
  getFormDefinitions,
  getFormDefinitionById,
  getResponses,
  deleteFormDefinition,
  updateFormDefinition
} = require("../controllers/formController");

const router = express.Router();

// 1. More specific routes should come first to avoid conflicts.
// Form Response Routes
router.post("/submit", submitFormResponse);             // POST /api/forms/submit - Submit a form response
router.get("/responses", getResponses);                 // GET /api/forms/responses - Get all form responses

// 2. Generic routes should be listed after specific ones.
// Form Definition Routes
router.post("/", saveFormDefinition);                    // POST /api/forms - Save a new form definition
router.get("/", getFormDefinitions);                     // GET /api/forms - Get all form definitions
router.get("/:id", getFormDefinitionById);              // GET /api/forms/:id - Get a specific form definition
router.put("/:id", updateFormDefinition);               // PUT /api/forms/:id - Update a form definition
router.delete("/:id", deleteFormDefinition);            // DELETE /api/forms/:id - Delete a form definition

module.exports = router;