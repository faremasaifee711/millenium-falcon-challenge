import { calculateFinalProbability } from "../services/oddsCalculator";
import { OddsRequest, OddsResponse } from "../types/odds.types";
import { Route } from "../models/routes";
import { getFalconData } from "../services/jsonService";
import { initializeDefaultRoutes } from "../services/planetRouteService";
import { RequestHandler } from "express";

export const postOdds: RequestHandler = (req, res) => {
    const body: OddsRequest = req.body;

    // INIT 
    const routes : Route[] = initializeDefaultRoutes();
    const falconData = getFalconData();

    const odds = calculateFinalProbability(routes, falconData, body);

    const response: OddsResponse = {
        success: true,
        odds,
    };

    res.json(response);
}