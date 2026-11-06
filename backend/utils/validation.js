exports.validateUsername = (username) => {

    const usernameRegex = /^[a-zA-Z0-9_.]+$/;

    if (!username || typeof username !== "string") {
        throw new Error("Username is required");
    }

    username = username.trim();

    if (username.length < 5 || username.length > 30) {
        throw new Error(
            "Username must be between 5 and 30 characters"
        );
    }

    if (/\s/.test(username)) {
        throw new Error(
            "Username cannot contain spaces"
        );
    }

    if (!usernameRegex.test(username)) {
        throw new Error(
            "Username can only contain letters, numbers, underscores, and dots"
        );
    }

    if (!/[a-zA-Z]/.test(username)) {
        throw new Error(
            "Username must contain at least one letter"
        );
    }

    if (
        !/^[a-zA-Z0-9]/.test(username) ||
        !/[a-zA-Z0-9]$/.test(username)
    ) {
        throw new Error(
            "Username cannot start or end with an underscore or dot"
        );
    }

    return username;

};

exports.validateFullName = (fullName) => {

    const nameRegex = /^[A-Za-z\s]+$/;

    if (!fullName || typeof fullName !== "string") {
        throw new Error("Full name is required");
    }

    // fullName = fullName.trim();
    fullName = fullName.trim().replace(/\s+/g, " ");

    if (
        fullName.length < 2 ||
        fullName.length > 50 ||
        !nameRegex.test(fullName)
    ) {
        throw new Error(
            "Name must be min 2 and max 50 characters and only letters"
        );
    }

    if (/\s{2,}/.test(fullName)) {
        throw new Error(
            "Name cannot contain multiple consecutive spaces"
        );
    }

    return fullName;

};

exports.validateEmail = (email) => {

    const hasSpaces = /\s/;

    const emailRegex =
        /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._]{3,90}@([a-zA-Z-]+\.)+(com|org|net|info|tech|biz|name|pro|in|co\.in|us|uk|co\.uk|ca|au|nz|jp|cn|de|fr|edu|gov|ac\.in|edu\.in)$/;

    if (!email) {
        throw new Error("Email is required");
    }

    email = email.trim();

    if (!emailRegex.test(email) || hasSpaces.test(email)) {
        throw new Error("Invalid email format");
    }

    if (email.length > 100) {
        throw new Error(
            "Email must not exceed 100 characters"
        );
    }

    return email;

};

exports.validatePassword = (
    password,
    { required = true } = {}
) => {

    const hasSpaces = /\s/;

    const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,20}$/;

    if (!password) {

        if (required) {
            throw new Error("Password is required");
        }

        return null;
    }

    if (
        password.length < 6 ||
        password.length > 20
    ) {
        throw new Error(
            "Password must be between 6 and 20 characters"
        );
    }

    if (hasSpaces.test(password)) {
        throw new Error(
            "Password cannot contain spaces"
        );
    }

    if (!passwordRegex.test(password)) {
        throw new Error(
            "Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
        );
    }

    return password;

};