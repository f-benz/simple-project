import type {Entity} from "@/Entity";
import {UiA} from "@/ui/UiA";
import {AnimatedExpandAndCollapse} from "@/ui/AnimatedExpandAndCollapse";
import {div, notNullUndefined} from "@/utils";
import type {UiA_RelationshipA} from "@/ui/UiA_RelationshipA";
import { UiA_AppA } from "./UiA_AppA";

// TODO the body aspect should only exist if showBody === true
export class BodyA {

    content_htmlElement : HTMLElement = div();
    content_contextAsSubitem_htmlElement : HTMLElement = div();
    content_meta_htmlElement : HTMLElement = div();
    animatedExpandAndCollapse : AnimatedExpandAndCollapse = new AnimatedExpandAndCollapse();
    contextAsSubitemUi: UiA;

    constructor(private entity: Entity) {
        this.content_htmlElement.style.paddingLeft = '0.8rem';
        this.content_htmlElement.style.paddingTop = '0.2rem';
        this.content_htmlElement.style.paddingBottom = '0.2rem';
    }

    getHtmlElement() : HTMLElement {
        return this.getUiA().headerBodyA.bodyHtmlElement;
    }

    async expandWithAnimation() {
        this.getHtmlElement().style.display = 'block';
        this.content_update();
        await this.animatedExpandAndCollapse.expand();
    }

    async collapseWithAnimation() {
        await this.animatedExpandAndCollapse.collapse().then(() => {
            this.content_htmlElement.innerHTML = null;
            this.getHtmlElement().style.display = 'none';
        });
    }

    install() {
        this.getHtmlElement().appendChild(this.animatedExpandAndCollapse.outerDiv);
        this.animatedExpandAndCollapse.innerDiv.appendChild(this.content_htmlElement);
        this.getHtmlElement().style.minWidth = '100%';
        this.getHtmlElement().style.marginTop = '-' + UiA_AppA.rowGap + 'rem';
        if (!this.getUiA().isCollapsible() && this.getUiA().headerBodyA.hasBodyContent()) {
            this.displayBody();
        }
    }

    ensureCollapsed() {
        this.content_htmlElement.innerHTML = null;
        this.getHtmlElement().style.display = 'none';
    }

    displayBody() {
        this.getHtmlElement().style.display = 'block';
        this.content_update();
        this.animatedExpandAndCollapse.expandWithoutAnimation();
    }

    content_update() {
        this.content_htmlElement.innerHTML = null;
        if (this.getUiA().object) {
            if (this.getObject().relationshipA) {
                UiA_AppA.setStyleForFlowLayout(this.content_htmlElement);
                this.getUiA().relationshipA.bodyContentG_update();
                this.getUiA().relationshipA.bodyContentUi.appendTo(this.content_htmlElement);
            } else if (this.getObject().testRunA) {
                this.content_htmlElement.appendChild(this.getUiA().testRunA.bodyContentUi.htmlElementG);
            } else if (this.getObject().parameterizedActionA) {
                this.getUiA().parameterizedActionA.bodyContentG_update();
                this.content_htmlElement.appendChild(this.getUiA().parameterizedActionA.bodyContentUi.htmlElementG);
            } else {
                this.content_htmlElement.appendChild(this.content_contextAsSubitem_htmlElement);
                this.updateContextAsSubitem();
                this.content_htmlElement.appendChild(this.content_meta_htmlElement);
                if (this.getObject().listA && !this.getObject().testRunA) {
                    this.getUiA().installListA();
                    this.getUiA().listA.update();
                    this.content_htmlElement.appendChild(this.getUiA().listA.htmlElement);
                }
            }
        } else {
            if (this.getUiA().relationshipA) {
                this.getUiA().relationshipA.bodyContentUi.appendTo(this.content_htmlElement);
            }
        }
    }

    updateContextAsSubitem() {
        this.content_contextAsSubitem_htmlElement.innerHTML = null;
        UiA_AppA.setStyleForFlowLayout(this.content_contextAsSubitem_htmlElement);
        if (this.getUiA().hasContextAsSubitem()) {
            let contextObj = this.getObject().context.resolve();
            this.contextAsSubitemUi = this.entity.getApp().uiA.createUiStringEntityProperty('context',
                this.entity.getApp().direct(contextObj), true, this.getUiA().editable).entity.uiA;
            this.contextAsSubitemUi.context = this.getUiA();
            this.contextAsSubitemUi.appendTo(this.content_contextAsSubitem_htmlElement);
        }
    }

    getUiA() : UiA {
        return this.entity.uiA;
    }

    getObject() : Entity {
        return this.getUiA().object;
    }

    showMeta() {
        this.content_meta_htmlElement.innerHTML = null;
        this.content_meta_htmlElement.style.marginLeft = '0.7rem';
        this.content_meta_htmlElement.style.borderLeft = '0.3rem solid ' + this.entity.getApp().uiA.theme.meta;
        let hideButton : HTMLButtonElement = document.createElement('button');
        hideButton.onclick = () => {
            this.getUiA().hideMeta();
        }
        hideButton.innerText = '-';
        hideButton.style.marginLeft = '0.4rem';
        hideButton.style.marginBottom = '0.4rem'; // for the shadow of the button
        this.content_meta_htmlElement.appendChild(hideButton);
        let app = this.entity.getApp();
        let meta = app.unboundG.createList();
        let url = this.getObject().getUrl();
        if (notNullUndefined(url)) {
            meta.listA.addDirect(app.unboundG.createLink(url));
        }
        let topLevelContainer = this.getObject().getTopLevelContainer();
        if (topLevelContainer) {
            let root : string;
            if (topLevelContainer.entity === this.entity.getApp().entity) {
                root = 'App';
            } else {
                root = 'unbound! ' + topLevelContainer.entity.getShortDescription();
            }
            meta.listA.addDirect(app.unboundG.createText(root + ' > '
                + topLevelContainer.entity.getPath(this.getObject()).asString()));
        }
        meta.listA.addDirect(this.getUiA().findAppUi().createParameterizedAction_findUsages());
        let ui = this.getUiA().createSubUiFor_transmitEditability(meta, this.getUiA());
        this.content_meta_htmlElement.appendChild(ui.htmlElementG);
    }

    hideMeta() {
        this.content_meta_htmlElement.innerHTML = null;
    }

    getListOfChildren() : Array<UiA> {
        let list : Array<UiA> = [];
        if (this.getUiA().headerBodyA.bodyIsVisible()) {
            if (this.getUiA().object) {
                if (this.getUiA().hasContextAsSubitem()) {
                    list.push(this.contextAsSubitemUi);
                }
            }
            if (this.getUiA().relationshipA) {
                list.push(this.getUiA().relationshipA.bodyContentUi);
            }
            if (this.getUiA().parameterizedActionA) {
                list.push(this.getUiA().parameterizedActionA.bodyContentUi);
            }
            if (this.getUiA().listA) {
                list.push(...this.getUiA().listA.elements);
            }
        }
        return list;
    }
}