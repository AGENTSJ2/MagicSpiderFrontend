import { z } from 'zod';

/**
 * Shared schema for a basic binary arithmetic operation.
 * Both operands are plain numbers.
 */
export const BinaryOpSchema = z.object({
  a: z.number().describe('The first operand.'),
  b: z.number().describe('The second operand.'),
});

export type BinaryOpArgs = z.infer<typeof BinaryOpSchema>;
