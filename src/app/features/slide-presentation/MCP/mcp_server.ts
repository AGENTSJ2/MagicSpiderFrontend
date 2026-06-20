import { McpActions } from './mcp.actions';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  AddTextSchema,
  AddShapeSchema,
  updateSchema,
  deleteSchema,
  RemoveSlideSchema,
  AddImageSchema,
} from './McpSchemas';
import z from 'zod';
import { Injectable } from '@angular/core';
@Injectable({
  providedIn:'root'
})
export class MagicSpiderServer extends McpServer {
  constructor(private mcpActions :McpActions) {
    super({ name: 'MagicSpiderServer', version: '1.0.0' });
    this.registerTools()
  }

  registerTools() {
    this.registerTool(
      'addShape',
      {
        title: 'addShape',
        description:
          'Add a new shape component to a slide. Creates a shape of the specified type and inserts it onto the target slide. Optionally accepts initial Konva attributes and z index.',
        inputSchema: AddShapeSchema,
      },
      async (args)=>this.mcpActions.addShape(args)
    );
    this.registerTool(
      'updateShape',
      {
        title: 'updateShape',
        description:
          'Update an existing shape on a slide. Use this tool whenever a user wants to move, resize, rotate, recolor, reorder, or otherwise modify a shape. Only provide the Konva attributes that need to be changed; unspecified attributes will remain unchanged.',
        inputSchema: updateSchema,
      },
      async (args)=>this.mcpActions.updateShape(args)
    );
    this.registerTool(
      'deleteComponent',
      {
        title: 'deleteComponent',
        description: 'Remove a shape component from a slide.',
        inputSchema: deleteSchema,
      },
      async (args)=>this.mcpActions.deleteComponent(args)
    );
    this.registerTool(
      'addText',
      {
        title: 'addText',
        description:
          'Add a new text component to a slide. Creates a text node and inserts it onto the target slide. Optionally accepts initial Konva attributes and z index.',
        inputSchema: AddTextSchema,
      },
      async (args)=>this.mcpActions.addText(args)
    );
    this.registerTool(
      'updateText',
      {
        title: 'updateText',
        description:
          'Update an existing text node on a slide. Use this tool whenever a user wants to move, resize, recolor, reorder, change font, or otherwise modify a text component. Only provide the Konva attributes that need to be changed; unspecified attributes will remain unchanged.',
        inputSchema: updateSchema,
      },
      async (args)=>this.mcpActions.updateText(args)
    );
    // this.registerTool(
    //   'addImage',
    //   {
    //     title: 'addImage',
    //     description:
    //       'Add a new image component to a slide. Creates an image node and inserts it onto the target slide.',
    //     inputSchema: AddImageSchema,
    //   },
    //   async (args)=>this.mcpActions.addImage(args)
    // );
    this.registerTool(
      'updateImage',
      {
        title: 'updateImage',
        description:
          'Update an existing image node on a slide. Use this tool whenever a user wants to move, resize, reorder, or otherwise modify an image component. Only provide the Konva attributes that need to be changed; unspecified attributes will remain unchanged.',
        inputSchema: updateSchema,
      },
      async (args)=>this.mcpActions.updateImage(args)
    );
    this.registerTool(
      'addSlide',
      {
        title: 'addSlide',
        description: 'Add a new empty slide to the presentation.',
        inputSchema: z.object({}),
      },
      async ()=>this.mcpActions.addSlide()
    );
    this.registerTool(
      'removeSlide',
      {
        title: 'removeSlide',
        description:
          'Remove a slide from the presentation by its ID. This will also delete all components on that slide.',
        inputSchema: RemoveSlideSchema,
      },
      async (args)=>this.mcpActions.removeSlide(args)
    );
  }
}