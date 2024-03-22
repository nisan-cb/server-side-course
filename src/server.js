// Nisan Cohen Burayev 315433656

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { v4 as uuid } from 'uuid'
import db from './db.js';
import { addCostBodyMiddleware, addCostReqValidation, reportQueriesMiddleware, reportReqValidation } from './middlewares.js';


// Load environment variables
dotenv.config();

const port = process.env.PORT || 3001;

const defaultUser = {
    id: '123123',
    first_name: 'moshe',
    last_name: 'israeli',
    birthday: 'January, 10th, 1990'
}

// express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// about endpoint
app.get('/about', (_req, res) => {
    res.json([
        {
            firstname: 'Nisan',
            lastname: 'Cohen Burayev',
            id: '315433656',
            email: 'nnisan858@gmail.com'
        },
        {
            firstname: 'Israel',
            lastname: 'Israeli',
            id: '123456789',
            email: 'nnisan858@gmail.com'
        },
    ]);
});

// addCost endpoint
app.post('/addcost', addCostBodyMiddleware, addCostReqValidation, async (req, res) => {
    const { user_id, year, month, day, description, category, sum } = req.body;
    try {
        // check user existence 
        if (!await db.isUserExist(req.body.user_id))
            throw new Error(`There is no user with id: ${user_id}`);
        const result = await db.addCostItem({
            user_id,
            year,
            month,
            day,
            id: uuid(),
            description,
            category,
            sum
        })

        res.json(`Cost item added with ID: ${result.insertedId}`)
    } catch (error) {
        console.log(error.message)
        res.status(400).json(error.message)
    }
});

// report endpoint
app.get('/report', reportQueriesMiddleware, reportReqValidation, async (req, res) => {
    try {
        const { year, month, user_id } = req.query;

        // check user existence 
        if (!await db.isUserExist(user_id))
            throw new Error(`There is no user with id: ${user_id}`);
        const resObj = await db.getReportData(user_id, year, month);
        res.json(resObj);
    } catch (error) {
        console.log(error.message);
        res.status(400).json(error.message);
    }
});

// Global endpoint - to catch all other requests - 404
app.get('*', (_req, res) => {
    res.status(404).json("invalid path");
})

// Start the server
app.listen(port, async () => {
    console.log(`Server listening on port ${port}`);

    // CONNECT TO DB
    await db.connect();
    // Create default user (if not exist)
    const isUserExist = await db.isUserExist(defaultUser.id);
    if (!isUserExist)
        db.createUser(defaultUser)
});
