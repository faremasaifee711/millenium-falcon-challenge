/**
 * Routes for /api/odds endpoint
 *
 * Uses the `postOdds` controller to handle POST requests.
 * You can extend this file to add additional routes for odds-related functionality.
 */
import { Router } from "express";
import { postOdds } from "../controllers/odds.controller";

const router = Router();

router.post("/odds", postOdds);

export default router;