import type {Entity} from "@/Entity";
import type {StarterA} from "@/StarterA";
import {Theme} from "@/ui/Theme";

export class StarterA_FullStartG {
    constructor(public entity : Entity) {
    }
    async tester() {
        let starter = this.getStarter();
        starter.createTester(starter.getEnvironment().testCreator);
        starter.checkTestMode();
        await starter.createdApp.appA.testerA.run();
        if (starter.isPublicWeb()) {
            starter.createdApp.appA.uiA.webMeta = starter.createUnboundWebMeta();
        }
        let appUi = starter.createdApp.appA.uiA.createAppUi();
        starter.getEnvironment().ensureActive(appUi);
        return appUi.entity.uiA.htmlElementG;
    }
    objectViewer() {
        let starter = this.getStarter();
        starter.createAppWithUI();
        starter.createdApp.appA.uiA.isWebsite = true;
        starter.createData();
        let pathString = starter.getPath();
        let listOfNames = ['..', starter.data.name, ...pathString.split('-')];
        starter.createdApp.appA.uiA.presentationModeA_contentData.listA.addByListOfNames(listOfNames);
        starter.theme();
        if (starter.isPublicWeb()) {
            starter.createdApp.appA.uiA.webMeta = starter.createUnboundWebMeta();
        }
        let appUi = starter.createdApp.appA.uiA.createAppUi();
        starter.checkTestMode();
        starter.getEnvironment().ensureActive(appUi);
        appUi.presentationModeA_contentUi.listA.elements[0].ensureExpanded();
        return appUi.entity.uiA.htmlElementG;
    }
    async testRun() {
        let starter = this.getStarter();
        await starter.run();
        if (starter.isPublicWeb()) {
            starter.createdApp.appA.uiA.webMeta = starter.createUnboundWebMeta();
        }
        let appUi = starter.createdApp.appA.uiA.createAppUi();
        starter.getEnvironment().ensureActive(appUi);
        return appUi.entity.uiA.htmlElementG;
    }
    website() {
        let starter = this.getStarter();
        starter.createAppWithUI();
        starter.createdApp.appA.uiA.isWebsite = true;
        starter.createData();
        starter.theme();
        let website = starter.data.listA.findByText(starter.hostname())
        let start = website.get('start');
        for (let resolved of start.listA.getResolvedList()) {
            starter.createdApp.appA.uiA.presentationModeA_contentData.listA.add(resolved);
        }
        if (starter.getEnvironment().setTitle)  {
            if (website.has('title')) {
                starter.getEnvironment().setTitle(website.get('title').text);
            }
        }
        starter.checkTestMode();
        if (starter.isPublicWeb()) {
            starter.createdApp.appA.uiA.webMeta = starter.createUnboundWebMeta();
        }
        let appUi = starter.createdApp.appA.uiA.createAppUi();
        starter.getEnvironment().ensureActive(appUi);
        let length = appUi.presentationModeA_contentUi.listA.elements.length;
        if (length === 1 || length === 2) {
            appUi.presentationModeA_contentUi.listA.elements[0].ensureExpanded();
        }
        return appUi.entity.uiA.htmlElementG;
    }

    localApp() {
        let starter = this.getStarter();
        starter.createAppWithUI();
        starter.theme('blackWhite');
        starter.checkTestMode();
        let appUi = starter.createdApp.appA.uiA.createAppUi(true, true);
        starter.getEnvironment().ensureActive(appUi);
        starter.getEnvironment().warningBeforeLossOfUnsavedChanges();
        starter.createdApp.appA.profileG.createProfile();
        appUi.focus(appUi.mainColumnUi);
        starter.playground();
        return appUi.entity.uiA.htmlElementG;
    }
    clientApp() {
        let starter = this.getStarter();
        starter.createAppWithUI();
        starter.theme('blackWhite');
        starter.checkTestMode();
        starter.createdApp.appA.uiA.webMeta = starter.createUnboundWebMeta(); // important
        let appUi = starter.createdApp.appA.uiA.createAppUi(true, true);
        starter.getEnvironment().ensureActive(appUi);
        starter.getEnvironment().warningBeforeLossOfUnsavedChanges();
        starter.createdApp.appA.profileG.createProfile();
        appUi.focus(appUi.mainColumnUi);
        return appUi.entity.uiA.htmlElementG;
    }
    getStarter() : StarterA {
        return this.entity.starterA;
    }
}