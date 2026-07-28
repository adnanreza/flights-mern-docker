import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import mongoose from "mongoose";
import Flight from "../models/Flight.js";

const airports = JSON.parse(
  readFileSync(new URL("../../data/airports.json", import.meta.url), "utf8"),
);

const router = Router();

// The airport list is static reference data, so it ships with the code and
// works whether or not the database is up. Only the flights need Mongo.
router.get("/airports", (req, res) => {
  res.json(airports);
});

// Attached to the routes that need Mongo, one at a time, rather than to
// the whole router: a blanket router.use() would also answer 503 for URLs
// that simply do not exist, which is a confusing thing to tell someone who
// only mistyped a path.
//
// Saying "the database is down" plainly beats a stack trace, and it keeps
// that failure distinguishable from "your search matched nothing" — two
// very different problems that look identical in the UI if the API is
// careless about which one it reports.
function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "The database is not reachable. Is MongoDB running?",
    });
  }
  next();
}

router.get("/airlines", requireDatabase, async (req, res) => {
  const codes = await Flight.aggregate([
    { $group: { _id: "$airlineCode", name: { $first: "$airline" } } },
    { $sort: { name: 1 } },
  ]);
  res.json(codes.map(({ _id, name }) => ({ code: _id, name })));
});

router.get("/flights", requireDatabase, async (req, res) => {
  const { from, to, airline } = req.query;

  const query = {};
  if (from) query.from = String(from).toUpperCase();
  if (to) query.to = String(to).toUpperCase();
  if (airline) query.airlineCode = String(airline).toUpperCase();

  const flights = await Flight.find(query).sort({ departs: 1 }).lean();
  res.json(flights);
});

router.get("/flights/:flightNumber", requireDatabase, async (req, res) => {
  const flight = await Flight.findOne({
    flightNumber: req.params.flightNumber.replace("-", " ").toUpperCase(),
  }).lean();

  if (!flight) return res.status(404).json({ error: "No such flight" });
  res.json(flight);
});

export default router;
