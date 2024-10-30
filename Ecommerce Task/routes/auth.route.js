const express = require('express');
const { registerUser  , loginUser  ,registerValidation, loginValidation,deleteUserById } = require("../controllers/user.controller");
const validate = require('../middlewares/validationMiddleware');
const verifyToken = require("../middlewares/authMiddleware")

const limiter = require("../middlewares/ratelimitMiddleware");
const authorizeByRole = require("../middlewares/roleMiddleware");

const router = express.Router();

//Routes for all
router.post("/register", limiter , registerValidation, validate, registerUser);
router.post("/login", limiter , loginValidation, validate , loginUser);

router.delete("/delete/user/:id", limiter,verifyToken,authorizeByRole("admin"),deleteUserById);


module.exports= router;