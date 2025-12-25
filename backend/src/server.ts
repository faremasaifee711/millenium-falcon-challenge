/**
 * Main server entry point.
 *
 * - Sets up Express app
 * - Enables JSON body parsing
 * - Configures CORS for frontend origin
 * - Mounts /api/odds routes
 * - Starts the server on the configured port
 */
import express from "express";
import cors from "cors";
import oddsRoutes from "./routes/odds.routes";
import { getCachedRoutes } from "./loaders/data.loader";

// -------------------- INIT --------------------

getCachedRoutes();

// -------------------- EXPRESS SERVER --------------------
const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:4173', // frontend app
}));

app.use("/api", oddsRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
