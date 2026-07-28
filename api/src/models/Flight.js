import mongoose from "mongoose";

const flightSchema = new mongoose.Schema({
  flightNumber: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  airlineCode: { type: String, required: true },
  from: { type: String, required: true, uppercase: true },
  to: { type: String, required: true, uppercase: true },
  departs: { type: String, required: true },
  arrives: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  priceCad: { type: Number, required: true },
  nonstop: { type: Boolean, default: true },
});

flightSchema.index({ from: 1, to: 1, departs: 1 });

export default mongoose.model("Flight", flightSchema);
