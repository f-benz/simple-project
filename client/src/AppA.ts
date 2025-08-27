import type {AppA_UiA} from "@/ui/AppA_UiA";
import {PathA} from "@/PathA";
import {Entity} from "@/Entity";
import {LogG} from "@/LogG";
import {AppA_UnboundG} from "@/AppA_UnboundG";
import {StarterA} from "@/StarterA";
import type {Environment} from "@/Environment";
import {AppA_TesterA} from "@/tester/AppA_TesterA";
import type {ContainerA} from "@/ContainerA";
import {AppA_ProfileG} from "@/AppA_ProfileG";
import {ParameterizedActionA} from "@/ParameterizedActionA";
import {Parameter} from "@/Parameter";

export class AppA {

    environment: Environment;
    readonly logG: LogG;
    readonly unboundG : AppA_UnboundG;
    uiA: AppA_UiA;
    testerA: AppA_TesterA;
    installTesterA() {
        this.testerA = new AppA_TesterA(this.entity);
    }
    profileG : AppA_ProfileG;

    constructor(public entity : Entity) {
        this.unboundG = new AppA_UnboundG(entity);
        this.profileG = new AppA_ProfileG(entity);
        this.logG = new LogG(entity);
        entity.installContainerA();
    }

    createEntityWithApp() {
        let entity = this.createEntity();
        entity.app = this.entity;
        return entity;
    }

    createEntity() {
        return new Entity();
    }

    createBoundEntity(name? : string) : Entity {
        return this.entity.containerA.createBoundEntity(name);
    }

    createText(text: string) : Entity {
        return this.entity.containerA.createText(text);
    }

    createList() : Entity {
        return this.entity.containerA.createList();
    }

    createTextWithList(text : string, ...jsList : Array<Entity>) : Entity {
        return this.entity.containerA.createTextWithList(text, ...jsList);
    }

    createPath(listOfNames: Array<string>, subject : Entity) : PathA {
        let path = this.createEntityWithApp();
        path.installPathA();
        path.pathA.listOfNames = listOfNames;
        path.pathA.subject = subject;
        return path.pathA;
    }

    direct(entity : Entity) : PathA {
        let path = this.createEntityWithApp();
        path.installPathA();
        path.pathA.direct = entity;
        return path.pathA;
    }

    createLink(href: string, text?: string) {
        return this.entity.containerA.createLink(href, text);
    }

    createStarter() : StarterA {
        let starter = this.createEntityWithApp();
        starter.starterA = new StarterA(starter);
        return starter.starterA;
    }

    createParameterizedAction(name : string, parameters : Array<Parameter>, action : Function) : ParameterizedActionA {
        let find = this.unboundG.createText(name);
        find.parameterizedActionA = new ParameterizedActionA(find);
        find.parameterizedActionA.parameters.push(...parameters);
        find.codeG_jsFunction = action;
        return find.parameterizedActionA;
    }

    shakeTree_withMultipleRoots(roots : Array<Entity>, ...containers : Array<ContainerA>) {
        let keep : Set<Entity> = new Set();
        for (let root of roots) {
            for (let dependency of root.getObjectAndDependencies()) {
                keep.add(dependency);
            }
        }
        for (let container of containers) {
            container.shakeTree_delete(keep);
        }
    }
}