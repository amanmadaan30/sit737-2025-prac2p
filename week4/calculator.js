const express = require("express");
const app = express();
const fs = require('fs');
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// define all arithmetic functions
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

// validate inputs if correct numeric value is input for calculation
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
        console.log()
        throw new Error("Parsing Error");
    }
    logger.info('Parameters ' + n1 + ' and ' + n2 + ' received for calculation');

    return { n1, n2 };
}
// addition end point
app.get("/add", (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req); //validate input values
        const result = add(n1, n2);
        res.status(200).json({ statuscocde: 200, data: result }); // print status code 200 if success
    } catch (error) {
        console.error(error)
        res.status(500).json({ statuscocde: 500, msg: error.toString() }) // print status code 500 if request fails
    }
});

// subtraction endpoint
app.get("/subtract", (req, res) => {
    try {
        const { n1, n2 } = validateInputs(req); //validate input values
        const result = subtract(n1, n2); // call subtract function
        logger.info(`Subtraction result: ${result}`); // print result in log file
        res.status(200).json({ statuscode: 200, data: result }); // success print status code
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });// failure status code print
    }
});

// multiply end point
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

// division end point
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
// exponentiate end point
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

// square root end point
app.get("/sqrt", (req, res) => {
    try {
        const { n1 } = validateInputs(req, true);
        const result = sqrt(n1);
        logger.info(`Square root result: ${result}`);
        res.status(200).json({ statuscode: 200, data: result });
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ statuscode: 500, msg: error.message });
    }
});

// modulus end point
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

//define port value on which the server listens
const port = 3000;
app.listen(port, () => {
    logger.info(`Server listening on port ${port}`); // print log message
    console.log("hello i'm listening to port " + port); // print console message
})