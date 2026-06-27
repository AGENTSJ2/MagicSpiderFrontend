import { Injectable } from '@angular/core';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from '@modelcontextprotocol/sdk/client';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MagicSpiderServer } from './mcp_server';
import { CalculatorServer } from './calculator/calculator_server';
import { InternalMcpError } from './mcp.erros';

@Injectable({
  providedIn: 'root',
})
export class McpHub {
  toolToClientMap:Map<string,Client> = new Map()
  clients:Client[] = [];
  constructor(
    private magicSpiderServer:MagicSpiderServer,
    private calculatorServer:CalculatorServer,
  ) {
    this.registerServerAndClients();
  }
  async registerServerAndClients()
  {
    await this.connectServer("MagicSpiderClient", this.magicSpiderServer);
    await this.connectServer("CalculatorClient", this.calculatorServer);
  }

  /** Create an in-memory client/server pair and map its tools to that client. */
  private async connectServer(clientName: string, server: McpServer)
  {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({name:clientName,version:'1.0.0'});
    client.connect(clientTransport);
    server.connect(serverTransport);
    const {tools} = await client.listTools();
    tools.forEach(tool => {
      this.toolToClientMap.set(tool.name,client);
    });
    this.clients.push(client);
  }
  async listTools(): Promise<Tool[]> {
    const allTools :Tool[]= [ ];
    for(let client of this.clients)
    {
      const {tools} =  await client.listTools(); 
      allTools.push(...tools);
    }
    return allTools;
  }

  async callTool(params: { toolName: string; args: any }) {
    const client = this.toolToClientMap.get(params.toolName);
    if(!client)
    {
      throw new InternalMcpError(`Tool of name ${params.toolName} is not found`);
    }
    const result = await client.callTool({
      name:params.toolName,
      arguments:params.args
    });
    return result;
  }
}
