import type {Entity} from "@/Entity";
import type {PathA} from "@/PathA";
import { notNullUndefined } from "./utils";

export class ListA {

    jsList : Array<PathA>;

    constructor(public entity : Entity, ...jsList : Array<PathA>) {
        this.jsList = jsList;
    }

    add(object: Entity) {
        this.jsList.push(this.entity.getPath(object));
    }

    addByListOfNames(listOfNames : Array<string>) {
        this.jsList.push(this.entity.getApp().createPath(listOfNames, this.entity));
    }

    addDirect(...entities: Array<Entity>) {
        this.jsList.push(...entities.map((entity : Entity) => this.entity.getApp().direct(entity)));
    }

    json_withoutContainedObjects() {
        return this.jsList.map(path => {
            return path.json();
        });
    }

    getResolved(index : number) : Entity {
        return this.jsList[index].resolve();
    }

    getResolvedList() : Array<Entity> {
        let resolvedListItems = [];
        for (let current of this.jsList) {
            resolvedListItems.push(current.resolve());
        }
        return resolvedListItems;
    }

    insertPathOrDirectAtPosition(object: Entity, position: number) {
        this.jsList.splice(position, 0, this.entity.pathOrDirect(object));
    }

    insertPathAtPosition(path: PathA, position: number) {
        this.jsList.splice(position, 0, path);
    }

    insertObjectAtPosition(listItem: Entity, position: number) {
        this.insertPathAtPosition(this.entity.getPath(listItem), position);
    }

    findByText(text: string) : Entity {
        for (let item of this.getResolvedList()) {
            if (item.text === text) {
                return item;
            }
        }
    }
}