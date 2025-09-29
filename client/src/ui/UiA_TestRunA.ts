import type {Entity} from "@/Entity";
import {UiA} from "@/ui/UiA";
import type {TestRunA} from "@/tester/TestRunA";
import {div, notNullUndefined} from "@/utils";

export class UiA_TestRunA {

    bodyContentUi: UiA;
    headerContent_htmlElement: HTMLElement;

    constructor(public entity : Entity) {
    }


    static install(uiA: UiA) {
        uiA.testRunA = new UiA_TestRunA(uiA.entity);
        uiA.testRunA.install();
    }

    install() {
        this.installHeaderContent();
        this.installBodyContent();
    }

    installHeaderContent() {
        this.headerContent_htmlElement = div();
        this.headerContent_htmlElement.innerText = this.header_getText();
        this.headerContent_htmlElement.style.color = this.getTestRun().resultG_success ?
            this.entity.getApp().uiA.theme.success : this.entity.getApp().uiA.theme.failure;
        let runInOwnWindow = document.createElement('a');
        runInOwnWindow.href = this.entity.getApp().environment.url.origin + '/?run=' + this.getPathString();
        runInOwnWindow.innerText = '[open]';
        runInOwnWindow.style.marginLeft = '0.6rem';
        runInOwnWindow.style.fontSize = '0.7rem';
        runInOwnWindow.style.color = this.entity.getApp().uiA.theme.buttonFontColor;
        runInOwnWindow.style.textDecoration = "none";
        this.headerContent_htmlElement.appendChild(runInOwnWindow);
    }

    installBodyContent() {
        let appA = this.entity.getApp();
        let bodyContent = appA.unboundG.createList();
        if (this.getTestRun().resultG_error) {
            let error = appA.unboundG.createCollapsible('failed with ' + this.getTestRun().resultG_error.message);
            if (this.getTestRun().resultG_error.stack) {
                error.listA.addDirect(
                    appA.unboundG.createTextWithList('stacktrace:',
                        appA.unboundG.createText(this.getTestRun().resultG_error.stack)));
            }
            bodyContent.listA.addDirect(error);
        }
        if (this.getObject().testRunA.app_uiA) {
            bodyContent.listA.addDirect(
                this.entity.getApp().unboundG.createCollapsible('ui', this.getObject().testRunA.app_uiA.entity));
        }
        if (this.getObject().testRunA.nestedRuns) {
            bodyContent.listA.addDirect(this.getObject().testRunA.nestedRuns);
        }
        this.bodyContentUi = this.entity.uiA.createSubUiFor(bodyContent);
    }

    getTestRun() : TestRunA {
        return this.getObject().testRunA;
    }

    getObject() : Entity {
        return this.entity.uiA.object;
    }

    getPathString() : string {
        return this.entity.getApp().entity.getPath(this.getTestRun().test).listOfNames.join('_');
    }

    header_getText() : string {
        return 'run: ' + this.getPathString();
    }

    hasBodyContent() : boolean {
        return notNullUndefined(this.getTestRun().resultG_error) ||
            notNullUndefined(this.getTestRun().nestedRuns) ||
            notNullUndefined(this.getTestRun().app_uiA);
    }
}