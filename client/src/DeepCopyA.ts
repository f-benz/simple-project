import type {Entity} from "@/Entity";
import type {PathA} from "@/PathA";
import type {ContainerA} from "@/ContainerA";
import {RelationshipA} from "@/RelationshipA";

export class DeepCopyA {

    map : Map<Entity, Entity>;
    objectAndDependencies : Set<Entity>;

    constructor(public entity : Entity, public targetContainer : ContainerA) {
    }

    run() : Entity {
        this.objectAndDependencies = this.entity.getObjectAndDependencies();
        this.createBoundEmptyEntities();
        for (let object of this.objectAndDependencies) {
            this.copyToEmptyEntity(object, this.map.get(object));
        }
        return this.map.get(this.entity);
    }

    createBoundEmptyEntities() {
        this.map = new Map();
        for (let object of this.objectAndDependencies) {
            this.map.set(object, this.targetContainer.createBoundEntity());
        }
    }

    copyToEmptyEntity(object : Entity, emptyEntity : Entity) {
        emptyEntity.text = object.text;
        emptyEntity.collapsible = object.collapsible;
        emptyEntity.link = object.link;
        emptyEntity.editable = object.editable;
        if (object.context) {
            if (object !== this.entity) {
                emptyEntity.context = emptyEntity.getPath(this.map.get(object.context.resolve()));
            }
        }
        if (object.listA) {
            emptyEntity.installListA();
            for (let listItem of object.listA.jsList) {
                emptyEntity.listA.jsList.push(emptyEntity.getPath(this.map.get(listItem.resolve())));
            }
        }
        if (object.relationshipA) {
            emptyEntity.installRelationshipA();
            emptyEntity.relationshipA.to = emptyEntity.getPath(this.map.get(object.relationshipA.to.resolve()));
        }
    }
}