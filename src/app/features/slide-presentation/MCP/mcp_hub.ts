import { Injectable } from '@angular/core';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from '@modelcontextprotocol/sdk/client';
import { MagicSpiderServer } from './mcp_server';
import { InternalMcpError } from './mcp.erros';

@Injectable({
  providedIn: 'root',
})
export class McpHub {
  toolToClientMap:Map<string,Client> = new Map()
  clients:Client[] = [];
  constructor(private magicSpiderServer:MagicSpiderServer) {
    this.registerServerAndClients();
  }
  async registerServerAndClients()
  {
    // MagicSpider Server
    const name = "MagicSpiderClient";
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const spiderClient = new Client({name:name,version:'1.0.0'});
    spiderClient.connect(clientTransport);
    this.magicSpiderServer.connect(serverTransport);
    const {tools} = await spiderClient.listTools();    
    tools.forEach(tool => {
      this.toolToClientMap.set(tool.name,spiderClient);
    });
    this.clients.push(spiderClient);


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
