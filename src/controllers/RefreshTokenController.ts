import { Request, Response, NextFunction } from "express";
import Users from "../models/User";
import jwt from "jsonwebtoken";

class RefreshToken {
  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies as { refresh_token: string };
      if (!refreshToken) return res.sendStatus(401);
      const user: any = await Users.findAll({
        where: {
          refresh_token: refreshToken.refresh_token,
        },
      });
      if (!user[0]) return res.sendStatus(403);
      jwt.verify(
        refreshToken.refresh_token,
        process.env.REFRESH_TOKEN_SECRET as string,
        (err, _decode: any) => {
          if (err) return res.sendStatus(403);
          const userId = user[0].id;
          const name = user[0].name;
          const email = user[0].email;
          const accessToken = jwt.sign(
            { userId, name, email },
            process.env.ACCESS_TOKEN_SECRET as string,
            {
              expiresIn: "20s",
            }
          );
          return res.json({ accessToken });
        }
      );
    } catch (error) {
      return next(error);
    }
  }
}

export default RefreshToken;
