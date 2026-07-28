import mongoose from "mongoose";

// 127.0.0.1 rather than localhost on purpose: on some machines localhost
// resolves to ::1 first, and MongoDB listens on IPv4 by default, so the
// connection fails for a reason that has nothing to do with your code.
export const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/flights";

const states = ["disconnected", "connected", "connecting", "disconnecting"];

export function databaseState() {
  return states[mongoose.connection.readyState] || "unknown";
}

// Resolves either way. A database that is not there is a normal thing for
// this app to report, not a reason to crash before the server can explain
// itself, so the failure is logged in words and the API keeps serving.
export async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to MongoDB at ${mongoUri}`);
    return true;
  } catch (error) {
    console.error(`Could not reach MongoDB at ${mongoUri}`);
    console.error(`  ${error.message}`);
    return false;
  }
}
