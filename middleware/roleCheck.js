module.exports = function (...roles){

    return function(req,res,next){

        if(!req.user){

            return res.status(401).json({
                status:"error",
                message:"Unauthorized"
            });

        }


        if(!roles.includes(req.user.role)){

            return res.status(403).json({

                status:"error",
                message:"Access denied"

            });

        }


        next();

    }

}