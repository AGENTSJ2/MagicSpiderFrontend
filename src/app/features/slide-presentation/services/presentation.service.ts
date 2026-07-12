import { Injectable } from '@angular/core';
import { Presentation } from '../domain/canvasModels/presenatation.model';
import { Slide } from '../domain/canvasModels/slide.model';
import ShapeComponent, {
  ShapeType,
} from '../domain/canvasModels/shapeComponent.model';
import pptxgen from 'pptxgenjs';
import { Image } from 'konva/lib/shapes/Image';
import { TextComponent } from '../domain/canvasModels/textComponent.model';
import { ImageComponent } from '../domain/canvasModels/imageComponent';
import blobService from '../../../services/blob.service';
import {
  PresentationData,
  StoredPresentation,
} from '../../../data/presentation.data';

@Injectable({
  providedIn: 'root',
})
export class PresentationService {
  constructor(private readonly data: PresentationData) {}

  async getPresentations(): Promise<PresentationMetaData[]> {
    return this.data.list();
  }

  async getPresentation(id: string): Promise<Presentation> {
    const record = await this.data.get(id);
    if (!record) {
      const pptCounts = (await this.data.list()).length;
      const newPPT = new Presentation({
        name: `Untitled Presentation ${pptCounts}`,
      });
      newPPT.addSlide();
      return newPPT;
    }
    const ppt = new Presentation({ id: record.id, name: record.name });
    const slides = record.slides as Slide[];
    for (let slideObj of slides) {
      const slide = ppt.addSlide();
      const components = slideObj.components;
      for (let compObj of components) {
        const type = compObj.node.className;
        if (type == 'Text') {
          slide.addText({ config: { attrs: compObj.node.attrs, zIndex: 0 } });
        }
        if (type == 'Rect') {
          slide.addShape({
            config: { attrs: compObj.node.attrs, zIndex: 0 },
            shapeType: ShapeType.RECT,
          });
        }
        if (type == 'Circle') {
          slide.addShape({
            config: { attrs: compObj.node.attrs, zIndex: 0 },
            shapeType: ShapeType.CIRCLE,
          });
        }
        if (type == 'Image') {
          slide.addImage({ config: { attrs: compObj.node.attrs, zIndex: 0 } });
        }
      }
    }
    return ppt;
  }

  async addPresentation(ppt: Presentation, thumbnail: string) {
    await this.data.save(this.pptToRecord(ppt, thumbnail));
  }

  async removePresentation(pptId: string, removeImages: boolean) {
    // removing images of a presentation from blob storage
    if (removeImages) {
      const ppt = await this.getPresentation(pptId);
      this.removePresentationImages(ppt);
    }
    await this.data.remove(pptId);
  }

  removePresentationImages(ppt: Presentation) {
    const components = ppt.slides.map((sl) => sl.components).flat();
    components.forEach((comp) => {
      if (comp.node.className == 'Image') {
        blobService.removeImage(comp.node.attrs.imageId);
      }
    });
  }

  async savePresentation(ppt: Presentation, thumbnail: string) {
    // save() is an upsert keyed by id, so it both adds and updates.
    await this.data.save(this.pptToRecord(ppt, thumbnail));
  }

  pptToRecord(ppt: Presentation, thumbnail: string): StoredPresentation {
    return {
      name: ppt.name,
      id: ppt.id,
      slides: ppt.slides.map((sl) => sl.toJson()),
      config: ppt.config,
      thumbnail: thumbnail,
    };
  }
  //EXPORT FUNCTIONS BELLOW
  private readonly ExportScaleFactor = (1 / 100) * 0.7501;
  private readonly ExportFontScaleFactor = 0.75 * 0.7501;
  async exportPPTtoPPTX(presentation: Presentation) {
    const pptx = new pptxgen();
    for (const slideData of presentation.slides) {
      const slide = pptx.addSlide();
      for (const component of slideData.components) {
        switch (component.node.className) {
          case 'Text':
            const pptxTextForm = this.KonvaTextToPptxText(
              component as TextComponent,
            );
            slide.addText(pptxTextForm.text, pptxTextForm.options);
            break;

          case 'Rect':
            const pptxForm = this.KonvaRectToPptxRect(
              component as ShapeComponent,
            );
            slide.addShape(pptxForm.shapeType, pptxForm.options);
            break;

          case 'Circle':
            const pptxCircleForm = this.KonvaCircleToPptxCircle(
              component as ShapeComponent,
            );
            slide.addShape(pptxCircleForm.shapeType, pptxCircleForm.options);
            break;
          case 'Image':
            const pptxImageForm = this.KonvaImageToPptxImage(
              component as ImageComponent,
            );
            slide.addImage(pptxImageForm.options);
            break;
        }
      }
    }

    await pptx.writeFile({
      fileName: `${presentation.name.replace(' ', '_')}.pptx`,
    });
  }

  private KonvaRectToPptxRect(component: ShapeComponent): {
    shapeType: pptxgen.ShapeType;
    options: pptxgen.ShapeProps;
  } {
    const shapeType = 'rect' as pptxgen.ShapeType;
    const options = {
      x: component.node.x() * this.ExportScaleFactor,
      y: component.node.y() * this.ExportScaleFactor,
      w: component.node.width() * this.ExportScaleFactor,
      h: component.node.height() * this.ExportScaleFactor,
      fill: {
        color: (component.node.fill() as string)?.replace('#', '') ?? 'FFFFFF',
        transparency: 100 - (component.node.opacity() ?? 1) * 100,
      },

      line: {
        color:
          (component.node.stroke() as string)?.replace('#', '') ?? '000000',
        width: (component.node.strokeWidth() ?? 1) * this.ExportFontScaleFactor,
        transparency: 100 - (component.node.opacity() ?? 1) * 100,
      },
    };
    return { shapeType, options };
  }
  private KonvaCircleToPptxCircle(component: ShapeComponent): {
    shapeType: pptxgen.ShapeType;
    options: pptxgen.ShapeProps;
  } {
    const radius = (component.node as any).radius();
    const shapeType = 'ellipse' as pptxgen.ShapeType;
    const options = {
      x: (component.node.x() - radius) * this.ExportScaleFactor,
      y: (component.node.y() - radius) * this.ExportScaleFactor,
      w: radius * 2 * this.ExportScaleFactor,
      h: radius * 2 * this.ExportScaleFactor,
      fill: {
        color: (component.node.fill() as any)?.replace('#', '') ?? 'FFFFFF',
      },
      line: {
        color: (component.node.stroke() as any)?.replace('#', '') ?? '000000',
        width: (component.node.strokeWidth() ?? 1) * this.ExportFontScaleFactor,
      },
    };
    return { shapeType, options };
  }
  private KonvaTextToPptxText(component: TextComponent): {
    text: string;
    options: pptxgen.TextPropsOptions;
  } {
    const fontStyle = component.node.attrs.fontStyle || 'normal';
    const text = component.node.attrs.text;
    const options = {
      x: component.node.x() * this.ExportScaleFactor,
      y: component.node.y() * this.ExportScaleFactor,
      w: component.node.width() * this.ExportScaleFactor,
      h: component.node.height() * this.ExportScaleFactor,
      fontSize: component.node.attrs.fontSize * this.ExportFontScaleFactor,
      fontFace: component.node.attrs.fontFamily,
      color: (component.node.fill() as string).replace('#', ''),
      margin: 0,
      // Alignment
      align: component.node.attrs.align, // left, center, right, justify
      // Vertical alignment
      valign: component.node.attrs.verticalAlign,
      // Font styling
      bold: fontStyle.includes('bold'),
      italic: fontStyle.includes('italic'),
      // Underline
      underline: component.node.attrs.textDecoration?.includes('underline'),
    };
    return { text, options };
  }
  private KonvaImageToPptxImage(component: ImageComponent): {
    options: pptxgen.ImageProps;
  } {
    const imageNode = component.node as Image;
    const image = imageNode.image() as HTMLImageElement;
    const options = {
      path: image.src,
      x: imageNode.x() * this.ExportScaleFactor,
      y: imageNode.y() * this.ExportScaleFactor,
      w: imageNode.width() * this.ExportScaleFactor,
      h: imageNode.height() * this.ExportScaleFactor,
    };
    return {
      options,
    };
  }

   async saveScratchBook(pptId: string, content: string) {
    await this.data.saveScratchBook(pptId, content);
  }

  async getScratchBook(pptId: string): Promise<string> {
    return this.data.getScratchBook(pptId);
  }
}
export interface PresentationMetaData {
  name?: string;
  id: string;
  slideCount: number;
  thumbnail: string;
}
