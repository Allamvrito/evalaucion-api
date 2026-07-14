const db = require('../config/database');

async function paginate(table, { page = 1, limit = 5, sortBy = 'ID', order = 'ASC', filter = '', filterField = 'NAME_PERSON' } = {}) {
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM ${table}`;
    let countquery = `SELECT COUNT(*) as total FROM ${table}`;
    const params = [];
    const coutParams = [];

    if (filter) {
        query += ` WHERE ${filterField} LIKE ?`
        countquery += ` WHERE ${filterField} LIKE ?`
        params.push(`%${filter}%`);
        coutParams.push(`%${filter}%`);
    }

    const allowedSort = ['ID', filterField];
    const sortField = allowedSort.includes(sortBy) ? sortBy : 'ID';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    const [countResult] = await db.query(countquery, coutParams);

    return {
        data: rows,
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit)
    };
}

module.exports = paginate;