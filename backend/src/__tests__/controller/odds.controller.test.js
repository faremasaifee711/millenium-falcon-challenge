"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const odds_routes_1 = __importDefault(require("../../src/routes/odds.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api", odds_routes_1.default);
describe("POST /api/odds", () => {
    it("should respond with odds data", async () => {
        const response = await (0, supertest_1.default)(app)
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
