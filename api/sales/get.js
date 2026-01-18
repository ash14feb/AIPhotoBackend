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
        let countSql = 'SELECT COUNT(*) as total FROM PhotoAISales WHERE 1=1';
        const params = [];
        const countParams = [];

        // Debug: Log all query parameters
        console.log('📊 Query parameters:', {
            id, theme, startDate, endDate, minAmount, maxAmount, hasOriginalImage, page, limit
        });

        // Helper function to add conditions
        const addCondition = (condition, value, paramArray) => {
            if (value !== undefined && value !== '') {
                sql += condition;
                countSql += condition;
                paramArray.push(value);
            }
        };

        if (id) {
            sql += ' AND ID = ?';
            countSql += ' AND ID = ?';
            params.push(id);
            countParams.push(id);
        }

        if (theme) {
            sql += ' AND ThemeName LIKE ?';
            countSql += ' AND ThemeName LIKE ?';
            params.push(`%${theme}%`);
            countParams.push(`%${theme}%`);
        }

        if (startDate) {
            sql += ' AND DateTime >= ?';
            countSql += ' AND DateTime >= ?';
            params.push(startDate);
            countParams.push(startDate);
        }

        if (endDate) {
            sql += ' AND DateTime <= ?';
            countSql += ' AND DateTime <= ?';
            params.push(endDate);
            countParams.push(endDate);
        }

        if (minAmount) {
            sql += ' AND Amount >= ?';
            countSql += ' AND Amount >= ?';
            params.push(parseFloat(minAmount));
            countParams.push(parseFloat(minAmount));
        }

        if (maxAmount) {
            sql += ' AND Amount <= ?';
            countSql += ' AND Amount <= ?';
            params.push(parseFloat(maxAmount));
            countParams.push(parseFloat(maxAmount));
        }

        if (hasOriginalImage === 'true') {
            sql += ' AND OriginalImageURL IS NOT NULL';
            countSql += ' AND OriginalImageURL IS NOT NULL';
        } else if (hasOriginalImage === 'false') {
            sql += ' AND OriginalImageURL IS NULL';
            countSql += ' AND OriginalImageURL IS NULL';
        }

        // Add ordering
        sql += ' ORDER BY DateTime DESC, ID DESC';

        // Debug logs
        console.log('🔍 SQL query:', sql);
        console.log('🔍 SQL params:', params);
        console.log('🔍 Count SQL:', countSql);
        console.log('🔍 Count params:', countParams);

        // Get total count FIRST
        let totalCount = 0;
        try {
            const countResult = await query(countSql, countParams);
            console.log('📈 Count result:', countResult);
            totalCount = countResult[0]?.total || 0;
        } catch (countError) {
            console.error('❌ Error getting count:', countError);
            // Continue with totalCount = 0
        }

        // Add pagination - ONLY add LIMIT/OFFSET if not fetching single record by ID
        let paginatedParams = [...params];
        if (!id) {
            const offset = (parseInt(page) - 1) * parseInt(limit);
            sql += ' LIMIT ? OFFSET ?';
            paginatedParams.push(parseInt(limit), offset);
        }

        console.log('🎯 Final SQL with pagination:', sql);
        console.log('🎯 Final params:', paginatedParams);

        // Execute the query
        const sales = await query(sql, paginatedParams);

        console.log('✅ Query successful, found:', sales.length, 'records');

        addCorsHeaders(res, req.headers.origin || "*");
        res.status(200).json({
            success: true,
            data: sales,
            count: sales.length,
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalCount / parseInt(limit))
        });

    } catch (error) {
        console.error('❌ Error fetching sales:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error SQL:', error.sql);

        addCorsHeaders(res, req.headers.origin || "*");
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sales data',
            details: error.message,
            sql: error.sql,
            code: error.code
        });
    }
}