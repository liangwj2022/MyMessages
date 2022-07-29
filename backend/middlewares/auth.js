import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";


 function auth(req, res, next){
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, "mysecrettoken");
        req.userData = {
          email: decodedToken.email,
          userId: decodedToken.userId,
        };
        next();
      } catch(error) {
        res.status(401).json({message: "You are not authenticated!!!"});
      }
 }

export default auth;