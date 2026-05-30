import { z } from 'zod';
import { ZIndexActions } from '../domain/EventModels/presentationEvents.model';
import { ShapeType } from '../domain/canvasModels/shapeComponent.model';

export const createAddSchema = (isShape: boolean) => {
  if (isShape) {
    return z.object({
      slideId: z.string(),
      shapeType: z.enum(ShapeType),
    });
  }
  return z.object({
    slideId: z.string(),
  });
};

export const createUpdateSchema = () =>
  z.object({
    slideId: z.string(),
    nodeId: z.string(),
    newConfig: ComponentConfigSchema,
    zIndexActions: z.enum(ZIndexActions).optional(),
  });

export const createDeleteSchema = () =>
  z.object({
    slideId: z.string(),
    nodeId: z.string(),
  });

export const KonvaAttrsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

export const ComponentConfigSchema = z.object({
  attrs: KonvaAttrsSchema,
  zIndex: z.number(),
});

