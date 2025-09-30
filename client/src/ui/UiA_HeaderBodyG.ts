import type {Entity} from "@/Entity";
import {notNullUndefined} from "@/utils";
import { UiA_TestRunA } from "./UiA_TestRunA";
import { HeaderG } from "./HeaderG";

export class UiA_HeaderBodyG {

    headerG : HeaderG;

    constructor(private entity : Entity) {
        this.headerG = new HeaderG(this.entity);
    }

    install() {
        let object = this.getUiA().object;
        if (object.testRunA) {
            UiA_TestRunA.install(this.getUiA());
            this.headerG.install();
            this.getUiA().htmlElementG.appendChild(this.headerG.htmlElement);
            this.getUiA().bodyG.install();
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
            this.getUiA().bodyG.install();
        }
    }

    installWithoutObject() {
        if (this.getUiA().relationshipA) {
            this.headerG.install();
            this.getUiA().htmlElementG.appendChild(this.headerG.htmlElement);
            this.getUiA().bodyG.install();
            this.getUiA().htmlElementG.appendChild(this.getUiA().bodyG.htmlElement);
        }
    }

    update_addedListItem(position: number) {
        if (this.bodyIsVisible()) {
            if (this.getUiA().listA) {
                this.getUiA().listA.update_addedListItem(position);
            } else {
                this.getUiA().bodyG.content_update();
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
            this.getUiA().bodyG.ensureCollapsed();
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
        if (notNullUndefined(this.getUiA().bodyG.htmlElement)) {
            return this.getUiA().bodyG.htmlElement.style.display !== 'none';
        } else {
            return false;
        }
    }

    hasAListItem() : boolean{
        return this.getObject().listA && this.getObject().listA.jsList.length > 0;
    }

    getRawTextOfBody(level: number) {
        let text : string = '';
        let listOfChildren = this.getUiA().getListOfChildren();
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
}