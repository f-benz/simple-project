import {Entity} from "@/Entity";
import {UiA} from "@/ui/UiA";
import {notNullUndefined} from "@/utils";
import {UiA_AppA} from "@/ui/UiA_AppA";
import {Theme} from "@/ui/Theme";
import {OutputA} from "@/ui/OutputA";
import {InputA} from "@/ui/InputA";
import type {UiA_RelationshipA} from "@/ui/UiA_RelationshipA";
import {RelationshipA} from "@/RelationshipA";
import type {PathA} from "@/PathA";

export class AppA_UiA {

    mainColumnData: Entity;
    presentationModeA_contentData : Entity;
    clipboard: Entity;
    clipboard_lostContext: boolean;
    theme : Theme = Theme.blackWhite();
    webMeta: Entity;
    isWebsite: boolean;

    constructor(public entity: Entity) {
        this.mainColumnData = entity.appA.unboundG.createList();
        this.mainColumnData.container = entity;
        this.presentationModeA_contentData = entity.appA.unboundG.createList();
        this.presentationModeA_contentData.container = entity;
    }

    prepareUiFor(object: Entity) : UiA {
        let ui = this.createUi();
        ui.object = object;
        object.uis_add(ui);
        return ui;
    }

    createAppUi(editable? : boolean, withMeta? : boolean) : UiA_AppA {
        let ui = this.createUi();
        ui.editable = editable;
        ui.appA = new UiA_AppA(ui.entity);
        ui.appA.install(withMeta);
        return ui.appA;
    }

    createUi() : UiA {
        let ui = this.entity.getApp().createEntityWithApp();
        ui.uiA = new UiA(ui);
        return ui.uiA;
    }

    async insertClipboardAtPosition(object: Entity, position: number) {
        await object.listA.insertObjectAtPosition(this.clipboard, position);
        if (this.clipboard_lostContext) {
            if (notNullUndefined(object.text)) {
                this.clipboard.context = this.clipboard.getPath(object);
                this.clipboard_lostContext = false;
            }
        }
        await object.uis_update_addedListItem(position);
    }

    async createUiFor(object : Entity, editable? : boolean) {
        let ui = this.prepareUiFor(object);
        ui.editable = editable;
        await ui.install();
        return ui;
    }

    async createUiList(...uis : Array<UiA>) : Promise<UiA> {
        let entity = this.entity.appA.createEntityWithApp();
        entity.uiA = new UiA(entity);
        entity.uiA.installListA();
        let list = entity.uiA.listA;
        for (let ui of uis) {
            ui.context = entity.uiA;
        }
        list.elements = [...uis];
        await entity.uiA.install();
        return entity.uiA;
    }

    async createUiStringEntityProperty(propertyName: string, pathForValue: PathA, collapsible : boolean, editable? : boolean) : Promise<UiA_RelationshipA> {
        let object = this.entity.getApp().unboundG.createText(propertyName);
        object.installRelationshipA();
        object.relationshipA.to = pathForValue;
        object.editable = false;
        object.collapsible = collapsible;
        let ui = await this.createUiFor(object, editable);
        return ui.relationshipA;
    }
}