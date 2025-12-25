import request from "supertest";
import express from "express";
import oddsRoutes from "../../../routes/odds.routes";

const app = express();
app.use(express.json());
app.use("/api", oddsRoutes);

describe("POST /api/odds", () => {
  it("should respond with odds data", async () => {
    const response = await request(app)
      .post("/api/odds")
      .send({
        countdown: 5,
        bounty_hunters: [{ planet: "B", day: 1 }],
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(typeof response.body.odds).toBe("number");
  });
});