const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = async (req, res, next) => {

    //verifying token using the Authorizatio Header

    let token = req.cookies.token; // Read token from cookies

    

        if (!token) {
            return res.status(401).json({
                message: "Token is not provided "
            });
        }
        try {

            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (!decode) {
                return res.status(401).json({
                    message: "Invalid token",
                    success: false,
                })
            }

            const user = await User.findById(decode.userId);

            // Check if the user still exists in the database
            if (!user) {
                return res.status(401).json({ message: "User no longer exists" });
            }


            req.user ={
                userId: decode.userId,
                role : decode.role,
                } 
                
            console.log("Decoded user is : ", req.user);
            next();

        } catch (err) {
            console.error("Error verifying token:", err);
            res.status(401).json({ error: "Access denied. Not Authenticated. Invalid token." });
            return;
        }



    
        
}




module.exports = verifyToken;