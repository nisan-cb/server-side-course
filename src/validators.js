// Nisan Cohen Burayev 315433656
// ./validators.js file

export const categories = ['food', 'health', 'housing', 'sport', 'education', 'transportation', 'other'];
export const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const yearValidation = (year) => {
    if (!year || isNaN(year) || year > new Date().getFullYear() || year < 1900)
        throw new Error(`Out of the range: the year expected to be between 1900 to ${new Date().getFullYear()}`);
    return true;
}

export const monthValidation = (month) => {
    if (!month || !months.find((m) => m.toLowerCase() === month.toLowerCase()))
        throw new Error(`Out of the range: month need to be number between 1-12 or string [${months}]`);
    return true;
}

export const dayValidation = (year, month, day) => {
    const daysInMonth = new Date(year, months.findIndex(m => m.toLowerCase() === month.toLowerCase()) + 1, 0).getDate();
    if (!day || isNaN(day) || day < 1 || day > daysInMonth)
        throw new Error(`Out of the range: day need to be number between 1-${daysInMonth}`);
    return true;
}

export const descriptionValidation = (description) => {
    if (!description)
        throw new Error(`Description can'ot be empty `);
    return true;
}

// Category must be one of options in category array
export const categoryValidation = (category) => {
    if (!category || !categories.find(cat => cat.toLowerCase() === category.toLowerCase()))
        throw new Error(`Invalid category name, category should be from the list [${categories}]`);
    return true;
}

// return true if the sum in positive number , and otherwise throw an error
export const sumValidation = (sum) => {
    if (!sum || isNaN(sum) || sum < 0)
        throw new Error(`Invalid sum, should be integer number`);
    return true;
}

// month can be in string or number types,
// this function return the month as string as exist in months array 
export const getMonth = (month) => {
    if (typeof month === 'string' && isNaN(Number(month))) { // for example 'May' or '5'  
        return months.find((m) => m.toLowerCase() === month.toLowerCase());
    } else if (!isNaN(Number(month)) && Number(month) > 0 && Number(month) < 13) {
        return months[Number(month) - 1];
    }
}