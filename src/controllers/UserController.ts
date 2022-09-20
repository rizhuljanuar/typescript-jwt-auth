import { Request, Response, NextFunction } from "express";
import Users from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface bodyType {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

class User {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const response = await Users.findAll({
        attributes: ["id", "name", "email"],
      });
      return res.status(200).json(response);
    } catch (error) {
      return next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    const body: bodyType = req.body;
    const payload = {
      name: body.name,
      email: body.email,
      password: body.password,
      confirm_password: body.confirm_password,
    };

    if (payload.password !== payload.confirm_password)
      return res
        .status(404)
        .json({ msg: "password dan confirm password tidak cocok" });

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(payload.password, salt);

    try {
      await Users.create({
        name: payload.name,
        email: payload.email,
        password: hashPassword,
      });
      return res.status(201).json({ msg: "register berhasil" });
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as bodyType;
      const user: any = await Users.findAll({
        where: {
          email: body.email,
        },
      });
      const match = await bcrypt.compare(body.password, user[0].password);
      if (!match) return res.status(400).json({ msg: "Wrong Password" });
      const userId = user[0].id;
      const name = user[0].name;
      const email = user[0].email;
      const accessToken = jwt.sign(
        { userId, name, email },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "20s" }
      );
      const refreshToken = jwt.sign(
        { userId, name, email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: "1d" }
      );

      await Users.update(
        { refresh_token: refreshToken },
        {
          where: {
            id: userId,
          },
        }
      );

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ accessToken });
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies as { refresh_token: string };
      console.log(refreshToken);
      if (!refreshToken) return res.sendStatus(204);
      const user: any = await Users.findAll({
        where: {
          refresh_token: refreshToken.refresh_token,
        },
      });
      if (!user[0]) return res.sendStatus(204);
      const userId = user[0].id;
      await Users.update(
        { refresh_token: null },
        {
          where: {
            id: userId,
          },
        }
      );
      res.clearCookie("refresh_token");
      return res.sendStatus(200);
    } catch (error) {
      return next(error);
    }
  }
}

export default User;
