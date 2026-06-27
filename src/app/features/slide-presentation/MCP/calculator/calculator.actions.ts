import { Injectable } from '@angular/core';
import { CallToolResult } from '@modelcontextprotocol/sdk/types';
import { InternalMcpError } from '../mcp.erros';
import { BinaryOpArgs } from './calculator.schemas';

/**
 * Business logic for the calculator MCP server. Each handler performs one basic
 * arithmetic operation and returns the result as text content.
 */
@Injectable({
  providedIn: 'root',
})
export class CalculatorActions {
  private result(value: number): CallToolResult {
    return {
      content: [{ type: 'text', text: String(value) }],
    };
  }

  add(args: BinaryOpArgs): CallToolResult {
    return this.result(args.a + args.b);
  }

  subtract(args: BinaryOpArgs): CallToolResult {
    return this.result(args.a - args.b);
  }

  multiply(args: BinaryOpArgs): CallToolResult {
    return this.result(args.a * args.b);
  }

  divide(args: BinaryOpArgs): CallToolResult {
    if (args.b === 0) {
      throw new InternalMcpError('Cannot divide by zero.');
    }
    return this.result(args.a / args.b);
  }
}
