import { z } from "zod"

const SideEnum = z.enum(["buy", "sell"]);

const QuantitySide = z.object({
    quantity: z.number().min(0),
    side: SideEnum.optional()
});

export { QuantitySide }
