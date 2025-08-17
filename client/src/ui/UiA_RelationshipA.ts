import type {Entity} from "@/Entity";
import type {UiA} from "@/ui/UiA";
import {div, textElem} from "@/utils";

export class UiA_RelationshipA {
    headerContentG_htmlElementG = div();
    bodyContentUi : UiA;
    withoutObjectA_text : string;
    constructor(public entity : Entity) {
    }

    bodyContentG_update() {
        this.bodyContentUi = this.entity.uiA.createSubUiFor_transmitEditability(
            this.entity.uiA.object.relationshipA.to.resolve());
    }

    headerContentG_update() {
        this.headerContentG_htmlElementG.style.display = 'flex';
        this.headerContentG_htmlElementG.appendChild(textElem('['));
        if (this.entity.uiA.object) {
            this.headerContentG_htmlElementG.appendChild(this.entity.uiA.textG.htmlElement);
        } else {
            this.headerContentG_htmlElementG.appendChild(textElem(this.withoutObjectA_text));
        }
        let bracketRight = textElem(']');
        this.headerContentG_htmlElementG.appendChild(bracketRight);
    }

}