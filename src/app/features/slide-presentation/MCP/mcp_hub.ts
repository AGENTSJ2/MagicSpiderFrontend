import { Injectable } from '@angular/core';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from '@modelcontextprotocol/sdk/client';
import { MagicSpiderServer } from './mcp_server';

@Injectable({
  providedIn: 'root',
})
export class McpHub {
  toolToClientMap:Map<string,Client> = new Map()
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
    console.log(tools);
    
    tools.forEach(tool => {
      this.toolToClientMap.set(tool.name,spiderClient);
    });

  }
  listTools(): Tool[] {
    return [];
  }

  async callTool(params: { toolName: string; args: any }) {}
}
