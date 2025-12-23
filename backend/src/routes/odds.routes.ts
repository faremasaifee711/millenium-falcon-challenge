import { Router } from "express";
import { postOdds } from "../controllers/odds.controller";

const router = Router();

router.post("/odds", postOdds);

export default router;