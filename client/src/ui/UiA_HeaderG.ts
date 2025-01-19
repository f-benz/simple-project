import type {Entity} from "@/Entity";
import {div, notNullUndefined, setWidth} from "@/utils";
import type {UiA} from "@/ui/UiA";

export class UiA_HeaderG {

    htmlElement: HTMLElement = div();
    divForContentAndBodyIcon : HTMLElement = div();
    content: HTMLElement = div();
    bodyIcon : HTMLElement = div();
    contextIcon : HTMLElement = div();

    constructor(private entity: Entity) {
    }

    async install() {
        await this.updateContextIcon();
        await this.updateContent();
        await this.updateBodyIcon();
        if (this.ownRow()) {
            this.getUiA().htmlElement.style.minWidth = '100%';
        }
        this.htmlElement.style.maxWidth = '42rem';
        this.htmlElement.style.display = 'flex';
        this.divForContentAndBodyIcon.style.flexGrow = '2';
        this.divForContentAndBodyIcon.style.display = 'flex';
        this.divForContentAndBodyIcon.style.flexWrap = 'wrap';
        // this.divForContentAndBodyIcon.style.padding = '0.05rem';
        this.htmlElement.appendChild(this.contextIcon);
        if (this.getUiA().showContainerMark()) {
            this.htmlElement.appendChild(this.createContainerMark());
        }
        this.htmlElement.appendChild(this.divForContentAndBodyIcon);
        this.divForContentAndBodyIcon.appendChild(this.content);
        this.divForContentAndBodyIcon.appendChild(this.bodyIcon);
        this.htmlElement.onclick = async (event) => {
            this.getUiA().findAppUi().ensureActive();
            if (!event.ctrlKey) {
                await this.clickEvent();
            }
        };
        this.htmlElement.oncontextmenu = async (event) => {
            if (!this.getObject().link) {
                await this.getUiA().showMeta();
                event.preventDefault();
            }
        }
        this.divForContentAndBodyIcon.style.border = 'solid';
        this.divForContentAndBodyIcon.style.borderWidth = '0.1rem';
        this.focusStyle_update();
        await this.updateCursorStyle_onlyHeader();
        this.updateContainerStyle();
    }

    async updateContextIcon() {
        this.contextIcon.style.display = 'block';
        setWidth(this.contextIcon, '0.4rem');
        if (this.getUiA().objectHasContext()) {
            if (await this.getUiA().inContext()) {
                this.contextIcon.innerText = '-';
            } else {
                this.contextIcon.innerText = '/';
            }
        } else {
            this.contextIcon.innerText = '';
        }
    }

    createContainerMark() {
        let containerMark = div();
        containerMark.style.display = 'block';
        setWidth(containerMark, '0.8rem');
        containerMark.innerText = 'O'
        containerMark.style.color = this.entity.getApp_typed().uiA.theme.secondMarkColor;
        return containerMark;
    }

    async updateContent() {
        this.content.innerHTML = null;
        if (this.getObject().action) {
            this.content.appendChild(this.action_getUiElement());
        } else if (notNullUndefined(this.getObject().link)) {
            let link = document.createElement('a');
            link.href = this.getObject().link;
            link.innerText = this.link_getText();
            this.content.appendChild(link);
        } else if (notNullUndefined(this.getObject().text)) {
            await this.entity.uiA.textG.update();
            this.content.appendChild(this.getUiA().textG.htmlElement);
        } else if (notNullUndefined(this.getObject().testRunA)) {
            this.content.appendChild(this.getUiA().testRunG.headerContent_htmlElement);
        }
    }

    async updateBodyIcon() {
        this.bodyIcon.style.display = 'inline-block';
        if (this.getObject().collapsible && await this.getUiA().headerBodyG.hasBodyContent()) {
            this.bodyIcon.style.display = 'default';
            this.bodyIcon.style.width = '1.5rem';
            this.bodyIcon.style.textAlign = 'center';
            this.bodyIcon.style.marginLeft = '0.7rem';
            if (this.entity.uiA.isCollapsed()) {
                this.bodyIcon.innerText = '[...]';
            } else {
                this.bodyIcon.innerText = '_';
            }
        } else {
            this.bodyIcon.style.display = 'none';
        }
    }

    ownRow() : boolean {
        return !this.getObject().action;
    }
    
    action_getUiElement() {
        let button = document.createElement('button');
        button.innerText = this.getObject().text;
        button.onclick = (event) => {
            this.getUiA().findAppUi().ensureActive();
            this.getObject().action();
            event.stopPropagation();
        };
        button.style.margin = '0.3rem 0.3rem 0.3rem 0rem';
        button.style.fontSize = '0.9rem';
        this.htmlElement.style.display = 'inline';
        return button;
    }

    link_getText() {
        return notNullUndefined(this.getObject().text) ? this.getObject().text : this.getObject().link;
    }

    async updateCursorStyle() {
        await this.updateCursorStyle_onlyHeader();
        await this.getUiA().textG.updateCursorStyle();
    }

    private async updateCursorStyle_onlyHeader() {
        if (this.getObject().collapsible && await this.getUiA().headerBodyG.hasBodyContent()) {
            this.divForContentAndBodyIcon.style.cursor = 'pointer';
        } else {
            this.divForContentAndBodyIcon.style.cursor = 'default';
        }
    }

    focusStyle_update() {
        if (this.entity.uiA.hasFocus() && this.getUiA().findAppUi().isActive()) {
            this.divForContentAndBodyIcon.style.borderColor = this.entity.getApp_typed().uiA.theme.focusBorderColor;
        } else {
            this.divForContentAndBodyIcon.style.borderColor = this.entity.getApp_typed().uiA.theme.backgroundColor;
        }
    }

    updateContainerStyle() {
        if (this.getObject().containerA) {
            this.divForContentAndBodyIcon.style.backgroundColor = this.entity.getApp_typed().uiA.theme.containerColor;
        } else {
            this.divForContentAndBodyIcon.style.backgroundColor = this.entity.getApp_typed().uiA.theme.backgroundColor;
        }
    }

    async clickEvent() {
        await this.entity.uiA.expandOrCollapse();
        this.getUiA().findAppUi().focus(this.entity.uiA);
    }

    getUiA() : UiA {
        return this.entity.uiA;
    }

    getObject() : Entity {
        if (this.getUiA().object) {
            return this.getUiA().object;
        } else {
            return this.entity;
        }
    }
}