const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // Requirements:
    // 1. At least 8 characters: .{8,}
    // 2. At least 1 lowercase letter: (?=.*[a-z])
    // 3. At least 1 uppercase letter: (?=.*[A-Z])
    // 4. At least 1 number: (?=.*\d)
    // 5. At least 1 special character (e.g., !@#$%^&*): (?=.*[!@#$%^&*])

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    return passwordRegex.test(password);
};

const validatePhone = (phone) => {
    // Basic phone validation - adjust based on your needs
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};

const validateRegistration = (userData) => {
    const { name, email, password, role } = userData;
    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name is required');
    }

    if (!email || !validateEmail(email)) {
        errors.push('Valid email is required');
    }

    if (!password || !validatePassword(password)) {
        errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character.');
    }

    if (!role || role.trim().length < 2) {
        errors.push("Role must be at least 2 characters long")
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateLogin = (email, password) => {
    const errors = [];

    if (!email || !validateEmail(email)) {
        errors.push('Invalid email or password.');
    }

    if (!password || !validatePassword(password)) {
        errors.push('Invalid email or password.');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateEmail,
    validatePassword,
    validatePhone,
    validateRegistration,
    validateLogin,
};