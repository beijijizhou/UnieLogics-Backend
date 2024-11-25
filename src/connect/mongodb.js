const mongoose = require("mongoose");

// Use your working connection string here
const dbURI = "mongodb+srv://userCompass:user12345@cluster0.tkxsn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
async function connectToDatabase() {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongoose connected to MongoDB successfully!");
  } catch (err) {
    console.error("Mongoose connection error:", err.message);
  }
}

// Monitor connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose default connection is open.");
});

mongoose.connection.on("error", (err) => {
  console.error(`Mongoose default connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose default connection is disconnected.");
});

// Handle app termination gracefully
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection is disconnected due to app termination.");
  process.exit(0);
});

connectToDatabase();
