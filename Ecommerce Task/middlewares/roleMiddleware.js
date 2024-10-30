const authorizeByRole =(...allowedRoles)=>{

    return (req,res,next)=>{
        if (!allowedRoles.includes(req.user.role)){
            return res.status(403).json({message: 'Access Denied.  You do not have permission to perform this action.'});
        }
        next();
    }
}

module.exports = authorizeByRole