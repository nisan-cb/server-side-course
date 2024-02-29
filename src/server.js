import express from 'express';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import { v4 as uuid } from 'uuid'

// Load environment variables
dotenv.config();

// Constants
const mongoConnectionUrl = process.env.MONGO_CONNECTION_URL;
const port = process.env.PORT || 3001;
const categories = ['food', 'health', 'housing', 'sport', 'education', 'transportation', 'other'];
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const defaultUser = {
    id: '123123',
    first_name: 'moshe',
    last_name: 'israeli',
    birthday: 'January, 10th, 1990'
}

// DB
const dbName = 'db1';
const mongoClient = new MongoClient(mongoConnectionUrl);

// express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const addCostBodyMiddleware = (req, _res, next) => {
    req.body.user_id = String(req.body.user_id);
    req.body.year = Number(req.body.year);
    req.body.month = getMonth(req.body.month);
    req.body.day = Number(req.body.day);
    req.body.description = String(req.body.description);
    req.body.category = (() => {
        return categories.find(cat => cat.toLowerCase() === String(req.body.category).toLowerCase());
    })();
    req.body.sum = Number(req.body.sum);
    next();
}

const reportQueriesMiddleware = (req, _res, next) => {
    req.query.year = Number(req.query.year);
    req.query.month = getMonth(req.query.month);

    next();
}

const addCostReqValidation = (req, res, next) => {
    try {
        yearValidation(req.body.year);
        monthValidation(req.body.month);
        dayValidation(req.body.year, req.body.month, req.body.day);
        descriptionValidation(req.body.description);
        categoryValidation(req.body.category);
        sumValidation(req.body.sum)
        next();
    } catch (error) {
        console.log(error.message)
        res.json(error.message)
    }
}

const reportReqValidation = (req, res, next) => {
    try {
        yearValidation(req.query.year);
        monthValidation(req.query.month);
        next();
    } catch (error) {
        console.log(error.message)
        res.json(error.message)
    }
}


// Routes : //
// about 
app.get('/about', (req, res) => {
    res.json([{
        firstname: 'Nisan',
        lastname: 'Cohen Burayev',
        id: '315433656',
        email: 'nnisan858@gmail.com'
    }]);
});

// addCost
app.post('/addcost', addCostBodyMiddleware, addCostReqValidation, async (req, res) => {
    const { user_id, year, month, day, description, category, sum } = req.body;
    try {
        // check user existence 
        if (!await isUserExist(req.body.user_id))
            throw new Error(`There is no user with id: ${user_id}`);
        const result = await addCostItem({
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
        res.json(error.message)
    }
});

// report
app.get('/report', reportQueriesMiddleware, reportReqValidation, async (req, res) => {
    try {
        const { year, month, user_id } = req.query;
        const costsCollection = mongoClient.db(dbName).collection('costs');
        const cursor = costsCollection.find({ user_id, year, month });
        const resObj = Object.fromEntries(categories.map(c => [c, []]));
        for await (const doc of cursor) {
            resObj[doc.category].push({ day: doc.day, description: doc.description, sum: doc.sum });
        }
        res.json(resObj);
    } catch (error) {
        console.log(error.message);
        res.json(error.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);

    // CONNECT TO DB
    mongoClient.connect()
        .then(() => console.log('Connected successfully to DB'))
        .then(async () => {
            // create default user (if not exist)
            const usersCollection = mongoClient.db(dbName).collection('users');
            const existingUser = await usersCollection.findOne({ id: defaultUser.id });
            if (!existingUser)
                createUser(defaultUser)
        });
});

// Helper functions
const createUser = async (userObj) => {
    try {
        const usersCollection = mongoClient.db(dbName).collection('users');
        const result = await usersCollection.insertOne(userObj);
        console.log(`User added with ID: ${result.insertedId}`);
    } catch (error) {
        console.log(error);
    }
}

const isUserExist = async (user_id) => {
    try {
        const usersCollection = mongoClient.db(dbName).collection('users');
        const existingUser = await usersCollection.findOne({ id: String(user_id) });
        return existingUser ? true : false;
    } catch (error) {
        return false;
    }
}

const addCostItem = async (costItem) => {
    try {
        const costsCollection = mongoClient.db(dbName).collection('costs');
        const result = await costsCollection.insertOne(costItem);
        console.log(`Cost item added with ID: ${result.insertedId}`);
        return result;
    } catch (error) {
        console.log(error);
    }
}

const yearValidation = (year) => {
    if (!year || isNaN(year) || year > new Date().getFullYear() || year < 1900)
        throw new Error(`Out of the range: the year expected to be between 1900 to ${new Date().getFullYear()}`);
    return true;
}

const monthValidation = (month) => {
    if (!month || !months.find((m) => m.toLowerCase() === month.toLowerCase()))
        throw new Error(`Out of the range: month need to be number between 1-12 or string [${months}]`);
    return true;
}

const dayValidation = (year, month, day) => {
    const daysInMonth = new Date(year, months.findIndex(m => m.toLowerCase() === month.toLowerCase()) + 1, 0).getDate();
    if (!day || isNaN(day) || day < 1 || day > daysInMonth)
        throw new Error(`Out of the range: day need to be number between 1-${daysInMonth}`);
    return true;
}

const descriptionValidation = (description) => {
    if (!description)
        throw new Error(`Description can'ot be empty `);
    return true;
}

const categoryValidation = (category) => {
    if (!category || !categories.find(cat => cat.toLowerCase() === category.toLowerCase()))
        throw new Error(`Invalid category name, category should be from the list [${categories}]`);
    return true;
}

const sumValidation = (sum) => {
    if (!sum || isNaN(sum) || sum < 0)
        throw new Error(`Invalid sum, should be integer number`);
    return true;
}

const getMonth = (month) => {
    if (typeof month === 'string' && isNaN(Number(month))) {
        return months.find((m) => m.toLowerCase() === month.toLowerCase());
    } else if (!isNaN(Number(month)) && Number(month) > 0 && Number(month) < 13) {
        return months[Number(month) - 1];
    }
}
