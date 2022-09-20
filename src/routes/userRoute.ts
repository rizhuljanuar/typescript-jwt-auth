import { Router } from "express";
import RefreshToken from "../controllers/RefreshTokenController";
import User from "../controllers/UserController";
import VerifyToken from "../middleware/VerifyToken";

const router = Router();
const userController = new User();
const refreshTokenController = new RefreshToken();

router.get("/users", VerifyToken, userController.get);
router.post("/users", userController.register);
router.post("/login", userController.login);
router.post("/login", userController.login);
router.get("/logout", userController.logout);

router.get("/refresh_token", refreshTokenController.index);

export default router;
