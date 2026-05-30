import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import z from 'zod/v3';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

import { Presentation } from '../domain/canvasModels/presenatation.model';


export class MCP {
  constructor(private presentation: Presentation) {}

  listTools() {
    const tool: Tool = {
      name: 'testTool',
      description: 'A test tool',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
        },
        required: ['message'],
      },
    };
  }
}
