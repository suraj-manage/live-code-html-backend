const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");

// Save editor form definition
router.post("/submit", formController.saveFormDefinition);

// Fetch form definitions
router.get("/", formController.getFormDefinitions);

// Get one definition by id
router.get("/:id", formController.getFormDefinitionById);

// Save end-user response
router.post("/response", formController.saveFormResponse);

// Fetch responses (optionally filter by formId)
router.get("/responses/list", formController.getResponses);

module.exports = router;
