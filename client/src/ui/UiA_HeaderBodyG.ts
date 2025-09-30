import type {Entity} from "@/Entity";
import {div, notNullUndefined} from "@/utils";
import { UiA_TestRunA } from "./UiA_TestRunA";
import { HeaderG } from "./HeaderG";
import { BodyA } from "./BodyA";
import type { UiA } from "./UiA";

export class UiA_HeaderBodyG {

    headerG : HeaderG;
    bodyHtmlElement: HTMLElement = div();
    bodyA: BodyA;
    createBodyA() {
        this.bodyA = new BodyA(this.entity);
    }

    constructor(private entity : Entity) {
        this.headerG = new HeaderG(this.entity);
        this.bodyHtmlElement.style.display = 'none';
    }

    install() {
        let object = this.getUiA().object;
        if (object.testRunA) {
            UiA_TestRunA.install(this.getUiA());
            this.headerG.install();
            this.getUiA().htmlElementG.appendChild(this.headerG.htmlElement);
            this.createBodyA();
            this.bodyA.install();
            if (!object.testRunA.resultG_success) {
                this.getUiA().ensureExpanded();
            }
        } else {
            if (object.relationshipA) {
                this.getUiA().installRelationshipA();
            }
            if (object.parameterizedActionA) {
                this.getUiA().installParameterizedActionA();
            }
            this.headerG.install();
            this.getUiA().htmlElementG.appendChild(this.headerG.htmlElement);
            this.createBodyA();
            this.bodyA.install();
        }
    }

    installWithoutObject() {
        if (this.getUiA().relationshipA) {
            this.headerG.install();
            this.getUiA().htmlElementG.appendChild(this.headerG.htmlElement);
            this.createBodyA();
            this.bodyA.install();
            this.getUiA().htmlElementG.appendChild(this.bodyHtmlElement);
        }
    }

    update_addedListItem(position: number) {
        if (this.bodyIsVisible()) {
            if (this.getUiA().listA) {
                this.getUiA().listA.update_addedListItem(position);
            } else {
                this.bodyA.content_update();
            }
        }
        this.headerG.updateBodyIcon();
        this.headerG.updateCursorStyle();
    }

    update_removedListItem(position: number) {
        if (this.hasBodyContent()) {
            if (this.bodyIsVisible()) {
                this.getUiA().listA.update_removedListItem(position);
            }
        } else {
            this.headerG.updateBodyIcon();
            this.headerG.updateCursorStyle();
            this.bodyA.ensureCollapsed();
        }
    }

    showBody() : boolean {
        if (this.hasBodyContent()) {
            if (this.getObject().collapsible) {
                if (this.getUiA().isCollapsed()) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    hasBodyContent() : boolean {
        if (this.getUiA().object) {
            if (this.getObject().relationshipA) {
                return notNullUndefined(this.getObject().relationshipA.to);
            } else if (this.getObject().parameterizedActionA) {
                return true;
            } else if (this.getObject().testRunA) {
                return this.getUiA().testRunA.hasBodyContent();
            } else {
                return this.getUiA().hasContextAsSubitem()  ||
                    this.hasAListItem();
            }
        } else {
            return true;
        }
    }

    getObject() : Entity {
        return this.getUiA().object;
    }

    bodyIsVisible() : boolean {
        if (notNullUndefined(this.bodyHtmlElement)) {
            return this.bodyHtmlElement.style.display !== 'none';
        } else {
            return false;
        }
    }

    hasAListItem() : boolean{
        return this.getObject().listA && this.getObject().listA.jsList.length > 0;
    }

    getRawTextOfBody(level: number) {
        let listOfChildren = this.getListOfChildren();
        let textsOfChildren = [];
        for (let i = 0; i < listOfChildren.length; i++) {
            if (listOfChildren[i].textA) {
                textsOfChildren.push(listOfChildren[i].textA.getRawText(level));
            }
        }
        if (level === 1) {
            return textsOfChildren.join('\n\n');
        } else {
            return textsOfChildren.join('\n');
        }
    }

    getUiA() {
        return this.entity.uiA;
    }

    getListOfChildren() : Array<UiA> {
        if (this.bodyA) {
            return this.bodyA.getListOfChildren();
        } else {
            return [];
        }
    }
}