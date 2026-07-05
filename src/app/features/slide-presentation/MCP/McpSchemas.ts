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

export const addComponentSchema = z.object({
  slideId: z.string(),
  initialConfig: InitialComponentConfigSchema.optional(),
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


// UNIQUE TO TEXT START
export const KonvaTextAttrsSchema = z
  .record(z.string(), KonvaAttrValueSchema)
  .describe(`
    Partial configuration containing only the Konva Text attributes that should be updated.

    Standard Konva Text attributes include:
    x, y, width, height, fill, stroke, rotation, opacity,
    scaleX, scaleY, fontSize, fontFamily, fontStyle,
    align, verticalAlign, lineHeight, padding, wrap, ellipsis, etc.

    This schema may also contain custom text editor attributes:
    - listType: 'none' | 'bullet' | 'number' 
    - bulletStyle: 'disc' | 'circle' | 'square' | 'dash' | 'check'
    - numberStyle: 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman'
    Note : 
    - text should be line break separated in order to apply list
    - In order to apply list listType should not be none or undefined
    - Do not add the 1 in text in case of u want to add numbered and the bullet yourself just set it as linebreak separated and apply the list type as numbered or bullet list then add the corresponding style

  `);

export const TextComponentConfigSchema = z.object({
  attrs: KonvaTextAttrsSchema,
  zIndex: z.number(),
});

export const AddTextSchema = addComponentSchema.extend({
  initialConfig:TextComponentConfigSchema.optional()
});

export const updateTextSchema = z.object({
  slideId: z.string(),
  nodeId: z.string(),
  newConfig: TextComponentConfigSchema,
  zIndexActions: z.enum(ZIndexActions).optional(),
});

// TEXT UNIQUE ENDED
export const AddShapeSchema = addComponentSchema.extend({
  shapeType: z
    .number()
    .min(1)
    .max(2)
    .describe('Shape type: 1 = CIRCLE, 2 = RECT'),
});

// Image
export const KonvaImageAttrsSchema = z
  .record(z.string(), KonvaAttrValueSchema)
  .describe(`
    Partial configuration containing only the Konva Image attributes that should be updated.

    Standard Konva Image attributes include:
    x, y, width, height, fill, stroke, rotation, opacity,
    scaleX, scaleY, fontSize, fontFamily, fontStyle,
    align, verticalAlign, lineHeight, padding, wrap, ellipsis, etc.

    This Schema Also include an mandatory imageId , 
    This is the id of image available in application.
    call "available-images" resource call to get more info in case of unavailable imageId 
  `);
export const ImageComponentConfigSchema = z.object({
  attrs: KonvaImageAttrsSchema,
  zIndex: z.number(),
});
export const AddImageSchema = addComponentSchema.extend({
  initialConfig:ImageComponentConfigSchema
});


export const RemoveSlideSchema = z.object({
  slideId: z.string(),
});

export const SlideArchitectSchema = z.object({
  userPrompt: z
    .string()
    .describe(
      'The user request describing what should be created or changed in the presentation',
    ),
  scratchBook: z
    .string()
    .optional()
    .describe(
      'Scratch book content holding the slide contents and notes the design should be based on',
    ),
  currentSlideJson: z
    .string()
    .optional()
    .describe(
      'JSON of the existing presentation slides, used to reference existing slideIds and component ids',
    ),
});
