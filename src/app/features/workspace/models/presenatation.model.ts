import { DocumentConfiguration } from "./documentConfiguration.model";
import { Slide } from "./slide.model";

export interface Presentation
{
    id:string;
    slides:Slide[];
    config:DocumentConfiguration;
}

