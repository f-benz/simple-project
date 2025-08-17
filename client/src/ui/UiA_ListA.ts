import type {Entity} from "@/Entity";
import {div, notNullUndefined, nullUndefined} from "@/utils";
import {UiA} from "@/ui/UiA";

export class UiA_ListA {

    elements : Array<UiA>;
    htmlElement : HTMLDivElement = div();

    constructor(private entity : Entity) {
        this.htmlElement.style.display = 'flex';
        this.htmlElement.style.flexWrap = 'wrap';
        this.htmlElement.style.rowGap = '0.25rem';
    }

    update() {
        if (this.entity.uiA.object) {
            this.updateElementsFromObject();
        }
        this.updateFromElements();
    }

    private updateElementsFromObject() {
        this.elements = [];
        for (let currentResolved of this.getObject().listA.getResolvedList()) {
            let currentUi = this.createSubUiFor(currentResolved);
            this.elements.push(currentUi);
        }
    }

    updateFromElements() {
        this.htmlElement.innerHTML = null;
        for (let ui of this.elements) {
            this.htmlElement.appendChild(ui.htmlElement);
        }
    }

    createSubUiFor(listItem : Entity) : UiA {
        return this.entity.uiA.createSubUiFor_transmitEditability(listItem);
    }

    defaultActionOnSubitem(subitem: UiA) {
        let created = subitem.object.findContainer().createText('');
        let position : number = this.elements.indexOf(subitem) + 1;
        let listA = this.getObject().listA;
        listA.insertPathOrDirectAtPosition(created, position);
        if (notNullUndefined(this.getObject().text)) {
            created.context = created.getPath(this.getObject());
        }
        listA.entity.uis_update_addedListItem(position);
        this.entity.uiA.findAppUi().focus(this.elements[position]);
        this.entity.uiA.findAppUi().focused.enterEditMode();
    }

    pasteNextOnSubitem(subitem: UiA) {
        let position : number = this.elements.indexOf(subitem) + 1;
        this.entity.getApp().uiA.insertClipboardAtPosition(this.getObject(), position);
        this.entity.uiA.findAppUi().focus(this.elements[position]);
    }

    getObject() : Entity {
        return this.entity.uiA.object;
    }

    update_addedListItem(position: number) {
        let ui = this.createSubUiFor(this.getObject().listA.getResolved(position));
        this.elements.splice(position, 0, ui);
        if (position + 1 === this.elements.length) {
            this.htmlElement.appendChild(ui.htmlElement);
        } else {
            this.htmlElement.insertBefore(ui.htmlElement, this.elements[position + 1].htmlElement);
        }
    }

    update_removedListItem(position: number) {
        let removedUi : UiA = this.elements.splice(position, 1)[0];
        this.htmlElement.removeChild(removedUi.htmlElement);
    }
}