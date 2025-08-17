import {Entity} from "@/Entity";
import {ListA} from "@/ListA";
import {notNullUndefined, nullUndefined} from "@/utils";
import {ContainerA} from "@/ContainerA";
import {CreateFromOldFormat} from "@/CreateFromOldFormat";
import {RelationshipA} from "@/RelationshipA";

// / unbound means that the created object has no container and no name.
export class AppA_UnboundG {
    
    constructor(private entity : Entity) {
    }

    createList(...jsList : Array<Entity>) : Entity {
        let list = this.entity.appA.createEntityWithApp();
        list.listA = new ListA(list, ...(jsList.map(entity => {
            return this.entity.appA.direct(entity);
        })));
        return list;
    }

    createList_typed(...jsList : Array<Entity>) : ListA {
        return this.createList(...jsList).listA;
    }

    createText(text: string) : Entity {
        let entity = this.entity.appA.createEntityWithApp();
        entity.text = text;
        return entity;
    }

    createLink(href: string, text?: string) {
        let entity = this.entity.appA.createEntityWithApp();
        entity.link = href;
        entity.text = text;
        return entity;
    }

    createTextWithList(text : string, ...jsList : Array<Entity>) : Entity {
        let entity = this.entity.appA.createEntityWithApp();
        entity.text = text;
        entity.listA = new ListA(entity, ...(jsList.map(entity => {
            return this.entity.appA.direct(entity);
        })));
        return entity;
    }

    createCollapsible(text: string, ...jsList : Array<Entity>) {
        let entity = this.createTextWithList(text, ...jsList);
        entity.collapsible = true;
        return entity;
    }

    createButton(label : string, func : Function) : Entity {
        let button = this.entity.appA.createEntityWithApp();
        button.text = label;
        button.codeG_jsFunction = func;
        return button;
    }

    createFromJson(json: any, subjectForPaths? : Entity) : Entity {
        let entity : Entity = this.entity.appA.createEntityWithApp();
        if (nullUndefined(subjectForPaths)) {
            subjectForPaths = entity;
        }
        entity.text = json.text;
        entity.collapsible = json.collapsible;
        entity.link = json.link;
        entity.editable = json.editable;
        if (notNullUndefined(json.context)) {
            entity.context = this.getPathOrDirectForJson(json.context, subjectForPaths);
        }
        if (notNullUndefined(json.list)) {
            entity.installListA();
            entity.listA.jsList = [];
            for (let current of json.list) {
                entity.listA.jsList.push(this.getPathOrDirectForJson(current, subjectForPaths));
            }
        }
        if (notNullUndefined(json.objects)) {
            entity.installContainerA();
            for (let key of Object.keys(json.objects)) {
                let current : Entity = this.createFromJson(json.objects[key]);
                entity.containerA.mapNameEntity.set(key, current);
                current.name = key;
                current.container = entity;
            }
        }
        if (notNullUndefined(json.to)) {
            entity.installRelationshipA();
            entity.relationshipA.to = this.getPathOrDirectForJson(json.to, subjectForPaths);
        }
        return entity;
    }

    private getPathOrDirectForJson(json : any, subjectForPaths : Entity) {
        if (json instanceof Array) {
            return this.entity.appA.createPath(json, subjectForPaths);
        } else {
            return this.entity.appA.direct(this.createFromJson(json, subjectForPaths));
        }
    }

    createFromOldJson(json: any) : Entity {
        return new CreateFromOldFormat(this.entity).run(json);
    }

    createRelationship() {
        return RelationshipA.create(this.entity.appA);
    }
}