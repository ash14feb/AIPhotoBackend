import Joi from 'joi';

export const salesSchema = Joi.object({
    ThemeName: Joi.string()
        .min(2)
        .max(255)
        .required()
        .messages({
            'string.empty': 'Theme name is required',
            'string.min': 'Theme name must be at least 2 characters long',
            'string.max': 'Theme name must be less than 255 characters'
        }),

    Amount: Joi.number()
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'any.required': 'Amount is required'
        }),

    PhotoURL: Joi.string()
        .uri()
        .max(500)
        .required()
        .messages({
            'string.uri': 'Photo URL must be a valid URL',
            'string.empty': 'Photo URL is required',
            'string.max': 'Photo URL must be less than 500 characters'
        }),

    OriginalImageURL: Joi.string()
        .uri()
        .max(500)
        .optional()
        .allow('')
        .messages({
            'string.uri': 'Original Image URL must be a valid URL',
            'string.max': 'Original Image URL must be less than 500 characters'
        }),

    DateTime: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'DateTime must be a valid date',
            'date.format': 'DateTime must be in ISO format (YYYY-MM-DDTHH:mm:ss)'
        })
});

export const validateSalesData = (data) => {
    return salesSchema.validate(data, { abortEarly: false });
};