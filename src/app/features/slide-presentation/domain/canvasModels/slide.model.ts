import Konva from "konva";

export interface Slide {
    slideId: string;
    components: Konva.Node[];
    layer: Konva.Layer;
    transformer: Konva.Transformer;
    stage:Konva.Stage;
    mainCover:Konva.Rect;
}