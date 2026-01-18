const { addCorsHeaders, handleCorsPreflight } = require('../../utils/cors');
const { query } = require('../../lib/db');
const { validateSalesData } = require('../../utils/validation');

module.exports = async function handler(req, res) {
    // Handle CORS
    if (handleCorsPreflight(req, res)) return;

    if (req.method !== 'PUT') {
        addCorsHeaders(res, req.headers.origin || "*");
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { id, ...updateData } = req.body;

        if (!id || isNaN(id)) {
            addCorsHeaders(res, req.headers.origin || "*");
            return res.status(400).json({
                success: false,
                error: 'Valid ID is required'
            });
        }

        // Validate input
        const { error, value } = validateSalesData(updateData);

        if (error) {
            addCorsHeaders(res, req.headers.origin || "*");
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        const { ThemeName, Amount, PhotoURL, OriginalImageURL, DateTime } = value;

        const result = await query(
            `UPDATE PhotoAISales 
             SET ThemeName = ?, Amount = ?, PhotoURL = ?, OriginalImageURL = ?, 
                 DateTime = ?, UpdatedAt = CURRENT_TIMESTAMP 
             WHERE ID = ?`,
            [
                ThemeName,
                Amount,
                PhotoURL,
                OriginalImageURL || null,
                DateTime || new Date().toISOString().slice(0, 19).replace('T', ' '),
                id
            ]
        );

        if (result.affectedRows === 0) {
            addCorsHeaders(res, req.headers.origin || "*");
            return res.status(404).json({
                success: false,
                error: 'Sale record not found'
            });
        }

        // Fetch the updated record
        const [updatedSale] = await query(
            'SELECT * FROM PhotoAISales WHERE ID = ?',
            [id]
        );

        addCorsHeaders(res, req.headers.origin || "*");
        res.status(200).json({
            success: true,
            message: 'Sale record updated successfully',
            data: updatedSale
        });

    } catch (error) {
        console.error('Error updating sale:', error);
        addCorsHeaders(res, req.headers.origin || "*");
        res.status(500).json({
            success: false,
            error: 'Failed to update sale record',
            details: error.message
        });
    }
}