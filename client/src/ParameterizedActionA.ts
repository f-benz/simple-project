import type {Entity} from "@/Entity";
import type {Parameter} from "@/Parameter";

export class ParameterizedActionA {
    parameters : Array<Parameter> = [];
    constructor(public entity : Entity) {
    }

    runWithArgs(args: Entity) : any {
        let resolvedArgs = [];
        for (let parameter of this.parameters) {
            if (parameter.type === 'stringValue') {
                resolvedArgs.push(args.get(parameter.name).text);
            } else if (parameter.type === 'entity') {
                resolvedArgs.push(args.get(parameter.name));
            }
        }
        return this.entity.codeG_jsFunction.call(null, ...resolvedArgs);
    }
}