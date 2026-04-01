import * as yup from 'yup';

const passwordRules = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
);

export const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email('Must be a valid email address.')
        .required('Email is required.'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .matches(
            passwordRules,
            'Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
        )
        .required('Password is required.'),
    rememberMe: yup.boolean(),
});