import type {Entity} from "@/Entity";
import {div, dummyDiv, nullUndefined, textElem} from "@/utils";
import {OutputA} from "@/ui/OutputA";
import {InputA} from "@/ui/InputA";
import {UiA} from "@/ui/UiA";
import type {AppA} from "@/AppA";
import {UiA_AppA_GlobalEventG} from "@/ui/UiA_AppA_GlobalEventG";
import {UiA_AppA_CommandsA} from "@/ui/UiA_AppA_CommandsA";
import type {UiA_RelationshipA} from "@/ui/UiA_RelationshipA";
import {ParameterizedActionA} from "@/ParameterizedActionA";
import type {ListA} from "@/ListA";
import {Parameter} from "@/Parameter";

export class UiA_AppA {

    htmlElement: HTMLElement;

    output : OutputA;
    input : InputA;
    focused : UiA;
    website_scrollableArea : HTMLElement = div();
    statusBar: HTMLElement = div();
    globalEventG: UiA_AppA_GlobalEventG;
    commandsA: UiA_AppA_CommandsA;
    mainColumnUi : UiA;
    presentationModeA_contentUi : UiA;
    webMetaUi : UiA;
    commandsUi: UiA;
    focusStyle_marker: HTMLElement;
    meta_htmlElement: HTMLElement = div();
    supportColumn_freeSpace: Entity;
    supportColumn_freeSpace_ui : UiA;
    supportColumnUi: UiA;
    static rowGap : number = 0.25;

    constructor(public entity: Entity) {
        this.globalEventG = new UiA_AppA_GlobalEventG(entity);
        this.htmlElement = entity.uiA.htmlElementG;
    }

    install(showMeta? : boolean) : void {
        let app_uiA = this.getApp().uiA;
        this.commandsA = new UiA_AppA_CommandsA(this.entity);
        this.commandsA.installCommands();
        this.commandsA.installMapForInputPatterns();
        this.htmlElement.style.backgroundColor = app_uiA.theme.backgroundColor;
        this.htmlElement.style.color = app_uiA.theme.fontColor;
        this.htmlElement.style.height = '100%';
        this.htmlElement.style.display = 'flex';
        this.htmlElement.style.flexDirection = 'column';
        this.updateStatusBar();
        this.htmlElement.appendChild(this.statusBar);
        this.htmlElement.appendChild(this.meta_htmlElement);
        if (app_uiA.isWebsite) {
            this.install_website();
        } else {
            let columnsDiv = div();
            this.htmlElement.appendChild(columnsDiv);
            columnsDiv.style.flexGrow = '2';
            columnsDiv.style.minHeight = '0%'; // this is necessary to prevent this div from overflowing (it is weird ...)
            columnsDiv.style.display = 'flex';
            columnsDiv.appendChild(dummyDiv(15));
            let uiElementsForSupportColumn : Array<UiA> = [];
            if (showMeta) {
                uiElementsForSupportColumn.push(this.createMeta());
            }
            this.supportColumn_freeSpace = this.getApp().createList();
            this.supportColumn_freeSpace_ui = app_uiA.createUiFor(this.supportColumn_freeSpace, true);
            this.supportColumn_freeSpace_ui.useProfileContainer = true;
            uiElementsForSupportColumn.push(this.supportColumn_freeSpace_ui);
            this.supportColumnUi = this.createColumn(...uiElementsForSupportColumn);
            columnsDiv.appendChild(this.supportColumnUi.htmlElementG);
            this.supportColumnUi.context = this.entity.uiA;
            this.supportColumnUi.htmlElementG.style.flexBasis = '25rem';
            this.supportColumnUi.htmlElementG.style.scrollbarWidth = 'thin';
            this.mainColumnUi = this.createColumnFor(app_uiA.mainColumnData);
            this.mainColumnUi.context = this.entity.uiA;
            this.mainColumnUi.useProfileContainer = true;
            columnsDiv.appendChild(this.mainColumnUi.htmlElementG);
            this.mainColumnUi.htmlElementG.style.flexBasis = '40rem';
            columnsDiv.appendChild(dummyDiv(50));
            if (app_uiA.webMeta) {
                let footerDiv = div();
                footerDiv.style.borderTop = 'solid';
                footerDiv.style.borderColor = app_uiA.theme.secondBackgroundColor;
                this.htmlElement.appendChild(footerDiv);
                UiA_AppA.setStyleForHtmlContainer(footerDiv);
                this.webMetaUi = this.entity.uiA.createSubUiFor(app_uiA.webMeta);
                this.webMetaUi.appendTo(footerDiv);
            }
        }
    }

    private createMeta() : UiA {
        this.commandsUi = this.getApp().uiA.createUiFor(this.createButtons());
        this.output = OutputA.create(this.entity);
        this.input = InputA.create(this.entity);
        let uiList = this.getApp().uiA.createUiList(this.commandsUi, this.input.getUi().uiA, this.output.getUi().uiA);
        uiList.context = this.entity.uiA;
        return uiList;
    }

    private install_website() {
        let app_uiA = this.getApp().uiA;
        let contentWrapper = div();
        this.htmlElement.appendChild(this.website_scrollableArea);
        this.website_scrollableArea.style.overflowY = 'scroll';
        this.website_scrollableArea.style.paddingLeft = '0.2rem';
        this.website_scrollableArea.style.paddingRight = '0.2rem';
        this.website_scrollableArea.style.flexGrow = '2';
        let centerWrapper = div();
        this.website_scrollableArea.appendChild(centerWrapper);
        centerWrapper.appendChild(dummyDiv(35));
        centerWrapper.appendChild(contentWrapper);
        centerWrapper.appendChild(dummyDiv(50));
        contentWrapper.style.paddingTop = '3rem';
        this.presentationModeA_contentUi = this.entity.uiA.createSubUiFor_transmitEditability(app_uiA.presentationModeA_contentData);
        this.presentationModeA_contentUi.appendTo(contentWrapper);
        centerWrapper.style.display = 'flex';
        centerWrapper.style.justifyContent = 'center';
        contentWrapper.style.flexBasis = '35rem';
        contentWrapper.style.flexShrink = '1';
        contentWrapper.style.flexGrow = '0';
        this.website_scrollableArea.appendChild(this.entity.uiA.createPlaceholderArea());
        if (app_uiA.webMeta) {
            this.webMetaUi = this.entity.uiA.createSubUiFor(app_uiA.webMeta);
            this.webMetaUi.appendTo(this.website_scrollableArea);
        }
    }

    focus(ui : UiA) {
        if (ui !== this.focused) {
            let focusedPrevious = this.focused;
            this.focused = ui;
            if (focusedPrevious) {
                let focusedPrevious_column = focusedPrevious.getColumn();
                if (focusedPrevious_column) {
                    focusedPrevious_column.lastFocused = focusedPrevious;
                }
                focusedPrevious.leaveEditMode();
                focusedPrevious.updateFocusStyle();
            }
            this.focused.updateFocusStyle();
            this.focused.takeCaret();
            this.focused.scrollIntoView();
        }
    }

    signal(text : string) {
        this.statusBar.innerHTML = null;
        let textHtmlElement = textElem(text);
        this.statusBar.appendChild(textHtmlElement);
        textHtmlElement.style.backgroundColor = this.getApp().uiA.theme.highlight;
        textHtmlElement.style.display = 'inline';
        textHtmlElement.style.marginLeft = '0.5rem';
        setTimeout(()=> {
            textHtmlElement.style.backgroundColor = this.getApp().uiA.theme.secondBackgroundColor;
        }, 800);
    }

    ensureContainer_AndUpdateStyle(entity: Entity) {
        if (nullUndefined(entity.containerA)) {
            entity.installContainerA();
        }
        entity.uis_update_containerStyle();
    }

    createButtons() : Entity {
        let lowPriorityButtons = this.getApp().unboundG.createTextWithList('mehr',
            this.getApp().unboundG.createButton('export app', () => {
                this.globalEventG.exportApp();
            }),
            this.getApp().unboundG.createButton('import from old json', () => {
                this.globalEventG.importOldJson();
            }),
            this.getApp().unboundG.createButton('script: set context for all objects in container', () => {
                this.globalEventG.script_setContextForAllObjectsInContainer();
            }),
            this.getApp().unboundG.createButton('set link', () => {
                this.globalEventG.setLink();
            }),
            this.getApp().unboundG.createButton('ensure container', () => {
                this.globalEventG.ensureContainer();
            }),
            this.getApp().unboundG.createButton('export', () => {
                this.globalEventG.export();
            }),
            this.getApp().unboundG.createButton('import', () => {
                this.globalEventG.import();
            })
        );
        lowPriorityButtons.collapsible = true;
        return this.getApp().unboundG.createTextWithList('commands',
            this.commandsA.importProfile.entity,
            this.commandsA.exportProfile.entity,
            this.commandsA.clear.entity,
            this.commandsA.defaultAction.entity,
            this.commandsA.newSubitem.entity,
            this.commandsA.toggleCollapsible.entity,
            this.getApp().unboundG.createButton('expand/collapse', () => {
                this.globalEventG.expandOrCollapse();
            }),
            this.commandsA.mark.entity,
            this.commandsA.cut.entity,
            this.commandsA.deepCopy.entity,
            this.commandsA.paste.entity,
            this.commandsA.pasteNext.entity,
            this.getApp().unboundG.createButton('focus root', () => {
                this.globalEventG.focusRoot();
            }),
            this.commandsA.toggleContext.entity,
            this.commandsA.shakeTree.entity,
            this.commandsA.exportRawText.entity,
            this.commandsA.transformToProperty.entity,
            this.commandsA.transformToPlainList.entity,
            this.createParameterizedAction_createTextObjectWithName(),
            this.createParameterizedAction_find(),
            this.createParameterizedAction_findUsages(),
            lowPriorityButtons
        );
    }

    createParameterizedAction_createTextObjectWithName() : Entity {
        return this.getApp().createParameterizedAction(
            'create text-object with name',
            [new Parameter('name', 'stringValue'), new Parameter('container', 'entity')],
            (name : string, container : Entity) => {
                let createdObject = container.containerA.createBoundEntity(name);
                createdObject.text = '';
                return createdObject;
            }
        ).entity;
    }

    createParameterizedAction_find() : Entity {
        return this.getApp().createParameterizedAction(
            'find',
            [new Parameter('pattern', 'stringValue')],
            (pattern : string) => {
                return this.getApp().profileG.getProfile().containerA.find(pattern).entity;
            }
        ).entity;
    }

    createParameterizedAction_findUsages() : Entity {
        return this.getApp().createParameterizedAction(
            'find usages',
            [new Parameter('used', 'entity')],
            (used : Entity) => {
                return this.getApp().profileG.getProfile().containerA.findUsages(used).entity
            }
        ).entity;
    }

    isActive() : boolean {
        if (this.getApp().environment?.activeAppUi) {
            return this.getApp().environment.activeAppUi === this;
        } else {
            return true;
        }
    }

    getApp() : AppA {
        return this.entity.getApp();
    }

    ensureActive() {
        if (this.getApp().environment) {
            this.getApp().environment.ensureActive(this);
        }
    }

    clear() {
        this.getApp().profileG.clearLastRemoved();
        let roots = [];
        let profile = this.getApp().profileG.getProfile();
        roots.push(profile);
        roots.push(...this.getApp().uiA.mainColumnData.listA.getResolvedList());
        let before = profile.containerA.countWithNestedEntities();
        this.getApp().shakeTree_withMultipleRoots(roots, profile.containerA);
        let deletions = before - profile.containerA.countWithNestedEntities();
        this.signal('cleared (' + deletions + ' deletions)');
    }

    createColumnFor(object : Entity) {
        let ui = this.entity.getApp().uiA.prepareUiFor(object);
        ui.editable = this.entity.uiA.editable;
        ui.isColumn = true;
        ui.install();
        return ui;
    }

    createColumn(...uiElements : Array<UiA>) : UiA {
        let entity = this.getApp().createEntityWithApp();
        entity.uiA = new UiA(entity);
        entity.uiA.installListA();
        let list = entity.uiA.listA;
        for (let ui of uiElements) {
            ui.context = entity.uiA;
        }
        list.elements = [...uiElements];
        entity.uiA.isColumn = true;
        entity.uiA.install();
        return entity.uiA;
    }

    updateStatusBar() {
        this.statusBar.style.backgroundColor = this.getApp().uiA.theme.secondBackgroundColor;
        this.statusBar.style.flexBasis = '1.3rem';
        this.statusBar.style.flexShrink = '0';
        if (this.getApp().uiA.isWebsite) {
            this.statusBar.style.display = 'none';
        } else {
            this.statusBar.style.display = 'default';
        }
    }

    static setStyleForHtmlContainer(htmlContainer: HTMLElement) {
        htmlContainer.style.display = 'flex';
        htmlContainer.style.flexWrap = 'wrap';
        htmlContainer.style.rowGap = this.rowGap + 'rem';
    }
}