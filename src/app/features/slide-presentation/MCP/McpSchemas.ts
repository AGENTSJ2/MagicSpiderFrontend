import { z } from 'zod';
import { ZIndexActions } from '../domain/EventModels/presentationEvents.model';
import { ShapeType } from '../domain/canvasModels/shapeComponent.model';

export const KonvaAttrsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

export const InitialComponentConfigSchema = z.object({
  attrs: KonvaAttrsSchema.optional(),
  zIndex: z.number().optional(),
});

export const ComponentConfigSchema = z.object({
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
    .int()
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
