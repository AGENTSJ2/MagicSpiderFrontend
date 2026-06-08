import { Injectable } from "@angular/core";
import { MCP } from "../features/slide-presentation/MCP/mcp_server";
import { Presentation } from "../features/slide-presentation/domain/canvasModels/presenatation.model";

@Injectable({
    providedIn:'root'
})
export class McpService
{
    presentationToClientMap:Map<string,MCP> = new Map();

    getPresentationMcp(presentation:Presentation)
    {
        let mcp = this.presentationToClientMap.get(presentation.id);
        if(!mcp)
        {
            mcp = new MCP(presentation);
            this.presentationToClientMap.set(presentation.id,mcp);
        }
        return mcp;
    }
}