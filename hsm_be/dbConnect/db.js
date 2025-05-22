const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log("MongoDB connected successfully"))
    } catch (err) {
        console.log(`Error in connection  DB ${err}`)
        next(err);
        process.exit();
    }
}

module.exports = connectDb;

