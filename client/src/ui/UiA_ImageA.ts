import type {Entity} from "@/Entity";
import {div} from "@/utils";

export class UiA_ImageA {

    htmlElement : HTMLElement = div();
    imgElement : HTMLImageElement = document.createElement("img");
    fitWidthOnClick : boolean = true;

    constructor(public entity : Entity) {
    }

    install() {
        this.htmlElement.appendChild(this.imgElement);
        this.htmlElement.style.maxWidth = "50rem";
        this.htmlElement.style.padding = "0.3rem";
        let defaultHeight = "17rem";
        this.imgElement.style.height = defaultHeight;
        this.imgElement.style.cursor = "pointer";
        let imgPathObj = this.entity.uiA.object.listA.getResolved(0);
        this.imgElement.src = '/resources/' + imgPathObj.text;
        this.imgElement.onclick = () => {
            if (this.fitWidthOnClick) {
                this.imgElement.style.height = "auto";
                this.imgElement.style.maxWidth = "100%";
                this.fitWidthOnClick = false;
            } else {
                this.imgElement.style.height = defaultHeight;
                this.imgElement.style.maxWidth = "100rem";
                this.fitWidthOnClick = true;
            }
        }
        this.imgElement.oncontextmenu = (ev) => {
            ev.preventDefault();
            this.entity.uiA.withObjectA_update(true);
        }
    }
}