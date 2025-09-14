import {Entity} from "@/Entity";
import {AppA} from "@/AppA";
import {testData} from "@/testData";
import type {UiA_AppA} from "@/ui/UiA_AppA";

export class Environment {

    activeAppUi: UiA_AppA;
    jsonData : any;
    url : URL;
    setTitle: (text: string) => void;
    testCreator: (app: Entity) => Entity;

    static create() : Environment {
        let environment = new Environment();
        environment.url = new URL(window.location.toString());
        environment.adjustRemSizes();
        let placeholder_jsonString = 'marker-dr53hifhh4-website'; // note: placeholder_jsonString will be replaced during deployment
        if (placeholder_jsonString.startsWith('marker')) {
            environment.jsonData = testData;
        } else {
            environment.jsonData = JSON.parse(placeholder_jsonString);
        }
        environment.setTitle = text => {
            document.title = text;
        }
        environment.testCreator = (tester : Entity) => {
            return tester.appA.testerA.createTestForSimpleSoftware();
        };
        environment.create_installWindowKeyListener();
        document.body.style.margin = '0rem';
        document.body.style.overflowY = 'hidden'; // Chrome sometimes shows an unnecessary scrollbar, if not hidden
        environment.updateWindowHeight();
        window.addEventListener('resize', () => {
            environment.updateWindowHeight();
        });
        return environment;
    }

    updateWindowHeight() {
        document.body.style.height = window.innerHeight + 'px';
    }

    create_installWindowKeyListener() {
        let listener = (keyboardEvent : KeyboardEvent) => {
            if (this.activeAppUi) {
                this.activeAppUi.commandsA.keyboardEvent(keyboardEvent);
            }
        };
        window.onkeyup = listener;
        window.onkeydown = listener;
    }

    adjustRemSizes() {
        let root: HTMLElement = document.querySelector(':root');
        root.style.fontSize = '21px';
    }

    ensureActive(appUi: UiA_AppA) {
        if (appUi != this.activeAppUi) {
            let previous = this.activeAppUi?.focused;
            this.activeAppUi = appUi;
            if (previous) {
                previous.updateFocusStyle();
            }
            if (appUi.focused) {
                appUi.focused.updateFocusStyle();
            }
        }
    }

    createApp() : AppA {
        let app = new Entity();
        app.appA = new AppA(app);
        app.appA.environment = this;
        app.text = 'app (by environment)';
        return app.appA;
    }

    warningBeforeLossOfUnsavedChanges() {
        window.onbeforeunload = () => {
            return -1;
        };
    }

    noWarningBeforeLossOfUnsavedChanges() {
        window.onbeforeunload = undefined;
    }
}