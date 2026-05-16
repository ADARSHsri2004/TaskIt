export const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
        return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
    }
    return undefined;
};

export const validatePassword = (
    password: string,
    minLength: number = 6
): string | undefined => {
    if (!password) {
        return "Password is required";
    }
    if (password.length < minLength) {
        return `Password must be at least ${minLength} characters`;
    }
    return undefined;
};

export const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
        return "Name is required";
    }
    if (name.trim().length < 2) {
        return "Name must be at least 2 characters";
    }
    return undefined;
};

export const validateTitle = (title: string): string | undefined => {
    if (!title.trim()) {
        return "Title is required";
    }
    if (title.trim().length < 3) {
        return "Title must be at least 3 characters";
    }
    return undefined;
};

export const validateDueDate = (dueDate: string): string | undefined => {
    if (!dueDate) {
        return undefined; // Optional field
    }
    const selectedDate = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return "Due date cannot be in the past";
    }
    return undefined;
};

export const validateFiles = (
    files: FileList | null,
    maxFiles: number = 3
): string | undefined => {
    if (!files || files.length === 0) {
        return undefined; // Optional field
    }
    if (files.length > maxFiles) {
        return `Only ${maxFiles} files are allowed`;
    }
    return undefined;
};
