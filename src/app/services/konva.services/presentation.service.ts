import { Injectable } from '@angular/core';
import { Presentation } from '../../features/slide-presentation/domain/canvasModels/presenatation.model';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import { ICanvasComponent } from '../../features/slide-presentation/domain/canvasModels/ICanvasComponent';
import { TextComponent } from '../../features/slide-presentation/domain/canvasModels/textComponent.model';
import { ShapeType } from '../../features/slide-presentation/domain/canvasModels/shapeComponent.model';

@Injectable({
  providedIn: 'root',
})
export class PresentationService {
  private readonly presentationCollectionKey = 'presentations';
  private getPresentationKey(id: string) {
    return `PPT-${id}`;
  }

  getPresentations(): Presentation[] {
    const pptJsonArray = JSON.parse(
      localStorage.getItem(this.presentationCollectionKey) ?? '[]',
    ) as any[];
    return pptJsonArray;
  }
  getPresentation(id: string) {
    const key = this.getPresentationKey(id);
    const pptJson = JSON.parse(localStorage.getItem(key)!);
    const ppt = new Presentation();
    const slides = pptJson.slides as Slide[];
    for (let slideObj of slides) {
      const slide = ppt.addSlide();
      const components = slide.components;
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
          slide.addText({ config: { attrs: compObj.node.attrs, zIndex: 0 } });
        }
      }
    }
    return ppt;
  }
  addPresentation(ppt: Presentation) {
    const key = this.getPresentationKey(ppt.id);
    const pttJsonString = this.pptToJsonString(ppt);
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

  removePresentation(ppt: Presentation) {
    const key = this.getPresentationKey(ppt.id);
    localStorage.removeItem(key);
    let pptIds = JSON.parse(
      localStorage.getItem(this.presentationCollectionKey) ?? '[]',
    );
    pptIds = pptIds.filter((id: string) => id != ppt.id);
    localStorage.setItem(
      this.presentationCollectionKey,
      JSON.stringify(pptIds),
    );
  }

  savePresentation(ppt: Presentation) {
    this.removePresentation(ppt);
    this.addPresentation(ppt);
  }

  pptToJsonString(ppt: Presentation) {
    const pptJson = {
      id: ppt.id,
      slides: ppt.slides.map((sl) => sl.toJson()),
      config: ppt.config,
    };
    return JSON.stringify(pptJson);
  }
}
