import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { Presentation } from '../domain/canvasModels/presenatation.model';
import { McpActions } from './mcp.actions';
import { InternalMcpError } from './mcp.erros';

type ToolHandler = {
  toolDesc: Tool;
  execute: (args: any) => Promise<unknown>;
};

export class MCP {
  readonly mcpActions!: McpActions;
  constructor(private presentation: Presentation) {
    this.mcpActions = new McpActions(presentation);
  }

  private handlers = new Map<string, ToolHandler>([
    [
      addShapeTool.name,
      {
        toolDesc: addShapeTool,
        execute: async (args) => this.mcpActions.addShape(args),
      },
    ],
    [
      updateShapeTool.name,
      {
        toolDesc: updateShapeTool,
        execute: async (args) => this.mcpActions.updateShape(args),
      },
    ],
    [
      deleteShapeTool.name,
      {
        toolDesc: deleteShapeTool,
        execute: async (args) => this.mcpActions.deleteShape(args),
      },
    ],
    [
      addTextTool.name,
      {
        toolDesc: addTextTool,
        execute: async (args) => this.mcpActions.addText(args),
      },
    ],
    [
      updateTextTool.name,
      {
        toolDesc: updateTextTool,
        execute: async (args) => this.mcpActions.updateText(args),
      },
    ],
    [
      deleteTextTool.name,
      {
        toolDesc: deleteTextTool,
        execute: async (args) => this.mcpActions.deleteText(args),
      },
    ],
    [
      addImageTool.name,
      {
        toolDesc: addImageTool,
        execute: async (args) => this.mcpActions.addImage(args),
      },
    ],
    [
      updateImageTool.name,
      {
        toolDesc: updateImageTool,
        execute: async (args) => this.mcpActions.updateImage(args),
      },
    ],
    [
      deleteImageTool.name,
      {
        toolDesc: deleteImageTool,
        execute: async (args) => this.mcpActions.deleteImage(args),
      },
    ],
    [
      addSlideTool.name,
      {
        toolDesc: addSlideTool,
        execute: async () => this.mcpActions.addSlide(),
      },
    ],
    [
      removeSlideTool.name,
      {
        toolDesc: removeSlideTool,
        execute: async (args) => this.mcpActions.removeSlide(args),
      },
    ],
  ]);

  listTools(): Tool[] {
    const toolHandlers = [...this.handlers.values()];
    const tools = toolHandlers.map((val) => val.toolDesc);
    return tools;
  }

  async callTool(params: { toolName: string; args: any }) {
    const tool = this.handlers.get(params.toolName);
    if (!tool) {
      throw new InternalMcpError(`No tool of name ${params.toolName} is available`);
    }
    const toolResponse = await tool.execute(params.args!);
    return toolResponse;
  }
}
// Tool Descriptions bellow
const addShapeTool: Tool = {
  name: 'addShape',
  description:
    'Add a new shape component to a slide. Creates a shape of the specified type and inserts it onto the target slide. Optionally accepts initial Konva attributes and z index.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
        description:
          'The identifier of the slide where the shape should be added.',
      },
      shapeType: {
        type: 'number',
        description:
          'The type of shape to create (rectangle = 2, circle = 1,).',
      },
      initialConfig: {
        type: 'object',
        description:
          'Optional initial configuration for the new shape. Use this to set position, size, color, rotation, opacity, or layer order at creation time.',
        properties: {
          attrs: {
            type: 'object',
            description:
              'Initial Konva Shape attributes. Examples include x, y, width, height, fill, stroke, strokeWidth, rotation, opacity, scaleX, and scaleY.',
          },
          zIndex: {
            type: 'number',
            description:
              'Initial Konva z index of the shape. Defaults to 0 when omitted.',
          },
        },
      },
    },
    required: ['slideId', 'shapeType'],
  },
};

const updateShapeTool: Tool = {
  name: 'updateShape',
  description:
    'Update an existing shape on a slide. Use this tool whenever a user wants to move, resize, rotate, recolor, reorder, or otherwise modify a shape. Only provide the Konva attributes that need to be changed; unspecified attributes will remain unchanged.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
        description: 'The identifier of the slide containing the shape.',
      },
      nodeId: {
        type: 'string',
        description: 'The identifier of the shape to update.',
      },
      newConfig: {
        type: 'object',
        properties: {
          attrs: {
            type: 'object',
            description:
              'Partial configuration containing only the Konva Shape attributes that should be updated. Examples include x, y, width, height, fill, stroke, rotation, opacity, scaleX, scaleY, etc.',
          },
          zIndex: {
            type: 'number',
            description: 'Konva z index of the component',
          },
        },
        required: ['attrs', 'zIndex'],
      },
      zIndexActions: {
        type: 'string',
        description:
          'Optional layer ordering operation. Use when the user asks to bring a shape forward, send it backward, move it to the front, or move it to the back.',
      },
    },
    required: ['slideId', 'nodeId', 'newConfig'],
  },
};
const deleteShapeTool: Tool = {
  name: 'deleteShape',
  description: 'Remove a shape component from a slide.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
        description: 'The slide containing the shape.',
      },
      nodeId: {
        type: 'string',
        description: 'The identifier of the shape to remove.',
      },
    },
    required: ['slideId', 'nodeId'],
  },
};
const addTextTool: Tool = {
  name: 'addText',
  description:
    'Add a new text component to a slide. Optionally accepts initial Konva text attributes and z index.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
        description: 'The slide where the text component should be created.',
      },
      initialConfig: {
        type: 'object',
        description:
          'Optional initial configuration for the new text component. Use this to set content, font, position, dimensions, styling, rotation, opacity, or layer order at creation time.',
        properties: {
          attrs: {
            type: 'object',
            description:
              'Initial Konva Text attributes. Examples include text, x, y, width, height, fontSize, fontFamily, fill, align, rotation, opacity, scaleX, and scaleY.',
          },
          zIndex: {
            type: 'number',
            description:
              'Initial Konva z index of the text component. Defaults to 0 when omitted.',
          },
        },
      },
    },
    required: ['slideId'],
  },
};
const updateTextTool: Tool = {
  name: 'updateText',
  description:
    'Update a text component. Supports changing content, fonts, styling, alignment, position, dimensions, rotation, opacity, and layer ordering.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
      },
      nodeId: {
        type: 'string',
      },
      newConfig: {
        type: 'object',
        properties: {
          attrs: {
            type: 'object',
            description:
              'Partial configuration containing only the Konva Text attributes that should be updated. Examples include x, y, width, height, fill, stroke, rotation, opacity, scaleX, scaleY, etc.',
          },
          zIndex: {
            type: 'number',
            description: 'Konva z index of the component',
          },
        },
        required: ['attrs', 'zIndex'],
      },
      zIndexActions: {
        type: 'string',
        description: 'Optional layer ordering action.',
      },
    },
    required: ['slideId', 'nodeId', 'newConfig'],
  },
};
const deleteTextTool: Tool = {
  name: 'deleteText',
  description: 'Remove a text component from a slide.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
      },
      nodeId: {
        type: 'string',
      },
    },
    required: ['slideId', 'nodeId'],
  },
};
const addImageTool: Tool = {
  name: 'addImage',
  description: 'Add a new image component to a slide.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
      },
    },
    required: ['slideId'],
  },
};
const updateImageTool: Tool = {
  name: 'updateImage',
  description:
    'Update an image component. Supports changing image source, position, dimensions, scaling, cropping, rotation, opacity, and layer ordering.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
      },
      nodeId: {
        type: 'string',
      },
      newConfig: {
        type: 'object',
        properties: {
          attrs: {
            type: 'object',
            description:
              'Partial configuration containing only the Konva Image attributes that should be updated. Examples include x, y, width, height, fill, stroke, rotation, opacity, scaleX, scaleY, etc.',
          },
          zIndex: {
            type: 'number',
            description: 'Konva z index of the component',
          },
        },
        required: ['attrs', 'zIndex'],
      },
      zIndexActions: {
        type: 'string',
        description: 'Optional layer ordering action.',
      },
    },
    required: ['slideId', 'nodeId', 'newConfig'],
  },
};
const deleteImageTool: Tool = {
  name: 'deleteImage',
  description: 'Remove an image component from a slide.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
      },
      nodeId: {
        type: 'string',
      },
    },
    required: ['slideId', 'nodeId'],
  },
};
const addSlideTool: Tool = {
  name: 'addSlide',
  description: 'Create a new empty slide and append it to the presentation.',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
};
const removeSlideTool: Tool = {
  name: 'removeSlide',
  description: 'Delete a slide from the presentation.',
  inputSchema: {
    type: 'object',
    properties: {
      slideId: {
        type: 'string',
        description: 'The identifier of the slide to remove.',
      },
    },
    required: ['slideId'],
  },
};
