import express from "express";
import cors from "cors";
import { DATA_DIR } from "./config/config";
import oddsRoutes from "./routes/odds.routes";


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
  console.log(`Using external data folder: ${DATA_DIR}`);
});
