import express from "express";
import cors from "cors";
import { connectToDatabase, databaseState, mongoUri } from "./db.js";
import flightsRouter from "./routes/flights.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: databaseState() });
});

app.use("/api", flightsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong" });
});

await connectToDatabase();

app.listen(port, () => {
  console.log(`Flights API listening on http://localhost:${port}`);
  console.log(`Database: ${databaseState()} (${mongoUri})`);
});
