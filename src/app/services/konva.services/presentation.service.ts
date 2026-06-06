import { Injectable } from '@angular/core';
import { Presentation } from '../../features/slide-presentation/domain/canvasModels/presenatation.model';
import { Slide } from '../../features/slide-presentation/domain/canvasModels/slide.model';
import { ShapeType } from '../../features/slide-presentation/domain/canvasModels/shapeComponent.model';

@Injectable({
  providedIn: 'root',
})
export class PresentationService {
  private readonly presentationCollectionKey = 'presentations';
  constructor() {
    console.log(this.getPresentations());
  }
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
          slide.addText({ config: { attrs: compObj.node.attrs, zIndex: 0 } });
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
    };
  }
  addPresentation(ppt: Presentation) {
    console.log(ppt.name);

    const key = this.getPresentationKey(ppt.id);
    const pttJsonString = this.pptToJsonString(ppt);
    console.log(pttJsonString);

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

  removePresentation(pptId: string) {
    const key = this.getPresentationKey(pptId);
    let test = localStorage.getItem(key);
    localStorage.removeItem(key);
    test = localStorage.getItem(key);

    let pptIds = JSON.parse(
      localStorage.getItem(this.presentationCollectionKey) ?? '[]',
    );
    pptIds = pptIds.filter((id: string) => id != pptId);
    localStorage.setItem(
      this.presentationCollectionKey,
      JSON.stringify(pptIds),
    );
  }

  savePresentation(ppt: Presentation) {
    this.removePresentation(ppt.id);
    this.addPresentation(ppt);
  }

  pptToJsonString(ppt: Presentation) {
    const pptJson = {
      name: ppt.name,
      id: ppt.id,
      slides: ppt.slides.map((sl) => sl.toJson()),
      config: ppt.config,
    };
    return JSON.stringify(pptJson);
  }
}
export interface PresentationMetaData {
  name?: string;
  id: string;
  slideCount: number;
}
