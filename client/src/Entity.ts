import { ListA } from "@/ListA";
import { PathA } from "@/PathA";
import { AppA } from "@/AppA";
import { ContainerA } from "@/ContainerA";
import { UiA } from "@/ui/UiA";
import { ensureEndsWithSlash, notNullUndefined, nullUndefined } from "@/utils";
import type { StarterA } from "@/StarterA";
import { TestG_NestedTestsA } from "@/tester/TestG_NestedTestsA";
import { TestRunA } from "@/tester/TestRunA";
import { DeepCopyA } from "@/DeepCopyA";
import { CommandA } from "@/CommandA";
import { RelationshipA } from "@/RelationshipA";
import { ParameterizedActionA } from "@/ParameterizedActionA";

export class Entity {

    name: string;
    container: Entity;
    text: string;
    link: string;
    app: Entity;
    editable: boolean;
    collapsible: boolean;
    codeG_html: HTMLElement;
    uis: Array<UiA>;
    context: PathA;
    inline: boolean;
    commandA: CommandA;
    installCommandA() {
        this.commandA = new CommandA(this);
    }
    parameterizedActionA: ParameterizedActionA;
    codeG_jsFunction: Function;
    listA: ListA;
    installListA() {
        this.listA = new ListA(this);
    }
    pathA: PathA;
    installPathA() {
        this.pathA = new PathA(this);
    }
    appA: AppA;
    containerA: ContainerA;
    installContainerA() {
        this.containerA = new ContainerA(this);
    }
    uiA: UiA;
    starterA: StarterA;
    testRunA: TestRunA;
    installTestRunA() {
        this.testRunA = new TestRunA(this);
    }
    testG_nestedTestsA: TestG_NestedTestsA;
    testG_installNestedTestsA() {
        this.testG_nestedTestsA = new TestG_NestedTestsA(this);
        this.testG_nestedTestsA.install();
    }
    relationshipA: RelationshipA;
    installRelationshipA() {
        this.relationshipA = new RelationshipA(this);
    }

    json_withoutContainedObjects(): any {
        let obj: any = {
            text: this.text,
            list: this.listA?.json_withoutContainedObjects(),
            collapsible: this.collapsible,
            link: this.link,
            editable: this.editable,
            content: this.appA?.uiA?.mainColumnData.json_withoutContainedObjects(),
            context: this.context?.listOfNames,
        };
        if (this.relationshipA) {
            if (this.relationshipA.to) {
                obj.to = this.relationshipA.to.json();
            } else {
                obj.to = null;
            }
        }
        return obj;
    }

    getPath(object: Entity): PathA {
        this.logInfo('getPath of ' + object.getShortDescription());
        if (this.inline) {
            return this.context.direct.getPath(object);
        } else {
            let listOfNames: Array<string>;
            if (this.contains(object)) {
                if (this === object) {
                    listOfNames = [];
                } else {
                    listOfNames = [...this.getPath(object.container).listOfNames, object.name];
                }
            } else {
                listOfNames = ['..', ...this.container.getPath(object).listOfNames];
            }
            return this.getApp().createPath(listOfNames, this);
        }
    }

    getConnectorForJson(json : any) : PathA {
        if (json instanceof Array) {
            return this.getApp().createPath(json, this);
        } else {
            return this.getApp().direct(this.createInlineFromJson(json));
        }
    }

    createInlineFromJson(json: any): Entity {
        let created = this.getApp().unboundG.createFromJson(json);
        this.makeInline(created);
        return created;
    }

    contains(object: Entity): boolean {
        if (this === object) {
            return true;
        } else {
            if (object.container) {
                return this.contains(object.container);
            } else {
                return false;
            }
        }
    }

    resolveListOfNames(listOfNames: Array<string>): Entity {
        if (this.inline) {
            return this.context.direct.resolveListOfNames(listOfNames);
        } else {
            if (listOfNames.length === 0) {
                return this;
            } else if (listOfNames[0] === '..') {
                return this.container.resolveListOfNames(listOfNames.slice(1));
            } else {
                return this.containerA.mapNameEntity.get(listOfNames[0]).resolveListOfNames(listOfNames.slice(1));
            }
        }
    }

    pathOrDirect(object: Entity): PathA {
        if (object.isUnbound()) {
            return this.getApp().direct(object);
        } else {
            return this.getPath(object);
        }
    }

    isUnbound(): boolean {
        return nullUndefined(this.name) || !this.container;
    }

    export(): any {
        let exported = this.json_withoutContainedObjects();
        if (this.containerA) {
            exported.objects = {};
            for (let entry of this.containerA.mapNameEntity.entries()) {
                let name: string = entry[0];
                let entity: Entity = entry[1];
                exported.objects[name] = entity.export();
            }
        }
        return exported;
    }


    // flat export (not used at the moment)
    // export_allDependenciesInOneContainer() {
    //     let exported = this.json_withoutContainedObjects();
    //     let dependencies = this.getDependencies();
    //     if (dependencies.size > 0) {
    //         exported.dependencies = [];
    //         for (let dependency of dependencies) {
    //             exported.dependencies.push({
    //                 name: dependency.name,
    //                 ... dependency.json_withoutContainedObjects()
    //             });
    //         }
    //     }
    //     return exported;
    // }

    getObjectAndDependencies(): Set<Entity> {
        let set = new Set<Entity>();
        this.addObjectAndDependencies_onlyIfNotContained(set);
        return set;
    }

    getDependencies(): Set<Entity> {
        let set = this.getObjectAndDependencies();
        set.delete(this);
        return set;
    }

    private addObjectAndDependencies_onlyIfNotContained(set: Set<Entity>) {
        if (!set.has(this)) {
            set.add(this);
            if (this.listA) {
                for (let current of this.listA.jsList) {
                    current.resolve().addObjectAndDependencies_onlyIfNotContained(set);
                }
            }
            if (this.context) {
                this.context.resolve().addObjectAndDependencies_onlyIfNotContained(set);
            }
            if (this.relationshipA) {
                if (this.relationshipA.to) {
                    this.relationshipA.to.resolve().addObjectAndDependencies_onlyIfNotContained(set);
                }
            }
        }
    }

    getApp(): AppA {
        if (this.appA) {
            return this.appA;
        } else {
            return this.app?.appA;
        }
    }

    log(log: string) {
        this.getApp()?.logG.log(this, log);
    }

    logInfo(log: string) {
        this.log('                                      (info)           ' + log);
    }

    getDescription(): string {
        if (notNullUndefined(this.text)) {
            return this.text ? this.text : '[empty text]';
        } else if (this.listA) {
            return 'list (' + this.listA.jsList?.length + ')';
        } else if (this.pathA) {
            return 'path (' + this.pathA.listOfNames + ')';
        } else if (this.uiA) {
            return 'ui';
        } else if (notNullUndefined(this.name)) {
            return 'name: ' + this.name;
        } else if (this.testRunA) {
            return 'run: ' + this.testRunA.test?.name;
        }
        return 'tbd';
    }

    getShortDescription() {
        let description = this.getDescription();
        return description.substring(0, Math.min(description.length, 20));
    }

    getObject(): Entity {
        if (this.uiA?.object) {
            return this.uiA.object;
        } else {
            return this;
        }
    }

    uis_add(ui: UiA) {
        if (nullUndefined(this.uis)) {
            this.uis = [];
        }
        this.uis.push(ui);
    }

    uis_update() {
        for (let ui of this.getAllUis()) {
            ui.withObjectA_update();
        }
    }

    uis_update_containerStyle() {
        for (let ui of this.getAllUis()) {
            ui.headerBodyA.headerG.updateContainerStyle();
        }
    }

    uis_update_addedListItem(position: number) {
        for (let ui of this.getAllUis()) {
            ui.update_addedListItem(position);
        }
    }

    uis_update_removedListItem(position: number) {
        for (let ui of this.getAllUis()) {
            ui.update_removedListItem(position);
        }
    }

    uis_update_text() {
        for (let ui of this.getAllUis()) {
            ui.update_text();
        }
    }

    uis_update_collapsible() {
        for (let ui of this.getAllUis()) {
            ui.update_collapsible();
        }
    }


    uis_update_context() {
        for (let ui of this.getAllUis()) {
            ui.update_context();
        }
    }

    getAllUis(): Array<UiA> {
        let allUis: Array<UiA> = [];
        if (this.uiA) {
            allUis.push(this.uiA);
        }
        if (notNullUndefined(this.uis)) {
            allUis.push(...this.uis);
        }
        return allUis;
    }

    createCode(name: string, jsFunction: Function): Entity {
        let code: Entity = new Entity();
        code.app = this.getApp().entity;
        code.codeG_jsFunction = jsFunction;
        let containerA = this.containerA ? this.containerA : this.getApp().entity.containerA;
        containerA.bind(code, name);
        return code;
    }

    testG_run(withoutNestedTests?: boolean): Entity {
        let testRun: Entity = this.getApp().createEntityWithApp();
        testRun.installTestRunA();
        let testRunA = testRun.testRunA;
        testRunA.test = this;
        testRun.collapsible = true;
        if (!withoutNestedTests && this.testG_nestedTestsA) {
            testRunA.nestedRuns = this.getApp().unboundG.createList();
            for (let nestedTest of this.testG_nestedTestsA.nestedTests.listA.getResolvedList()) {
                let nestedTestRun = nestedTest.testG_run();
                testRunA.nestedRuns.listA.addDirect(nestedTestRun);
                if (!nestedTestRun.testRunA.resultG_success) {
                    testRunA.resultG_success = false;
                }
            }
        }
        try {
            this.codeG_jsFunction(testRunA);
            if (testRunA.resultG_success != false) {
                testRunA.resultG_success = true;
            }
        } catch (e: any) {
            testRunA.resultG_error = e;
            testRunA.resultG_success = false;
            console.error(e);
        }
        return testRun;
    }

    shallowCopy(): Entity {
        let copy = this.getApp().createBoundEntity();
        copy.text = this.text;
        copy.collapsible = this.collapsible;
        copy.link = this.link;
        copy.editable = this.editable;
        if (this.listA) {
            copy.installListA();
            for (let listItem of this.listA.jsList) {
                copy.listA.jsList.push(copy.getPath(listItem.resolve()));
            }
        }
        return copy;
    }

    deepCopy(targetContainer: ContainerA): DeepCopyA {
        return new DeepCopyA(this, targetContainer);
    }

    script_setContextForAllObjectsInContainer() {
        for (let value of [this, ...this.containerA.mapNameEntity.values()]) {
            if (value.listA) {
                value.listA.getResolvedList().forEach((subitem: Entity) => {
                    subitem.context = subitem.getPath(value);
                });
            }
        }
    }

    getUrl(): string {
        if (this.getFixedUrl()) {
            return this.getFixedUrl();
        } else {
            let superiorWithFixedUrl = this.getSuperiorWithFixedUrl();
            if (superiorWithFixedUrl) {
                return ensureEndsWithSlash(superiorWithFixedUrl.getFixedUrl()) + superiorWithFixedUrl.getPath(this).listOfNames.join('/');
            }
        }
        return undefined;
    }

    getFixedUrl(): string {
        let propertyName = 'fixedUrl';
        if (this.has(propertyName)) {
            return this.get(propertyName)?.text;
        }
    }

    getSuperiorWithFixedUrl(): Entity {
        if (this.container) {
            if (this.container.getFixedUrl()) {
                return this.container;
            } else {
                return this.container.getSuperiorWithFixedUrl();
            }
        } else {
            return undefined;
        }
    }

    getTopLevelContainer(): ContainerA {
        if (this.container) {
            return this.container.getTopLevelContainer();
        } else if (this.containerA) {
            return this.containerA;
        } else {
            return undefined;
        }
    }

    delete() {
        if (this.container) {
            this.container.containerA.mapNameEntity.delete(this.name);
        }
        let app = this.getApp().entity;
        let object: any = this;
        for (let key of Object.keys(object)) {
            object[key] = undefined;
        }
        this.app = app;
    }

    findContainer(): ContainerA {
        if (this.inline) {
            return this.context.direct.findContainer();
        } else {
            if (this.containerA) {
                return this.containerA;
            } else if (this.container) {
                return this.container.containerA;
            } else {
                throw new Error('found no container!');
            }
        }
    }

    set(propertyName: string, value: Entity) {
        if (!this.listA) {
            this.installListA();
        }
        let relationship: RelationshipA;
        if (this.has(propertyName)) {
            relationship = this.getProperty(propertyName);
        } else {
            relationship = this.addProperty(propertyName);
        }
        relationship.to = relationship.entity.getPath(value);
    }

    has(propertyName: string) {
        return notNullUndefined(this.listA) && notNullUndefined(this.getProperty(propertyName));
    }

    getProperty(propertyName: string): RelationshipA {
        for (let item of this.listA.getResolvedList()) {
            if (item.relationshipA && item.text === propertyName) {
                return item.relationshipA;
            }
        }
    }

    addProperty(propertyName: string): RelationshipA {
        let property: RelationshipA = this.getApp().unboundG.createRelationship();
        this.listA.addDirect(property.entity);
        property.entity.text = propertyName;
        this.makeInline(property.entity);
        return property;
    }

    makeInline(entity : Entity) {
        entity.inline = true;
        entity.context = this.getApp().direct(this);
    }

    get(propertyName: string): Entity {
        if (this.listA) {
            return this.getProperty(propertyName).to.resolve();
        }
        return null;
    }

    uses(used: Entity): boolean {
        if (this.listA) {
            for (let subitem of this.listA.getResolvedList()) {
                if (used === subitem) {
                    return true;
                }
            }
        }
        if (this.relationshipA?.to?.resolve() === used) {
            return true;
        }
        return false;
    }
}