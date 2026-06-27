import { Injectable } from '@angular/core';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CalculatorActions } from './calculator.actions';
import { BinaryOpSchema } from './calculator.schemas';

/**
 * A small in-browser MCP server exposing basic arithmetic tools
 * (add, subtract, multiply, divide) for the AI agent to use.
 */
@Injectable({
  providedIn: 'root',
})
export class CalculatorServer extends McpServer {
  constructor(private calculatorActions: CalculatorActions) {
    super({ name: 'CalculatorServer', version: '1.0.0' });
    this.registerTools();
  }

  registerTools() {
    this.registerTool(
      'add',
      {
        title: 'add',
        description: 'Add two numbers and return their sum (a + b).',
        inputSchema: BinaryOpSchema,
      },
      async (args) => this.calculatorActions.add(args),
    );
    this.registerTool(
      'subtract',
      {
        title: 'subtract',
        description: 'Subtract the second number from the first (a - b).',
        inputSchema: BinaryOpSchema,
      },
      async (args) => this.calculatorActions.subtract(args),
    );
    this.registerTool(
      'multiply',
      {
        title: 'multiply',
        description: 'Multiply two numbers and return their product (a * b).',
        inputSchema: BinaryOpSchema,
      },
      async (args) => this.calculatorActions.multiply(args),
    );
    this.registerTool(
      'divide',
      {
        title: 'divide',
        description:
          'Divide the first number by the second (a / b). Returns an error when b is zero.',
        inputSchema: BinaryOpSchema,
      },
      async (args) => this.calculatorActions.divide(args),
    );
  }
}
