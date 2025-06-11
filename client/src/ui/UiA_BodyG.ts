import type {Entity} from "@/Entity";
import type {UiA} from "@/ui/UiA";
import {AnimatedExpandAndCollapse} from "@/ui/AnimatedExpandAndCollapse";
import {div, notNullUndefined} from "@/utils";
import type {UiA_RelationshipA} from "@/ui/UiA_RelationshipA";

// TODO the body aspect should only exist if showBody === true
export class UiA_BodyG {

    htmlElement : HTMLElement = div();
    content_htmlElement : HTMLElement = div();
    content_contextAsSubitem_htmlElement : HTMLElement = div();
    content_meta_htmlElement : HTMLElement = div();
    animatedExpandAndCollapse : AnimatedExpandAndCollapse = new AnimatedExpandAndCollapse();
    contextAsSubitemUi: UiA;

    constructor(private entity: Entity) {
        this.htmlElement.style.display = 'none';
        this.content_htmlElement.style.paddingLeft = '0.8rem';
        this.content_htmlElement.style.paddingTop = '0.2rem';
        this.content_htmlElement.style.paddingBottom = '0.2rem';
        this.htmlElement.appendChild(this.animatedExpandAndCollapse.outerDiv);
        this.animatedExpandAndCollapse.innerDiv.appendChild(this.content_htmlElement);
    }

    async expandWithAnimation() {
        this.htmlElement.style.display = 'block';
        await this.content_update();
        await this.animatedExpandAndCollapse.expand();
    }

    async collapseWithAnimation() {
        await this.animatedExpandAndCollapse.collapse().then(() => {
            this.content_htmlElement.innerHTML = null;
            this.htmlElement.style.display = 'none';
        });
    }

    async install() {
        if (!this.getUiA().isCollapsible() && await this.getUiA().headerBodyG.hasBodyContent()) {
            await this.displayBody();
        }
    }

    async ensureCollapsed() {
        this.content_htmlElement.innerHTML = null;
        this.htmlElement.style.display = 'none';
    }

    async displayBody() {
        this.htmlElement.style.display = 'block';
        await this.content_update();
        this.animatedExpandAndCollapse.expandWithoutAnimation();
    }

    async content_update() {
        this.content_htmlElement.innerHTML = null;
        if (this.getUiA().object) {
            if (this.getObject().relationshipA) {
                await this.getUiA().relationshipA.bodyContentG_update();
                this.content_htmlElement.appendChild(this.getUiA().relationshipA.bodyContentUi.htmlElement);
            } else if (this.getObject().testRunA) {
                this.content_htmlElement.appendChild(this.getUiA().testRunG.bodyContentUi.htmlElement);
            } else if (this.getObject().parameterizedActionA) {
                await this.getUiA().parameterizedActionA.bodyContentG_update();
                this.content_htmlElement.appendChild(this.getUiA().parameterizedActionA.bodyContentUi.htmlElement);
            } else {
                this.content_htmlElement.appendChild(this.content_contextAsSubitem_htmlElement);
                await this.updateContextAsSubitem();
                this.content_htmlElement.appendChild(this.content_meta_htmlElement);
                if (this.getObject().listA && !this.getObject().testRunA) {
                    this.getUiA().installListA();
                    await this.getUiA().listA.update();
                    this.content_htmlElement.appendChild(this.getUiA().listA.htmlElement);
                }
            }
        } else {
            if (this.getUiA().relationshipA) {
                this.content_htmlElement.appendChild(this.getUiA().relationshipA.bodyContentUi.htmlElement);
            }
        }
    }

    async updateContextAsSubitem() {
        this.content_contextAsSubitem_htmlElement.innerHTML = null;
        if (await this.getUiA().hasContextAsSubitem()) {
            let contextObj = await this.getObject().context.resolve();
            this.contextAsSubitemUi = (await this.entity.getApp().uiA.createUiStringEntityProperty('context',
                this.entity.getApp().direct(contextObj), true, this.getUiA().editable)).entity.uiA;
            this.contextAsSubitemUi.context = this.getUiA();
            this.content_contextAsSubitem_htmlElement.appendChild(this.contextAsSubitemUi.htmlElement);
        }
    }

    getUiA() : UiA {
        return this.entity.uiA;
    }

    getObject() : Entity {
        return this.getUiA().object;
    }

    async showMeta() {
        this.content_meta_htmlElement.innerHTML = null;
        this.content_meta_htmlElement.style.marginLeft = '0.7rem';
        this.content_meta_htmlElement.style.borderLeft = '0.3rem solid ' + this.entity.getApp().uiA.theme.meta;
        let hideButton : HTMLButtonElement = document.createElement('button');
        hideButton.onclick = async () => {
            await this.getUiA().hideMeta();
        }
        hideButton.innerText = '-';
        hideButton.style.marginLeft = '0.4rem';
        hideButton.style.marginBottom = '0.4rem'; // for the shadow of the button
        this.content_meta_htmlElement.appendChild(hideButton);
        let app = this.entity.getApp();
        let meta = app.unboundG.createList();
        let url = await this.getObject().getUrl();
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
        let ui = await this.getUiA().createSubUiFor_transmitEditability(meta);
        this.content_meta_htmlElement.appendChild(ui.htmlElement);
    }

    hideMeta() {
        this.content_meta_htmlElement.innerHTML = null;
    }

    async getListOfChildren() : Promise<Array<UiA>> {
        let list : Array<UiA> = [];
        if (this.getUiA().headerBodyG.bodyIsVisible()) {
            if (this.getUiA().object) {
                if (await this.getUiA().hasContextAsSubitem()) {
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