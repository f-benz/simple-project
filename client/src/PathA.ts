import {Entity} from "@/Entity";
import { notNullUndefined } from "./utils";

export class PathA {

    listOfNames : Array<string>;
    direct: Entity;

    constructor(public entity : Entity) {
    }

    resolve() : Entity {
        if (this.direct) {
            return this.direct;
        } else {
            return this.getContext().resolveListOfNames(this.listOfNames);
        }
    }

    private getContext() {
        return this.entity.context.resolve();
    }

    asString() : string {
        return this.listOfNames.join('_');
    }

    json(): any {
        if (notNullUndefined(this.listOfNames)) {
            return this.listOfNames;
        } else {
            return this.direct.export();
        }
    }


}