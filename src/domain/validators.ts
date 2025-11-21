import { z } from "zod";

export const CellStateSchema = z.union([z.literal(0), z.literal(1)]);

export const BoardSchema = z
  .array(z.array(CellStateSchema))
  .min(1, "Board must have at least one row")
  .refine(
    (rows) => rows.every((row) => row.length === rows[0]?.length),
    "All rows must have the same length"
  );

export type BoardInput = z.infer<typeof BoardSchema>;
