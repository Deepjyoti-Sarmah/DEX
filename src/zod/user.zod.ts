import { z } from "zod";

const UserZod = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(8)
});

export { UserZod }
