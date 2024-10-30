const express = require("express");
const verifyToken = require("../middlewares/authMiddleware")
const authorizeByRole = require("../middlewares/roleMiddleware");
const router = express.Router();
const validate = require('../middlewares/validationMiddleware');

const limiter = require("../middlewares/ratelimitMiddleware");



//only admin
router.get("/admin", limiter, verifyToken,authorizeByRole("admin"));



router.get("/user", limiter, verifyToken,authorizeByRole("admin","user"),(req,res)=>{
    res.json("User")
});

module.exports = router;