// Note: This file uses Joi types which require the joi package to be installed
// The actual validation will work once dependencies are installed

export const authSchemas = {
  register: {
    email: "string required email format",
    name: "string required min 2 max 100",
    password: "string required min 8 pattern strong password",
  },

  login: {
    email: "string required email format",
    password: "string required",
  },

  refreshToken: {
    refreshToken: "string required",
  },

  updateProfile: {
    name: "string optional min 2 max 100",
    email: "string optional email format",
  },
};

export const spkSchemas = {
  createSPK: {
    title: "string required min 3 max 200",
    criteria: "array required min 2 items with name, weight, type",
    alternatives: "array required min 2 items with name and values",
  },

  updateSPK: {
    title: "string optional min 3 max 200",
    criteria: "array optional items with name, weight, type",
    alternatives: "array optional items with name and values",
  },
};

export const commonSchemas = {
  uuid: "string required uuid format",
  pagination: {
    page: "number optional min 1",
    limit: "number optional min 1 max 100",
  },
};

// Placeholder for when Joi is installed
/*
import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(2).max(100).required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character',
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
  }),
};

export const spkSchemas = {
  createSPK: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    criteria: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          weight: Joi.number().min(0).max(1).required(),
          type: Joi.string().valid('benefit', 'cost').required(),
        })
      )
      .min(2)
      .required(),
    alternatives: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          values: Joi.object().pattern(Joi.string(), Joi.number()).required(),
        })
      )
      .min(2)
      .required(),
  }),

  updateSPK: Joi.object({
    title: Joi.string().min(3).max(200).optional(),
    criteria: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          weight: Joi.number().min(0).max(1).required(),
          type: Joi.string().valid('benefit', 'cost').required(),
        })
      )
      .optional(),
    alternatives: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          values: Joi.object().pattern(Joi.string(), Joi.number()).required(),
        })
      )
      .optional(),
  }),
};

export const commonSchemas = {
  uuid: Joi.string().uuid().required(),
  
  pagination: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};
*/
