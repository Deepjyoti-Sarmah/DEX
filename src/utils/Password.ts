import bcypt from "bcrypt"

const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    const hashedPassword = await bcypt.hash(password, saltRounds);
    return hashedPassword;
}

const isPasswordCorrect = async (password: string, userPassword: string): Promise<boolean> => {
    return bcypt.compare(password, userPassword);
}

export {
    hashPassword,
    isPasswordCorrect
}
