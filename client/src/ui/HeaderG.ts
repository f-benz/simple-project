import type {Entity} from "@/Entity";
import {div, notNullUndefined, nullUndefined, setWidth, textElem} from "@/utils";
import type {UiA} from "@/ui/UiA";

export class HeaderG {

    htmlElement: HTMLElement = div();
    divForContentAndBodyIcon : HTMLElement = div();
    content: HTMLElement = div();
    bodyIcon : HTMLElement = div();
    contextIcon : HTMLElement = div();

    constructor(private entity: Entity) {
    }

    install() {
        if (this.withObject()) {
            this.updateContextIcon();
        }
        this.updateContent();
        this.updateBodyIcon();
        if (this.ownRow()) {
            this.getUiA().fullWidth();
        }
        this.htmlElement.style.display = 'flex';
        this.htmlElement.classList.add('header');
        this.divForContentAndBodyIcon.style.flexGrow = '2';
        this.divForContentAndBodyIcon.style.display = 'flex';
        this.divForContentAndBodyIcon.style.flexWrap = 'wrap';
        // this.divForContentAndBodyIcon.style.padding = '0.05rem';
        this.htmlElement.appendChild(this.contextIcon);
        if (this.withObject()) {
            if (this.getUiA().showContainerMark()) {
                this.htmlElement.appendChild(this.createContainerMark());
            }
        }
        this.htmlElement.appendChild(this.divForContentAndBodyIcon);
        this.divForContentAndBodyIcon.appendChild(this.content);
        this.divForContentAndBodyIcon.appendChild(this.bodyIcon);
        this.htmlElement.onclick = (event) => {
            this.getUiA().findAppUi().ensureActive();
            if (!event.ctrlKey) {
                this.clickEvent();
            }
        };
        this.htmlElement.oncontextmenu = (event) => {
            if (!this.getObject().link) {
                this.getUiA().showMeta();
                event.preventDefault();
            }
        }
        this.htmlElement.ondblclick = (event) => {
            if (this.getUiA().isEditable()) {
                if (!this.getUiA().editMode) {
                    this.getUiA().enterEditMode();
                }
            }
        }
        if (this.getUiA().relationshipA) {
            this.htmlElement.style.fontSize = '0.8rem';
            this.htmlElement.style.color = this.entity.getApp().uiA.theme.buttonFontColor;
        }
        this.divForContentAndBodyIcon.style.border = 'solid';
        this.divForContentAndBodyIcon.style.borderWidth = '0.1rem';
        this.focusStyle_update();
        this.updateCursorStyle_onlyHeader();
        if (this.withObject()) {
            this.updateContainerStyle();
        }
    }

    withObject() : boolean {
        return notNullUndefined(this.getUiA().object);
    }

    updateContextIcon() {
        this.contextIcon.style.display = 'block';
        setWidth(this.contextIcon, '0.4rem');
        if (this.getUiA().objectHasContext()) {
            if (this.getUiA().inContext()) {
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
        containerMark.style.color = this.entity.getApp().uiA.theme.secondMarkColor;
        return containerMark;
    }

    updateContent() {
        this.content.innerHTML = null;
        if (this.withObject()) {
            if (this.getObject().codeG_jsFunction && nullUndefined(this.getObject().parameterizedActionA)) {
                this.content.appendChild(this.action_getUiElement());
            } else if (notNullUndefined(this.getObject().link)) {
                let link = document.createElement('a');
                link.href = this.getObject().link;
                link.innerText = this.link_getText();
                link.style.fontFamily = this.entity.getApp().uiA.theme.font;
                link.style.fontSize = this.entity.getApp().uiA.theme.fontSize;
                link.style.color = this.entity.getApp().uiA.theme.linkFontColor;
                this.content.appendChild(link);
            } else if (notNullUndefined(this.getObject().text)) {
                if (!this.getUiA().textA) {
                    this.getUiA().installTextA();
                }
                this.entity.uiA.textA.update();
                if (this.getUiA().relationshipA) {
                    this.getUiA().relationshipA.headerContentG_update();
                    this.content.appendChild(this.getUiA().relationshipA.headerContentG_htmlElementG);
                } else {
                    this.content.appendChild(this.getUiA().textA.htmlElement);
                }
            } else if (notNullUndefined(this.getObject().testRunA)) {
                this.content.appendChild(this.getUiA().testRunA.headerContent_htmlElement);
            }
        } else {
            if (this.getUiA().relationshipA) {
                this.getUiA().relationshipA.headerContentG_update();
                this.content.appendChild(this.getUiA().relationshipA.headerContentG_htmlElementG);
            }
        }
    }

    updateBodyIcon() {
        this.bodyIcon.style.display = 'inline-block';
        if (this.getUiA().isCollapsible() && this.getUiA().headerBodyG.hasBodyContent()) {
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
        if (this.withObject()) {
            return !this.getObject().codeG_jsFunction;
        } else {
            return true;
        }
    }
    
    action_getUiElement() {
        let button = document.createElement('button');
        button.innerText = this.getObject().text;
        button.onclick = (event) => {
            this.getUiA().findAppUi().ensureActive();
            this.getObject().codeG_jsFunction.call(null);
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

    updateCursorStyle() {
        this.updateCursorStyle_onlyHeader();
        this.getUiA().textA?.updateCursorStyle();
    }

    private updateCursorStyle_onlyHeader() {
        if (this.getUiA().isCollapsible() && this.getUiA().headerBodyG.hasBodyContent()) {
            this.divForContentAndBodyIcon.style.cursor = 'pointer';
        } else {
            this.divForContentAndBodyIcon.style.cursor = 'default';
        }
    }

    focusStyle_update() {
        if (this.entity.uiA.hasFocus() && this.getUiA().findAppUi().isActive()) {
            if (this.entity.uiA.editMode) {
                this.divForContentAndBodyIcon.style.borderColor = this.entity.getApp().uiA.theme.focusBorderColor_editMode;
            } else {
                this.divForContentAndBodyIcon.style.borderColor = this.entity.getApp().uiA.theme.focusBorderColor_viewMode;
            }
        } else {
            this.divForContentAndBodyIcon.style.borderColor = this.entity.getApp().uiA.theme.backgroundColor;
        }
    }

    updateContainerStyle() {
        if (this.getObject().containerA) {
            this.divForContentAndBodyIcon.style.backgroundColor = this.entity.getApp().uiA.theme.containerColor;
        } else {
            this.divForContentAndBodyIcon.style.backgroundColor = this.entity.getApp().uiA.theme.backgroundColor;
        }
    }

    clickEvent() {
        this.entity.uiA.expandOrCollapse();
        this.getUiA().findAppUi().focus(this.entity.uiA);
    }

    getUiA() : UiA {
        return this.entity.uiA;
    }

    getObject() : Entity {
        return this.getUiA().object;
    }
}