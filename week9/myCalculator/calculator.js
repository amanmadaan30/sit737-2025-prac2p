const express = require("express");
const app = express();
const fs = require('fs');
const winston = require('winston');
const { MongoClient } = require('mongodb');

// MongoDB connection setup
const mongoUri = process.env.MONGO_URI || "mongodb://adminuser:password@localhost:27017/mydb?authSource=admin";
const client = new MongoClient(mongoUri);
let db;

async function connectToDB() {
    try {
        await client.connect();
        db = client.db(); // DB name is part of URI
        console.log("Connected to MongoDB");
        logger.info("Connected to MongoDB");
    } catch (err) {
        logger.error("MongoDB connection error: " + err);
        process.exit(1);
    }
}

// Setup logging with Winston
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-service' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// Define arithmetic functions
const add = (n1, n2) => n1 + n2;
const subtract = (n1, n2) => n1 - n2;
const multiply = (n1, n2) => n1 * n2;
const divide = (n1, n2) => {
    if (n2 === 0) {
        throw new Error("Division by zero is not allowed");
    }
    return n1 / n2;
};
const exponentiate = (n1, n2) => Math.pow(n1, n2);
const sqrt = (n1) => {
    if (n1 < 0) {
        throw new Error("Square root of a negative number is not allowed");
    }
    return Math.sqrt(n1);
};
const modulo = (n1, n2) => n1 % n2;

// Validate inputs
const validateInputs = (req) => {
    const n1 = parseFloat(req.query.n1);
    const n2 = parseFloat(req.query.n2);
    if (isNaN(n1)) {
        logger.error("n1 is incorrectly defined");
        throw new Error("n1 incorrectly defined");
    }
    if (isNaN(n2)) {
        logger.error("n2 is incorrectly defined");
        throw new Error("n2 incorrectly defined");
    }

    if (n1 === NaN || n2 === NaN) {
        throw new Error("Parsing Error");
    }
    logger.info('Parameters ' + n1 + ' and ' + n2 + ' received for calculation');

    return { n1, n2 };
}

// Save calculation result to MongoDB
async function saveToDB(n1, n2, operation, result) {
    const collection = db.collection('calculations');
    const logEntry = {
        n1, n2, operation, result, timestamp: new Date()
    };
    await collection.insertOne(logEntry);
    logger.info(`Saved calculation result to MongoDB: ${operation} of ${n1} and ${n2} = ${result}`);
}

// Define calculation endpoints
app.get("/", (req, res) => {
    res.send("Welcome to the Calculator Microservice!");
});

// Addition endpoint with MongoDB integration
app.get("/add", async (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req); // Validate inputs
        const result = add(n1, n2);
        await saveToDB(n1, n2, "addition", result); // Save the result to MongoDB
        res.status(200).json({ statuscode: 200, data: result }); // Send response
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// Subtraction endpoint
app.get("/subtract", (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req);
        const result = subtract(n1, n2);
        logger.info(`Subtraction result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// Multiply endpoint
app.get("/multiply", (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req);
        const result = multiply(n1, n2);
        logger.info(`Multiplication result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// Divide endpoint
app.get("/divide", (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req);
        const result = divide(n1, n2);
        logger.info(`Division result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// Exponentiate endpoint
app.get("/exponentiate", (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req);
        const result = exponentiate(n1, n2);
        logger.info(`Exponentiation result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// Square root endpoint
app.get("/sqrt", (req, res) => {
    try {
        const { n1 } = validateInputs(req);
        const result = sqrt(n1);
        logger.info(`Square root result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// Modulo endpoint
app.get("/modulo", (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req);
        const result = modulo(n1, n2);
        logger.info(`Modulo result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// Start the application and connect to the database
const port = 3010;
connectToDB().then(() => {
    app.listen(port, () => {
        logger.info(`Server listening on port ${port}`);
        console.log("hello I'm listening to port " + port);
    });
});
