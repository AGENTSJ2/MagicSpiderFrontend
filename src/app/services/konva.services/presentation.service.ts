import { Injectable } from '@angular/core';
import { Presentation } from '../../features/slide-presentation/domain/canvasModels/presenatation.model';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import ShapeComponent, {
  ShapeType,
} from '../../features/slide-presentation/domain/canvasModels/shapeComponent.model';
import pptxgen from 'pptxgenjs';
import { Image } from 'konva/lib/shapes/Image';
import { TextComponent } from '../../features/slide-presentation/domain/canvasModels/textComponent.model';
import { ImageComponent } from '../../features/slide-presentation/domain/canvasModels/imageComponent';
import blobService from '../blob.service';

@Injectable({
  providedIn: 'root',
})
export class PresentationService {
  private readonly presentationCollectionKey = 'presentations';
  constructor() {}
  private getPresentationKey(id: string) {
    return `PPT-${id}`;
  }

  getPresentations(): PresentationMetaData[] {
    const pptIds = JSON.parse(
      localStorage.getItem(this.presentationCollectionKey) ?? '[]',
    ) as any[];
    const ppts = pptIds.map((id) => this.getPresentationMetaData(id));
    return ppts;
  }

  getPresentation(id: string) {
    const key = this.getPresentationKey(id);
    const savedPPT = localStorage.getItem(key);
    if (!savedPPT) {
      const pptCounts = this.getPresentations().length;
      const newPPT = new Presentation({
        name: `Untitled Presentation ${pptCounts}`,
      });
      newPPT.addSlide();
      return newPPT;
    }
    const pptJson = JSON.parse(savedPPT);
    const ppt = new Presentation({ id: pptJson.id, name: pptJson.name });
    const slides = pptJson.slides as Slide[];
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

  getPresentationMetaData(id: string): PresentationMetaData {
    const key = this.getPresentationKey(id);
    const pptJson = JSON.parse(localStorage.getItem(key)!);
    return {
      name: pptJson.name,
      id: pptJson.id,
      slideCount: pptJson.slides.length,
      thumbnail: pptJson.thumbnail,
    };
  }

  addPresentation(ppt: Presentation, thumbnail: string) {
    const key = this.getPresentationKey(ppt.id);
    const pttJsonString = this.pptToJsonString(ppt, thumbnail);
    localStorage.setItem(key, pttJsonString);
    const pptIds = JSON.parse(
      localStorage.getItem(this.presentationCollectionKey) ?? '[]',
    );
    pptIds.push(ppt.id);
    localStorage.setItem(
      this.presentationCollectionKey,
      JSON.stringify(pptIds),
    );
  }

  removePresentation(pptId: string, removeImages: boolean) {
    const key = this.getPresentationKey(pptId);
    const ppt = this.getPresentation(pptId);

    // removing images of an presentation from local storage
    if (removeImages) {
      this.removePresentationImages(ppt);
    }
    localStorage.removeItem(key);

    let pptIds = JSON.parse(
      localStorage.getItem(this.presentationCollectionKey) ?? '[]',
    );
    pptIds = pptIds.filter((id: string) => id != pptId);
    localStorage.setItem(
      this.presentationCollectionKey,
      JSON.stringify(pptIds),
    );
  }

  removePresentationImages(ppt: Presentation) {
    const components = ppt.slides.map((sl) => sl.components).flat();
    components.forEach((comp) => {
      if (comp.node.className == 'Image') {
        blobService.removeImage(comp.node.attrs.imageId);
      }
    });
  }

  savePresentation(ppt: Presentation, thumbnail: string) {
    this.removePresentation(ppt.id,false);
    this.addPresentation(ppt, thumbnail);
  }

  pptToJsonString(ppt: Presentation, thumbnail: string) {
    const pptJson = {
      name: ppt.name,
      id: ppt.id,
      slides: ppt.slides.map((sl) => sl.toJson()),
      config: ppt.config,
      thumbnail: thumbnail,
    };
    return JSON.stringify(pptJson);
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
    // const radius = (component.node as Rect).cornerRadius();
    // const hasRoundedCorners = Array.isArray(radius)
    //   ? radius.some((r) => r > 0)
    //   : radius > 0;
    // const shapeType =( hasRoundedCorners
    //   ? "roundRect"
    //   : "rect") as pptxgen.ShapeType;
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
}
export interface PresentationMetaData {
  name?: string;
  id: string;
  slideCount: number;
  thumbnail: string;
}
