const { addCorsHeaders, handleCorsPreflight } = require('../../utils/cors');
const { query } = require('../../lib/db');

module.exports = async function handler(req, res) {
    // Handle CORS
    if (handleCorsPreflight(req, res)) return;

    if (req.method !== 'GET') {
        addCorsHeaders(res, req.headers.origin || "*");
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            id,
            theme,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            hasOriginalImage,
            page = 1,
            limit = 20
        } = req.query;

        let sql = 'SELECT * FROM PhotoAISales WHERE 1=1';
        const params = [];

        if (id) {
            sql += ' AND ID = ?';
            params.push(id);
        }

        if (theme) {
            sql += ' AND ThemeName LIKE ?';
            params.push(`%${theme}%`);
        }

        if (startDate) {
            sql += ' AND DateTime >= ?';
            params.push(startDate);
        }

        if (endDate) {
            sql += ' AND DateTime <= ?';
            params.push(endDate);
        }

        if (minAmount) {
            sql += ' AND Amount >= ?';
            params.push(parseFloat(minAmount));
        }

        if (maxAmount) {
            sql += ' AND Amount <= ?';
            params.push(parseFloat(maxAmount));
        }

        if (hasOriginalImage === 'true') {
            sql += ' AND OriginalImageURL IS NOT NULL';
        } else if (hasOriginalImage === 'false') {
            sql += ' AND OriginalImageURL IS NULL';
        }

        sql += ' ORDER BY DateTime DESC, ID DESC';

        // Get total count for pagination
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await query(countSql, params);

        // Add pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const sales = await query(sql, params);

        addCorsHeaders(res, req.headers.origin || "*");
        res.status(200).json({
            success: true,
            data: sales,
            count: sales.length,
            total: countResult.total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(countResult.total / parseInt(limit))
        });

    } catch (error) {
        console.error('Error fetching sales:', error);
        addCorsHeaders(res, req.headers.origin || "*");
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sales data',
            details: error.message
        });
    }
}