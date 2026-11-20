const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const { loadDataset } = require('./data/gtfsLoader');
const app = require('./app');

const PORT = process.env.PORT || 5000;

/**
 * Initialize services and start server.
 * Connects to MongoDB first, preloads GTFS dataset, then starts listening.
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB before starting Express listener
    await connectDB();

    // 2. Preload GTFS dataset into memory
    console.log('Loading MSRTC GTFS dataset into memory...');
    const startTime = Date.now();
    loadDataset();
    console.log(`GTFS dataset loaded successfully in ${Date.now() - startTime}ms`);

    // 3. Start Express HTTP server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server due to connection error:', error.message);
    process.exit(1);
  }
};

startServer();
