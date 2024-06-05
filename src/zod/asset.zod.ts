import { z } from "zod";

const SideEnum = z.enum(["buy", "sell"]);

const AssetZod = z.object({
    eth: z.number().min(0),
    usdc: z.number().min(0),
    quantity: z.number().min(0).optional(),
    side: SideEnum.optional()
});

export { AssetZod }
