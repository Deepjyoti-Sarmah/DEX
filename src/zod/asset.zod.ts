import { z } from "zod";

const AssetZod = z.object({
    eth: z.number().min(0),
    usdc: z.number().min(0),
});

export { AssetZod }
