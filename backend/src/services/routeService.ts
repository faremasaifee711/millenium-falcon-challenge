import db from "../db/db";
import { Route } from "../models/route";

export function getRoutes(fromPlanet: string, toPlanet: string): Route[] {
  const stmt = db.prepare(
    `SELECT * FROM routes WHERE origin = ? AND destination = ?`
  );
  return stmt.all(fromPlanet, toPlanet);
}

export function addRoute(from: string, to: string, distance: number) {
  const stmt = db.prepare(
    `INSERT INTO routes (origin, destination, travel_time) VALUES (?, ?, ?)`
  );
  stmt.run(from, to, distance);
}
