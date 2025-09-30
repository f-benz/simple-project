import type {Entity} from "@/Entity";
import {div, notNullUndefined, setCaret, textElem} from "@/utils";
import type {UiA} from "@/ui/UiA";

export class UiA_TextA {

    htmlElement : HTMLElement = div();
    veryLongText : boolean;

    constructor(private entity : Entity) {
    }

    update() {
        if (this.getObject().text.length > 2000000) {
            this.veryLongText = true;
            this.htmlElement.innerText = '*** the text is very long and is not displayed here ***';
        } else {
            this.veryLongText = false;
            this.htmlElement.innerText = this.getObject().text;
        }
        this.htmlElement.style.minHeight = '1rem';
        this.htmlElement.style.fontFamily = this.entity.getApp().uiA.theme.font;
        this.htmlElement.style.whiteSpace = 'pre-wrap';
        this.htmlElement.style.outline = "0px solid transparent"; // prevent JS focus
        this.htmlElement.onblur = (event : any) => {
            this.save();
            this.getObject().uis_update_text();
            this.entity.uiA.leaveEditMode();
        }
        this.htmlElement.onfocus = () => {
            if (this.getUiA().findAppUi().focused != this.entity.uiA) {
                this.getUiA().findAppUi().focus(this.entity.uiA);
            }
            this.updateEmptyMarker();
        };
        this.htmlElement.onclick = (event) => {
            this.getUiA().findAppUi().ensureActive();
            if (this.getUiA().isEditable()) {
                event.stopPropagation();
                if (!this.getUiA().editMode) {
                    this.getUiA().focus();
                }
            } else {
                this.getUiA().focus();
            }
        }
        this.updateEmptyMarker();
        this.htmlElement.style.display = 'inline-block';
        this.htmlElement.style.minWidth = '1rem';
        this.updateCursorStyle();
    }

    save() {
        if (this.veryLongText) {
            throw new Error('very long text');
        } else {
            this.getObject().text = this.getText();
        }
    }

    getText() {
        return this.htmlElement.innerText.trim();
    }

    private updateEmptyMarker() {
        if (this.isRelationship()) {
            this.htmlElement.style.borderLeft = 'none';
        } else {
            this.htmlElement.style.borderLeft = 'solid';
            if (document.activeElement != this.htmlElement && this.getUiA().isEditable() && this.getObject().text.length === 0) {
                this.htmlElement.style.borderLeftColor = this.entity.getApp().uiA.theme.fontColor;
            } else {
                this.htmlElement.style.borderLeft = 'none';
            }
        }
    }

    isRelationship() : boolean {
        if (this.getUiA().object && this.getUiA().object.relationshipA) {
            return true;
        } else {
            return notNullUndefined(this.getUiA().relationshipA);
        }
    }

    updateCursorStyle() {
        if (this.getUiA().isEditable()) {
            if (this.getUiA().editMode) {
                this.htmlElement.style.cursor = 'text';
            } else {
                this.htmlElement.style.cursor = 'default';
            }
        } else {
            if (this.getUiA().isCollapsible() && this.getUiA().headerBodyA.hasBodyContent()) {
                this.htmlElement.style.cursor = 'pointer';
            } else {
                this.htmlElement.style.cursor = 'default';
            }
        }
    }

    takeCaret() {
        setCaret(this.htmlElement, this.getObject().text.length);
    }

    getUiA() : UiA {
        return this.entity.uiA;
    }

    getObject() : Entity {
        return this.getUiA().object;
    }

    getRawText(level : number) : string {
        let text : string = "";
        if (level === 0) {
            text += '[ ' + this.getText() + ' ]';
            text += '\n';
            if (!this.getUiA().isCollapsed()) {
                text += '\n';
                text += this.getUiA().headerBodyA.getRawTextOfBody(1);
                text += '\n';
            }
        } else {
            text += '  '.repeat(level - 1);
            if (level > 1) {
                text += '- ';
            }
            text += this.getText();
            if (!this.getUiA().isCollapsed()) {
                text += '\n';
                text += this.getUiA().headerBodyA.getRawTextOfBody(level + 1);
            }
        }
        return text;
    }
}