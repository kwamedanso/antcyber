import * as yup from 'yup';

const passwordRules = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
);

export const registerSchema = yup.object().shape({
    first_name: yup
        .string()
        .required('First name is required.')
        .max(50, 'First name cannot exceed 50 characters.'),
    last_name: yup
        .string()
        .required('Last name is required.')
        .max(50, 'Last name cannot exceed 50 characters.'),
    email: yup
        .string()
        .email('Must be a valid email address.')
        .required('Email is required.'),
    phone_number: yup
        .string()
        .required('Phone number is required.')
        .matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, 'Phone number format is invalid.'),
    company_name: yup
        .string()
        .max(100, 'Company name cannot exceed 100 characters.'),
    country: yup
        .string()
        .required('Country is required.'),
    city: yup
        .string()
        .required('City is required.'),
    address: yup
        .string()
        .required('Address is required.'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .matches(
            passwordRules,
            'Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
        )
        .required('Password is required.'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match.')
        .required('Confirm password is required.'),
});