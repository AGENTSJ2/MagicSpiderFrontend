import { z } from 'zod';
import { ZIndexActions } from '../domain/EventModels/presentationEvents.model';

const KonvaAttrValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(KonvaAttrValueSchema),
    z.record(z.string(), KonvaAttrValueSchema),
  ])
);

export const KonvaAttrsSchema = z.record(z.string(), KonvaAttrValueSchema)
  .describe("Partial configuration containing only the Konva attributes that should be updated. Examples include x, y, width, height, fill, stroke, rotation, opacity, scaleX, scaleY, dash, points, gradient stops, etc.");

export const InitialComponentConfigSchema = z.object({
  attrs: KonvaAttrsSchema.optional(),
  zIndex: z.number().optional(),
});

export const ComponentConfigSchema = z.object({
  attrs: KonvaAttrsSchema,
  zIndex: z.number(),
});

// UNIQUE TO TEXT START
const KonvaTextAttrValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(KonvaAttrValueSchema),
    z.record(z.string(), KonvaAttrValueSchema),
  ])
);

export const TextCoponentConfigSchema = z.object({
  attrs: KonvaAttrsSchema,
  zIndex: z.number(),
});

export const addComponentSchema = z.object({
  slideId: z.string(),
  initialConfig: InitialComponentConfigSchema.optional(),
});

export const AddShapeSchema = addComponentSchema.extend({
  shapeType: z
    .number()
    .min(1)
    .max(2)
    .describe('Shape type: 1 = CIRCLE, 2 = RECT'),
});
export const AddTextSchema = addComponentSchema.extend({
  // TODO override the initial config to toolbox config to support formating
});
export const AddImageSchema = addComponentSchema.extend({
  // TODO override the initial config to serialisable image config to support formating
});

export const updateSchema = z.object({
  slideId: z.string(),
  nodeId: z.string(),
  newConfig: ComponentConfigSchema,
  zIndexActions: z.enum(ZIndexActions).optional(),
});

export const deleteSchema = z.object({
  slideId: z.string(),
  nodeId: z.string(),
});
export const RemoveSlideSchema = z.object({
  slideId: z.string(),
});
