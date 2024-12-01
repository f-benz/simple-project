import {StarterA} from "@/StarterA";
import type {Entity} from "@/Entity";
import {UiA} from "@/ui/UiA";
import {assert, assert_sameAs} from "@/utils";

export class AppA_TestA_UiG {

    constructor(private entity: Entity) {
    }

    createTests() {
        return [
            this.createTest('ui_makeCollapsible', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                await app.appA.uiA.globalEventG.defaultAction();

                await app.appA.uiA.globalEventG.toggleCollapsible();

                return (await app.appA.uiA.content.listA.getResolved(0)).collapsible;
            }),
            this.createTest('ui_collapse', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                await app.appA.uiA.globalEventG.defaultAction();
                await app.appA.uiA.globalEventG.toggleCollapsible();
                await app.appA.uiA.globalEventG.newSubitem();
                let firstObjectUi = app.appA.uiA.content.uiA.listG.uisOfListItems.at(0);
                app.appA.uiA.focus(firstObjectUi);

                await app.appA.uiA.globalEventG.expandOrCollapse();

                return firstObjectUi.uiA.collapsed;
            }),
            this.createTest('ui_collapsible', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                let collapsible = app.appA.unboundG.createCollapsible('', app.appA.unboundG.createText(''));
                let ui = app.appA.uiA.createUiFor(collapsible);

                await collapsible.uis_update();

                return ui.uiA.collapsed;
            }),
            this.createTest('ui_collapsible_hybrid', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                let collapsible = app.appA.unboundG.createCollapsible('', app.appA.unboundG.createText(''));
                collapsible.uiA = new UiA(collapsible);

                await collapsible.updateUi();

                return collapsible.uiA.collapsed;
            }),
            this.createTest('ui_switchCurrentContainer', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI()
                await app.appA.uiA.globalEventG.defaultAction();

                await app.appA.uiA.globalEventG.switchCurrentContainer();

                return app.appA.currentContainer === app.appA.uiA.focused.uiA.object &&
                    app.appA.currentContainer.containerA;
            }),
            this.createTest('ui_cut', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                await app.appA.uiA.globalEventG.defaultAction();
                let objectUi = app.appA.uiA.focused;
                objectUi.uiA.textG.htmlElement.innerText = 'foo';

                await app.appA.uiA.globalEventG.cut();

                assert_sameAs(app.appA.uiA.content.listA.jsList.length, 0);
                assert_sameAs(app.appA.uiA.clipboard, objectUi.uiA.object);
                assert_sameAs(objectUi.uiA.object.text, 'foo');
            }),
            this.createTest('ui_createUiFor', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                let object = app.appA.unboundG.createText('');

                let ui : Entity = app.appA.uiA.createUiFor(object);

                return ui.uiA.object === object && object.uis.at(0) === ui.uiA;
            }),
            this.createTest('ui_list_extraObjectForUi', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                let listItem = app.appA.unboundG.createText('listItem');
                let list = app.appA.unboundG.createList(listItem);
                let uiForList : Entity = app.appA.uiA.createUiFor(list);

                await uiForList.uiA.update();

                return uiForList.uiA.listG.uisOfListItems.at(0).uiA.object === listItem
                    && uiForList.uiA.listG.uisOfListItems.at(0) != listItem;
            }),
            this.createTest('ui_pasteNext', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                let firstItem = app.appA.unboundG.createText('firstItem');
                let toPaste = app.appA.unboundG.createText('secondItem');
                let list = app.appA.unboundG.createList(firstItem);
                let uiForList : Entity = app.appA.uiA.createUiFor(list);
                await uiForList.uiA.update();
                app.appA.uiA.clipboard = toPaste;

                await uiForList.uiA.listG.pasteNextOnSubitem(uiForList.uiA.listG.uisOfListItems.at(0));

                return list.listA.jsList.at(1) === toPaste &&
                    uiForList.uiA.listG.uisOfListItems.at(1).uiA.object === toPaste &&
                    app.appA.uiA.focused.uiA.object === toPaste;
            }),
            this.createTest('ui_keyboardEvent_Enter', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                await app.appA.uiA.globalEventG.defaultAction();
                let firstObjectUi = app.appA.uiA.content.uiA.listG.uisOfListItems.at(0);
                firstObjectUi.uiA.textG.htmlElement.innerText = 'foo';
                let firstObject = firstObjectUi.getObject();
                await app.appA.uiA.keyG.keyboardEvent(new KeyboardEvent('keyup', {
                    key: 'Enter'
                }));
                assert_sameAs(firstObject.text, 'foo');
                assert(app.appA.uiA.content.listA.jsList.length === 2);
            })
        ]
    }

    private createTest(name: string, testAction: (test: Entity) => Promise<any>) {
        return this.entity.appA.testA.createTest(name, testAction);
    }
}