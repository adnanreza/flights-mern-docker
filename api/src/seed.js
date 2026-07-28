import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import { connectToDatabase, mongoUri } from "./db.js";
import Flight from "./models/Flight.js";

const flights = JSON.parse(
  readFileSync(new URL("../data/flights.json", import.meta.url), "utf8"),
);

if (!(await connectToDatabase())) {
  console.error("Nothing was seeded.");
  process.exit(1);
}

// Deliberately destructive and safe to run twice: seeding is a reset, not
// an append, so running it again never leaves you with 376 flights.
await Flight.deleteMany({});
await Flight.insertMany(flights);

console.log(`Seeded ${flights.length} flights into ${mongoUri}`);
await mongoose.disconnect();
