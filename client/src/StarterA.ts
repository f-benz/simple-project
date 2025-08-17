import {Entity} from "@/Entity";
import {AppA_UiA} from "@/ui/AppA_UiA";
import {AppA} from "@/AppA";
import {Environment} from "@/Environment";
import {getPathFromUrl, nullUndefined} from "@/utils";
import {StarterA_FullStartG} from "@/StarterA_FullStartG";
import {UiA_AppA_GlobalEventG} from "@/ui/UiA_AppA_GlobalEventG";
import {UiA_AppA} from "@/ui/UiA_AppA";
import {Theme} from "@/ui/Theme";
import type {ListA} from "@/ListA";

export class StarterA {

    fullStartG : StarterA_FullStartG;
    createdApp : Entity;
    data: Entity;
    nameThemeMap: Map<string, () => Theme>;

    constructor(public entity : Entity) {
        this.fullStartG = new StarterA_FullStartG(entity);
        this.nameThemeMap = new Map([
            ['elegant', () => {
                return Theme.elegant();
            }],
            ['simple', () => {
                return Theme.simple();
            }],
            ['blackWhite', () => {
                return Theme.blackWhite();
            }],
            ['dark', () => {
                return Theme.dark();
            }],
            ['darkColorful', () => {
                return Theme.darkColorful();
            }]
        ]);
    }

    async fullStart() : Promise<HTMLElement> {
        if (this.getEnvironment().url.searchParams.has('client-app')) {
            return this.fullStartG.clientApp();
        } else if (this.getEnvironment().url.searchParams.has('tester')) {
            return this.fullStartG.tester();
        } else if (this.getPath()) {
            return this.fullStartG.objectViewer();
        } else if (this.getEnvironment().url.searchParams.has('run')) {
            return this.fullStartG.testRun();
        } else {
            if (this.isPublicWeb()) {
                return this.fullStartG.website();
            } else {
                return this.fullStartG.localApp();
            }
        }
    }

    getPath() : string {
        return getPathFromUrl(this.getEnvironment().url);
    }

    isPublicWeb() {
        if (nullUndefined(this.hostname())) {
            return false;
        } else {
            return this.hostname() != 'localhost';
        }
    }

    async run() : Promise<Entity> {
        this.createTester(this.getEnvironment().testCreator)
        let queryParams = this.getEnvironment().url.searchParams;
        let pathParam : string = queryParams.get('run');
        let run : Entity = await this.createdApp.resolveListOfNames(pathParam.split('_')).testG_run(!queryParams.has('withNest'));
        this.createdApp.appA.uiA.mainColumnData.listA.jsList.push(this.createdApp.appA.direct(run));
        return this.createdApp;
    }

    getEnvironment() : Environment {
        return this.entity.getApp().environment;
    }

    checkTestMode() {
        if (this.getEnvironment().url.searchParams.has('testMode')) {
            this.createdApp.appA.logG.toConsole = true;
        }
    }

    createApp() : Entity {
        this.createdApp = new Entity();
        this.createdApp.text = 'simple application';
        this.createdApp.appA = new AppA(this.createdApp);
        this.createdApp.appA.environment =  this.entity.getApp().environment;
        return this.createdApp;
    }

    createApp_typed() : AppA {
        return this.createApp().appA;
    }

    createAppWithUI() : Entity {
        this.createApp();
        this.createdApp.appA.uiA = new AppA_UiA(this.createdApp);
        return this.createdApp;
    }

    createAppWithUI_typed() : AppA_UiA {
        return this.createAppWithUI().appA.uiA;
    }

    // createAppWithUIWithCommands_editable_updateUi() : Entity {
    //     this.createAppWithUIWithCommands_editable();
    //     this.createdApp.uiA.update();
    //     return this.createdApp;
    // }
    //
    //
    // createAppWithUIWithCommands_editable() : Entity {
    //     this.createAppWithUI();
    //     this.createdApp.uiA.editable = true;
    //     this.createdApp.appA.uiA.showMeta = true;
    //     this.createdApp.appA.uiA.commands = this.createdApp.appA.uiA.createCommands();
    //     this.createdApp.appA.uiA.commands.uiA = new UiA(this.createdApp.appA.uiA.commands);
    //     return this.createdApp;
    // }

    createTester(testCreator: (app: Entity) => Entity) : Entity {
        this.createAppWithUI();
        this.createdApp.appA.installTesterA();
        this.createdApp.appA.testerA.test = testCreator(this.createdApp);
        return this.createdApp;
    }

    hostname() : string {
        if (this.getEnvironment().url.hostname === 'localhost') {
            if (this.getEnvironment().url.searchParams?.has('virtualHostname')) {
                return this.getEnvironment().url.searchParams.get('virtualHostname');
            } else {
                return 'localhost';
            }
        } else {
            return this.getEnvironment().url.hostname;
        }
    }

    createData() {
        this.data = this.createdApp.appA.unboundG.createFromJson(this.getEnvironment().jsonData);
        this.createdApp.containerA.bind(this.data, 'data');
    }

    // TODO
    createUnboundWebMeta() : Entity {
        let unboundData = this.createdApp.appA.unboundG.createFromJson(this.getEnvironment().jsonData);
        let unboundWebMeta = unboundData.listA.getResolved(0).get('webMeta');
        return unboundWebMeta;
    }

    theme(defaultTheme? : string) {
        let themeName : string;
        if (this.getEnvironment().url.searchParams.has('theme')) {
            themeName = this.getEnvironment().url.searchParams.get('theme');
        } else {
            if (defaultTheme) {
                themeName = defaultTheme;
            } else {
                themeName = 'simple';
            }
        }
        this.createdApp.appA.uiA.theme = this.nameThemeMap.get(themeName).call(null);
    }

    playground() {
        if (this.getEnvironment().url.searchParams.has('playground')) {
            let app = this.createdApp.appA;
            let object = app.createText('object');
            app.uiA.mainColumnData.listA.add(object);
            object.set('aPropertyName', app.createText('aValue'));
            let plainList : ListA = app.createList().listA;
            object.set('drinks', plainList.entity);
            app.uiA.mainColumnData.uis_update();
        }
    }
}