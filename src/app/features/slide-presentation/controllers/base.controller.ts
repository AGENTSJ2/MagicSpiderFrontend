import { Shape } from "konva/lib/Shape";

export default abstract class BaseController {
    node: Shape;
    constructor(init: { node: Shape }) {
        this.node = init.node;
    }
    /**
     * Call all events inside this.
     * Override this if you need custom behavior.
     */
    // protected registerEvents() {
    //     this.handleNodeClick();
    // };

    // protected  handleNodeClick(){
        
    // };
    // protected abstract handleNodeTransform():void;

} 