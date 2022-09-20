import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function VerifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log(token);
  if (!token) return res.sendStatus(401);
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, decoded: any) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.email = decoded.email;
      return next();
    }
  );
}

export default VerifyToken;
