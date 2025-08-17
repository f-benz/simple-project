import type {Entity} from "@/Entity";
import {UiA_AppA} from "@/ui/UiA_AppA";

export class AppA_ProfileG {

    readonly lastRemovedString : string = 'lastRemoved';
    readonly contentString : string = 'content';
    readonly rootString : string = 'root';
    readonly publicString : string = 'public';

    constructor(public entity : Entity) {
    }

    getProfile() : Entity {
        return this.entity.containerA.mapNameEntity.get('profile');
    }

    setProfile(profile: Entity) {
        this.entity.containerA.bind(profile, 'profile');
    }

    createProfile() {
        let profile = this.entity.appA.unboundG.createText('profile');
        profile.installListA();
        profile.installContainerA();
        let lastRemovedList = profile.containerA.createList();
        profile.set(this.lastRemovedString, lastRemovedList);
        let contentList = profile.containerA.createList();
        profile.set(this.contentString, contentList);
        this.setProfile(profile);
    }

    addToLastRemoved(entity: Entity) {
        let profile = this.getProfile();
        if (profile) {
            let lastRemoved = profile.get(this.lastRemovedString);
            lastRemoved.listA.add(entity);
            lastRemoved.uis_update();
        } else {
            console.error('no profile!');
        }
    }

    clearLastRemoved() {
        let profile = this.getProfile();
        let lastRemoved = profile.get(this.lastRemovedString);
        lastRemoved.listA.jsList = [];
        lastRemoved.uis_update();
    }

    exportProfile() : Promise<any> {
        let profile = this.getProfile();
        let forContent = profile.get(this.contentString);
        forContent.listA.jsList = [];
        let content = this.entity.appA.uiA.mainColumnData;
        for (let resolved of content.listA.getResolvedList()) {
            forContent.listA.add(resolved);
        }
        return profile.export();
    }

    importProfile(json : any) {
        let created = this.entity.appA.unboundG.createFromJson(json);
        this.setProfile(created);
        let forContent = created.get(this.contentString);
        for (let resolved of forContent.listA.getResolvedList()) {
            this.entity.appA.uiA.mainColumnData.listA.add(resolved);
        }
        this.entity.appA.uiA.mainColumnData.uis_update();
        forContent.listA.jsList = [];
    }
}