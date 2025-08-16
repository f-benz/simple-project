import {Entity} from "@/Entity";

export class PathA {

    listOfNames : Array<string>;
    direct: Entity;
    subject: Entity;

    constructor(public entity : Entity) {
    }

    resolve() : Entity {
        if (this.direct) {
            return this.direct;
        } else {
            return this.subject.resolveListOfNames(this.listOfNames);
        }
    }

    asString() : string {
        return this.listOfNames.join('_');
    }
}