import type {Entity} from "@/Entity";
import {div, notNullUndefined, nullUndefined} from "@/utils";
import {UiA_ListA} from "@/ui/UiA_ListA";
import {UiA_TextA} from "@/ui/UiA_TextA";
import {UiA_BodyG} from "@/ui/UiA_BodyG";
import {UiA_HeaderG} from "@/ui/UiA_HeaderG";
import {UiA_HeaderBodyG} from "@/ui/UiA_HeaderBodyG";
import {UiA_TestRunA} from "@/ui/UiA_TestRunA";
import {UiA_AppA} from "@/ui/UiA_AppA";
import {UiA_ImageA} from "@/ui/UiA_ImageA";
import type {ContainerA} from "@/ContainerA";
import {UiA_RelationshipA} from "@/ui/UiA_RelationshipA";
import {UiA_ParameterizedActionA} from "@/ui/UiA_ParameterizedActionA";
import {RelationshipA} from "@/RelationshipA";
import type { PathA } from "@/PathA";
import { insertAfter, insertBefore, remove } from "./ui_utils";

export class UiA {
    editable: boolean;
    htmlElementG : HTMLElement = div();
    listA: UiA_ListA;
    withoutObjectG_collapsible: boolean;
    uiReference: UiA;
    installListA() {
        this.listA = new UiA_ListA(this.entity);
    }
    relationshipA: UiA_RelationshipA;
    installRelationshipA() {
        this.relationshipA = new UiA_RelationshipA(this.entity);
    }
    parameterizedActionA : UiA_ParameterizedActionA;
    installParameterizedActionA() {
        this.parameterizedActionA = new UiA_ParameterizedActionA(this.entity);
    }
    textA : UiA_TextA;
    headerG : UiA_HeaderG;
    bodyG: UiA_BodyG;
    object: Entity;
    context: UiA;
    headerBodyG: UiA_HeaderBodyG;
    testRunA: UiA_TestRunA;
    appA : UiA_AppA;
    imageA : UiA_ImageA;
    installImageA() {
        this.imageA = new UiA_ImageA(this.entity);
        this.imageA.install();
    }
    editMode : boolean;
    isColumn : boolean;
    lastFocused : UiA;
    useProfileContainer : boolean;

    constructor(public entity : Entity) {
        this.headerBodyG = new UiA_HeaderBodyG(this.entity);
        this.textA = new UiA_TextA(this.entity);
        this.headerG = new UiA_HeaderG(this.entity);
        this.bodyG = new UiA_BodyG(this.entity);
        this.htmlElementG.classList.add('UI');
    }

    install(source? : boolean) {
        if (nullUndefined(this.object)) {
            if (this.relationshipA) {
                this.headerBodyG.installWithoutObject();
            } else if (this.listA) {
                this.listA.update();
                this.htmlElementG.appendChild(this.listA.htmlElement);
                if (this.isColumn) {
                    this.columnA_setStyle();
                    this.htmlElementG.appendChild(this.createPlaceholderArea());
                }
            }
        } else {
            this.withObjectA_install(source);
        }
    }

    withObjectA_update(source? : boolean) {
        this.withObjectA_reset();
        if (this.isHeaderBody()) {
            insertAfter(this.htmlElementG, this.bodyG.htmlElement);
        }
        this.withObjectA_install(source);
    }

    withObjectA_install(source? : boolean) {
        if (this.wouldProvokeEndlessRecursion()) {
            this.fullWidth();
            let warningText = 'This item cannot be displayed. It contains itself. ' +
                'The rendering would result in an endless recursion. ' +
                'Do you want to make it collapsible to solve the problem?';
            let data = this.entity.getApp().unboundG.createList(
                this.entity.getApp().unboundG.createText(warningText),
                this.entity.getApp().unboundG.createButton('make collapsible', () => {
                    this.object.collapsible = true;
                    this.object.uis_update_collapsible();
                    this.withObjectA_update();
                })
            );
            let ui = this.createSubUiFor(data);
            this.htmlElementG.appendChild(ui.htmlElementG);
        } else {
            if (this.object.text?.startsWith('#img') && !source) {
                this.installImageA();
                this.htmlElementG.appendChild(this.imageA.htmlElement);
            } else if (this.object.codeG_html) {
                this.fullWidth();
                this.htmlElementG.appendChild(this.object.codeG_html);
            } else if (this.object.appA) {
                this.htmlElementG.innerText = "type: application";
            } else if (this.isHeaderBody()) {
                this.headerBodyG.install();
            } else if (this.isPlainList()) {
                this.installListA();
                this.listA.update();
                this.htmlElementG.appendChild(this.listA.htmlElement);
                if (this.isColumn) {
                    this.columnA_setStyle();
                    this.htmlElementG.appendChild(this.createPlaceholderArea());
                } else {
                    this.fullWidth();
                }
                this.updateFocusStyle();
            } else {
                this.fullWidth();
                let divElement = div();
                divElement.innerText = this.object.getDescription();
                this.htmlElementG.appendChild(divElement);
            }
        }
    }

    columnA_setStyle() {
        this.htmlElementG.style.height = '100%';
        this.htmlElementG.style.overflowY = 'scroll';
        this.htmlElementG.style.overflowX = 'hidden';
    }

    createPlaceholderArea() : HTMLElement {
        let placeholderArea = div();
        placeholderArea.style.height = '85%';
        placeholderArea.onclick = () => {
            if (this.isColumn) {
                (this.getLast()).focus();
            } else if (this.appA) {
                (this.appA.presentationModeA_contentUi.getLast()).focus();
            }
        }
        return placeholderArea;
    }

    wouldProvokeEndlessRecursion() : boolean {
        return !this.object.collapsible
            && notNullUndefined(this.context)
            && this.context.nonCollapsibleChainContains(this.object);
    }

    nonCollapsibleChainContains(toCheck : Entity) : boolean {
        if (nullUndefined(this.object)) {
            return false;
        } else {
            if (this.object.collapsible) {
                return false;
            } else {
                if (this.object == toCheck) {
                    return true;
                } else {
                    if (this.context) {
                        return this.context.nonCollapsibleChainContains(toCheck);
                    } else {
                        return false;
                    }
                }
            }
        }
    }

    fullWidth() {
        this.htmlElementG.style.minWidth = '100%';
    }

    withObjectA_reset() {
        this.resetHtmlElement();
        // TODO use aspects not groups!
        if (this.bodyG.htmlElement.parentElement) {
            remove(this.bodyG.htmlElement);
        }
        this.headerBodyG = new UiA_HeaderBodyG(this.entity);
        this.textA = new UiA_TextA(this.entity);
        this.headerG = new UiA_HeaderG(this.entity);
        this.bodyG = new UiA_BodyG(this.entity);
    }

    resetHtmlElement() {
        this.htmlElementG.innerHTML = null;
    }

    isHeaderBody() : boolean {
        if (this.object) {
            return notNullUndefined(this.object.parameterizedActionA) ||
                notNullUndefined(this.object.codeG_jsFunction) ||
                notNullUndefined(this.object.link) ||
                notNullUndefined(this.object.text) ||
                notNullUndefined(this.object.testRunA);
        } else {
            return !this.listA;
        }
    }

    isPlainList() {
        if (this.object) {
            return this.entity.uiA.object.listA && !this.isHeaderBody();
        } else {
            return true; // TODO
        }
    }

    isEditable() {
        if (notNullUndefined(this.editable)) {
            if (notNullUndefined(this.object.editable)) {
                if (this.editable == true) {
                    return this.object.editable;
                } else {
                    return false;
                }
            } else {
                return this.editable;
            }
        } else {
            if (notNullUndefined(this.object.editable)) {
                return this.object.editable;
            } else {
                return false;
            }
        }
    }

    updateFocusStyle() {
        if (this.isHeaderBody()) {
            this.headerG.focusStyle_update();
        } else {
            if (this.hasFocus() && this.findAppUi().isActive()) {
                this.htmlElementG.style.border = 'solid';
                this.htmlElementG.style.borderColor = this.entity.getApp().uiA.theme.focusBorderColor_viewMode;
            } else {
                this.htmlElementG.style.border = 'none';
            }
        }
    }

    takeCaret() {
        if (notNullUndefined(this.object) && notNullUndefined(this.object.text)) {
            this.textA.takeCaret();
        }
    }

    hasFocus() {
        return this.findAppUi()?.focused === this;
    }

    defaultAction() {
        if (this.isColumn) {
            this.newSubitem();
        } else {
            this.context.defaultActionOnSubitem(this);
        }
    }

    defaultActionOnSubitem(subitem: UiA) {
        this.listA.defaultActionOnSubitem(subitem);
    }

    pasteNextOnSubitem(subitem: UiA) {
        this.listA.pasteNextOnSubitem(subitem);
    }

    newSubitem() {
        if (this.object.relationshipA) {
            let created = this.findContainerForNewSubitem().createText('');
            this.object.relationshipA.to = this.object.getPath(created);
            this.object.uis_update();
            this.findAppUi().focus(this.entity.uiA.relationshipA.bodyContentUi);
            this.findAppUi().focused.enterEditMode();
        } else {
            if (!this.object.listA) {
                this.object.installListA();
            }
            let created = this.findContainerForNewSubitem().createText('');
            let position = 0;
            let listA = this.object.listA;
            listA.insertPathOrDirectAtPosition(created, position);
            if (notNullUndefined(this.object.text)) {
                created.context = created.getPath(this.object);
            }
            listA.entity.uis_update_addedListItem(position);
            if (!this.isPlainList()) {
                this.ensureExpanded();
            }
            this.findAppUi().focus(this.entity.uiA.listA.elements[position]);
            this.findAppUi().focused.enterEditMode();
        }
    }

    findContainerForNewSubitem() : ContainerA {
        if (this.useProfileContainer) {
            return this.entity.getApp().profileG.getProfile().containerA;
        } else {
            return this.object.findContainer();
        }
    }

    mark() {
        let appUi = this.entity.getApp().uiA;
        this.writeUiChangesToObject();
        appUi.clipboard = this.object;
        appUi.clipboard_lostContext = false; // important!
        this.findAppUi().signal('marked: ' + appUi.clipboard.getShortDescription());
    }

    cut() {
        let appA_uiA = this.entity.getApp().uiA;
        appA_uiA.clipboard = this.object;
        appA_uiA.clipboard_lostContext = this.objectHasContext() && this.inContext();
        this.remove();
    }

    remove() {
        this.writeUiChangesToObject();
        let obj = this.object;
        this.entity.getApp().profileG.addToLastRemoved(obj);
        let uiContext = this.context;
        let uiListItems = uiContext.listA.elements;
        let position = uiListItems.indexOf(this);
        let uiContextObj = uiContext.object;
        if (this.objectHasContext() && this.inContext()) {
            obj.context = null;
            obj.uis_update_context();
        }
        uiContextObj.listA.jsList.splice(position, 1);
        uiContextObj.uis_update_removedListItem(position);
        if (uiContextObj.listA.jsList.length > 0) {
            let focusPosition = Math.min(uiListItems.length - 1, position);
            this.findAppUi().focus(uiListItems[focusPosition]);
        } else {
            this.findAppUi().focus(uiContext);
        }
    }

    writeUiChangesToObject() {
        if (notNullUndefined(this.object.text) && nullUndefined(this.object.link)) {
            this.textA.save();
        }
    }

    paste() {
        this.writeUiChangesToObject();
        if (this.object.relationshipA) {
            this.object.relationshipA.to = this.object.getPath(this.entity.getApp().uiA.clipboard);
            this.entity.getApp().uiA.clipboard_lostContext = false;
            this.object.uis_update();
            this.ensureExpanded();
            this.relationshipA.bodyContentUi.focus();
        } else {
            if (this.object.text === '' && !this.headerBodyG.hasBodyContent()) {
                this.context.pasteNextOnSubitem(this);
                this.remove();
            } else {
                if (!this.object.listA) {
                    this.object.installListA();
                }
                let appUi = this.entity.getApp().uiA;
                let position = 0;
                appUi.insertClipboardAtPosition(this.object, position);
                if (this.isHeaderBody()) {
                    this.ensureExpanded();
                }
                this.findAppUi().focus(this.entity.uiA.listA.elements[position]);
            }
        }
    }

    toggleCollapsible() {
        this.object.collapsible = !this.object.collapsible;
        this.object.uis_update_collapsible();
    }

    async expandOrCollapse() {
        if (this.isCollapsible()) {
            if (this.isCollapsed()) {
                if (this.headerBodyG.hasBodyContent()) {
                    await this.expandWithAnimation();
                }
            } else {
                this.collapseWithAnimation();
            }
        } else {
            this.entity.log('warning: not collapsible!');
        }
    }

    collapseWithAnimation() {
        let promise = this.bodyG.collapseWithAnimation();
        promise.then(() => {
            this.headerG.updateBodyIcon();
        });
    }

    async scaleUp() {
        if (this.isCollapsible() && this.isCollapsed()) {
            await this.expandWithAnimation();
        } else {
            let children = this.getListOfChildren();
            for (let child of children) {
                let result = await child.scaleUp();
            }
        }
    }

    async scaleDown(noContextJump? : boolean) : Promise<boolean> {
        if (!this.isPlainList() && this.isCollapsed()) {
            if (!noContextJump && this.context) {
                this.context.focus();
                await this.context.scaleDown();
            }
        } else {
            let children = this.getListOfChildren();
            let scaledSomethingDown = false;
            for (let child of children) {
                let result = await child.scaleDown(true);
                scaledSomethingDown = scaledSomethingDown || result;
            }
            if (scaledSomethingDown) {
                return true;
            } else {
                if (this.isCollapsible()) {
                    this.collapseWithAnimation();
                    return true;
                } else {
                    if (!this.isColumn) {
                        if (!noContextJump && this.context) {
                            this.context.focus();
                            await this.context.scaleDown();
                        }
                    }
                }
            }
        }
        return false;
    }

    async expandWithAnimation() {
        let promise = this.bodyG.expandWithAnimation();
        this.headerG.updateBodyIcon();
    }

    ensureExpanded() {
        if (!this.headerBodyG.bodyIsVisible()) {
            this.bodyG.displayBody();
            this.headerG.updateBodyIcon();
        }
    }

    ensureCollapsed() {
        this.bodyG.ensureCollapsed();
        this.headerG.updateBodyIcon();
    }

    update_addedListItem(position: number) {
        if (this.isHeaderBody()) {
            this.headerBodyG.update_addedListItem(position);
        } else if (this.isPlainList()) {
            this.listA.update_addedListItem(position);
        }
    }

    update_removedListItem(position: number) {
        if (this.isHeaderBody()) {
            this.headerBodyG.update_removedListItem(position);
        } else if (this.isPlainList()) {
            this.listA.update_removedListItem(position);
        }
    }

    update_text() {
        this.textA.update();
    }

    update_collapsible() {
        this.headerG.updateCursorStyle();
        this.headerG.updateBodyIcon();
        if (!this.object.collapsible) {
            this.ensureExpanded();
        }
    }

    update_context() {
        this.headerG.updateContextIcon();
        this.headerG.updateBodyIcon();
        this.headerG.updateCursorStyle();
        if (this.headerBodyG.bodyIsVisible()) {
            if (this.headerBodyG.hasBodyContent()) {
                this.bodyG.updateContextAsSubitem();
            } else {
                this.ensureCollapsed();
            }
        } else {
            if (this.hasContextAsSubitem()) {
                this.ensureExpanded();
            }
        }
    }

    showContainerMark() {
        if (this.entity.getApp().environment.url?.hostname === 'localhost') {
            let profile = this.entity.getApp().profileG.getProfile();
            if (profile) {
                if (profile.has(this.entity.getApp().profileG.publicString)) {
                    let publicContainer = profile.get(this.entity.getApp().profileG.publicString);
                    return publicContainer.contains(this.object);
                }
            }
        } else {
            return false;
        }
    }

    objectHasContext() : boolean {
        return notNullUndefined(this.object.context);
    }

    // check objectHasContext() before calling this method
    inContext() : boolean {
        if (notNullUndefined(this.context)) {
            return this.context.object === this.object.context.resolve();
        } else {
            return false;
        }
    }

    hasContextAsSubitem() : boolean {
        return this.objectHasContext() && !this.inContext();
    }

    toggleContext() {
        if (this.object.context) {
            this.object.context = undefined;
        } else {
            this.object.context = this.object.getPath(this.context.object);
        }
        this.object.uis_update_context();
    }

    pasteNext() {
        this.context.pasteNextOnSubitem(this);
    }

    showMeta() {
        this.ensureExpanded();
        this.bodyG.showMeta();
        this.headerG.updateBodyIcon();
    }

    hideMeta() {
        this.bodyG.hideMeta();
        if (!this.headerBodyG.hasBodyContent()) {
            this.ensureCollapsed();
        }
    }

    metaIsDisplayed() {
        return this.headerBodyG.bodyIsVisible() && this.bodyG.content_meta_htmlElement.innerHTML !== '';
    }

    setLink() {
        let input = this.findAppUi().input;
        this.object.link = input.get();
        input.clear();
        this.object.uis_update();
    }

    shakeTree() {
        let obj = this.object;
        if (obj.containerA) {
            let before = obj.containerA.countWithNestedEntities();
            obj.containerA.shakeTree();
            let deletions = before - obj.containerA.countWithNestedEntities();
            this.findAppUi().signal('shaked the tree (deleted ' + deletions + ' entities)');
        } else {
            this.findAppUi().signal('not a container');
        }
    }

    isCollapsed() : boolean {
        return !this.headerBodyG.bodyIsVisible();
    }

    findAppUi() : UiA_AppA {
        if (this.appA) {
            return this.appA;
        } else if (this.context) {
            return this.context.findAppUi();
        } else {
            return undefined;
        }
    }

    createSubUiFor_transmitEditability(object: Entity, uiReference? : UiA) : UiA{
        let ui = this.entity.getApp().uiA.prepareUiFor(object);
        ui.context = this;
        ui.editable = this.editable;
        ui.uiReference = uiReference;
        ui.install();
        return ui;
    }

    createSubUiFor(object: Entity) : UiA {
        let ui = this.entity.getApp().uiA.prepareUiFor(object);
        ui.context = this;
        ui.install();
        return ui;
    }

    enterEditMode() {
        this.editMode = true;
        this.headerG.focusStyle_update();
        this.headerG.updateCursorStyle();
        this.textA.htmlElement.contentEditable = 'true';
        this.textA.takeCaret();
    }

    leaveEditMode() {
        if (this.object) {
            this.editMode = false;
            this.headerG.focusStyle_update();
            this.headerG.updateCursorStyle();
            this.textA.htmlElement.contentEditable = 'false';
        }
    }

    getListOfChildren() : Array<UiA>{
        if (this.isHeaderBody()) {
            return this.bodyG.getListOfChildren();
        } else if (this.isPlainList()) {
            return this.listA.elements;
        }
    }

    focusNext() {
        let next = this.getNext();
        if (next != null) {
            next.focus();
        }
    }

    getNext() : UiA {
        let listOfChildren = this.getListOfChildren();
        if (listOfChildren.length > 0) {
            return listOfChildren[0];
        } else {
            return this.getNext_skippingChildren();
        }
    }

    // returns the next ui skipping the children of this
    getNext_skippingChildren() : UiA {
        if (nullUndefined(this.context)) {
            return undefined;
        } else {
            let parent = this.context;
            let childrenOfParent : Array<UiA> = parent.getListOfChildren();
            let position = childrenOfParent.indexOf(this);
            if (position + 1 < childrenOfParent.length) {
                return childrenOfParent[position + 1];
            } else {
                return parent.getNext_skippingChildren();
            }
        }
    }

    focus() {
        this.findAppUi().focus(this);
    }

    focusPrevious() {
        let previous = this.getPrevious();
        if (notNullUndefined(previous)) {
            previous.focus();
        }
    }

    getPrevious() : UiA {
        if (nullUndefined(this.context)) {
            return undefined;
        } else {
            return this.context.getPreviousOfChild(this);
        }
    }

    getPreviousOfChild(child : UiA) {
        let children : Array<UiA> = this.getListOfChildren();
        let position = children.indexOf(child);
        if (position > 0) {
            return children[position - 1].getLast();
        } else {
            return this;
        }
    }

    // Returns the last ui that belongs to this. If no child is available, then this is returned.
    getLast() : UiA {
        let children : Array<UiA> = this.getListOfChildren();
        if (children.length > 0) {
            return children[children.length - 1].getLast();
        } else {
            return this;
        }
    }

    toEndOfList(withoutDive? : boolean) {
        let children : Array<UiA> = this.getListOfChildren();
        if (!withoutDive && children.length > 1) {
            children.at(-1).focus();
        } else if (this.context) {
            let childrenOfParent = this.context.getListOfChildren();
            if (this === childrenOfParent.at(-1)) {
                this.context.toEndOfList(true);
            } else {
                childrenOfParent.at(-1).focus();
            }
        }
    }

    getColumn() : UiA {
        if (this.isColumn) {
            return this;
        } else if (this.context) {
            return this.context.getColumn();
        } else {
            return undefined;
        }
    }

    columnA_takeFocus() {
        if (this.lastFocused) {
            this.lastFocused.focus();
        } else {
            if (this.listA.elements.length > 0) {
                this.listA.elements[0].focus();
            } else {
                this.focus();
            }
        }
    }

    scrollIntoView() {
        let rect = this.getMainArea().getBoundingClientRect();
        let scrollableRect = this.getScrollableRect();
        if (rect.top < scrollableRect.top) {
            this.scrollTo('start');
        } else if (rect.bottom > scrollableRect.bottom) {
            this.scrollTo('end');
        }
    }

    getScrollableRect() {
        if (this.entity.getApp().uiA.isWebsite) {
            return this.findAppUi().website_scrollableArea.getBoundingClientRect();
        } else {
            return this.getColumn().htmlElementG.getBoundingClientRect();
        }
    }

    scrollTo(position: 'start' | 'end') {
        this.getMainArea().scrollIntoView({
            block: position,
            behavior: 'smooth'
        });
    }

    getMainArea() : HTMLElement {
        if (this.isHeaderBody()) {
            return this.headerG.htmlElement;
        } else {
            return this.htmlElementG;
        }
    }

    isCollapsible() : boolean {
        if (this.object) {
            return this.object.collapsible || notNullUndefined(this.object.parameterizedActionA);
        } else {
            return this.withoutObjectG_collapsible;
        }
    }

    transformToProperty() {
        this.makeObjectInline();
        this.object.installRelationshipA();
        this.object.listA = undefined;
        this.object.uis_update();
    }

    transformToPlainList() {
        this.object.text = undefined;
        if (!this.object.listA) {
            this.object.installListA();
        }
        this.object.uis_update();
    }

    // only for list items with context
    makeObjectInline() {
        let context : Entity = this.object.context.resolve();
        let contextToObject : PathA = context.listA.jsList.find(value => value.resolve() === this.object);
        contextToObject.listOfNames = undefined;
        contextToObject.direct = this.object;
        //
        this.object.container.containerA.mapNameEntity.delete(this.object.name);
        this.object.container = undefined;
        this.object.name = undefined;
        //
        context.makeInline(this.object);
    }

    appendTo(parent : HTMLElement) {
        parent.appendChild(this.htmlElementG);
        if (this.isHeaderBody()) {
            parent.appendChild(this.bodyG.htmlElement);
        }
    }
    
    insertBefore(next: HTMLElement) {
        insertBefore(next, this.htmlElementG);
        if (this.isHeaderBody()) {
            insertAfter(this.htmlElementG, this.bodyG.htmlElement);
        }
    }

    removeHTMLElements() {
        if (this.isHeaderBody()) {
            remove(this.bodyG.htmlElement);
        }
        remove(this.htmlElementG);
    }


    uiReference_withContext() : UiA {
        if (this.uiReference) {
            return this.uiReference;
        } else {
            return this.context?.uiReference_withContext();
        }
    }

}