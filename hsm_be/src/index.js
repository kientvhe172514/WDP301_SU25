
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const morgan = require("morgan");
// const httpErrors = require("http-errors");
require("dotenv").config();

const connectDB = require("../dbConnect/db");
const router = require("./routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));


app.use('/api/account', require('./routes/AccountRouter'));



app.use(async (err, req, res, next) => {
  (res.status = err.status || 500),
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
});

connectDB();
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
