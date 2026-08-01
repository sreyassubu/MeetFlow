import Joi from "joi";

export const registerUserSchema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required()
});

export const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

export const meetingSchema = Joi.object({
    meetingCode: Joi.string().required()
})

