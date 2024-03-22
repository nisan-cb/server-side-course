// Nisan Cohen Burayev 315433656

import { getMonth, categories, yearValidation, monthValidation, dayValidation, categoryValidation, sumValidation } from './validators.js';


// convert income details to correct type - in addCost endpoint
export const addCostBodyMiddleware = (req, _res, next) => {
    req.body.user_id = String(req.body.user_id);
    req.body.year = Number(req.body.year);
    req.body.month = getMonth(req.body.month);
    req.body.day = Number(req.body.day);
    req.body.description = String(req.body.description);
    req.body.category = String(req.body.category);
    req.body.sum = Number(req.body.sum);
    next();
}

// validation to income data - for addCost endpoint
export const addCostReqValidation = (req, res, next) => {
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

// convert income details to correct type - in report endpoint
export const reportQueriesMiddleware = (req, _res, next) => {
    req.query.year = Number(req.query.year);
    req.query.month = getMonth(req.query.month);
    next();
}

// validation to income data - for report endpoint
export const reportReqValidation = (req, res, next) => {
    try {
        yearValidation(req.query.year);
        monthValidation(req.query.month);
        next();
    } catch (error) {
        console.log(error.message)
        res.json(error.message)
    }
}