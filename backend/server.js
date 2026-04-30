const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// TODO: add routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/investments', require('./routes/investments'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongo connected');
        app.listen(PORT, () => console.log('server running on port ' + PORT));
    })
    .catch(err => {
        console.log('db error', err);
    });
