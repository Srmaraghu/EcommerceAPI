
const { validationResult } = require("express-validator");

// Middleware for handling validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }
    next(); 
};

module.exports = validate;
