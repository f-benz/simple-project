import type {Entity} from "@/Entity";
import {Environment} from "@/Environment";
import {testData} from "@/testData";
import {assert, localhostWithQueryParams} from "@/utils";
import type {TestRunA} from "@/test/TestRunA";

export class AppA_TestA_ModelG {

    constructor(private entity: Entity) {
    }

    createTests() {
        return [
            this.createTest('modelTest_objectCreation', async test => {
                test.test_app = await this.entity.appA.createStarter().createAppWithUIWithCommands_editable_updateUi();

                return test.test_app.uiA.getRawText().includes('default action');
            }),
            this.createTest('modelTest_newSubitem', async test => {
                let app = await this.entity.appA.createStarter().createAppWithUIWithCommands_editable_updateUi();
                await app.updateUi();
                await app.appA.uiA.globalEventG.defaultAction();

                await app.uiA.click('new subitem');

                let firstObject = await app.appA.uiA.content.listA.getResolved(0);
                return firstObject.listA.jsList.length == 1;
            }),
            this.createTest('modelTest_makeCollapsible', async test => {
                let app = await this.entity.appA.createStarter().createAppWithUIWithCommands_editable_updateUi();
                await app.appA.uiA.globalEventG.defaultAction();

                await app.uiA.click('toggle collapsible');

                return (await app.appA.uiA.content.listA.getResolved(0)).collapsible;
            }),
            this.createTest('modelTest_collapsed', async test => {
                let app = await this.entity.appA.createStarter().createAppWithUIWithCommands_editable_updateUi();
                await app.appA.uiA.globalEventG.defaultAction();
                await app.appA.uiA.globalEventG.newSubitem();
                let firstObjectUi : Entity = app.appA.uiA.content.uiA.listG.uisOfListItems.at(0);
                let firstObject = firstObjectUi.uiA.object;
                (await firstObject.listA.getResolved(0)).text = 'do-not-show-me';
                firstObject.collapsible = true;
                await firstObjectUi.uiA.update();

                let rawText = app.uiA.getRawText();

                return !rawText.includes('do-not-show-me');
            }),
            this.createTest('modelTest_click_nonEditableText', async test => {
                let app = await this.entity.appA.createStarter().createAppWithUIWithCommands_editable_updateUi();
                await app.appA.uiA.globalEventG.defaultAction();
                await app.appA.uiA.globalEventG.newSubitem();
                let firstObjectUi = app.appA.uiA.content.uiA.listG.uisOfListItems.at(0);
                let firstObject = firstObjectUi.uiA.object;
                firstObject.text = 'clickMe';
                firstObject.editable = false;
                firstObject.collapsible = true;
                await firstObjectUi.uiA.update();

                await app.uiA.click('clickMe');

                return app.appA.uiA.content.uiA.listG.uisOfListItems[0].uiA.collapsed === false;
            }),
            this.createTest('modelTest_tester', async test => {
                let tester = await this.entity.appA.createStarter().createTest();
                test.test_app = tester;
                tester.appA.logG.toListOfStrings = true;

                await tester.appA.testA.runAndDisplay([
                    tester.appA.testA.createFailingDemoTest(),
                    tester.appA.testA.createTest('aSuccessfulTest', async () => {
                        return true;
                    })
                ]);

                await tester.uiA.click('failed with');
                await tester.uiA.click('ui');
                await tester.uiA.click('log');
                await tester.uiA.click('successful tests')
                let rawText = tester.uiA.getRawText();
                return rawText.includes('failed tests') &&
                    rawText.includes('failing demo test') &&
                    rawText.includes('stacktrace') &&
                    rawText.includes('demo error in test') &&
                    rawText.includes('a dummy log') &&
                    rawText.includes('default action') &&
                    rawText.includes('successful tests') &&
                    rawText.includes('aSuccessfulTest');
            }),
            this.createTest('modelTest_tester2', async outerTest => {
                let testCreator : (app : Entity) => Entity = (app : Entity) => {
                    let test = app.createCode('appTest', (run : Entity) =>  {});
                    return test;
                };
                let tester : Entity = this.entity.appA.createStarter().createTester2(testCreator);
                outerTest.test_app = tester;
                tester.appA.logG.toListOfStrings = true;
                await tester.appA.testerA.run();
                await tester.uiA.update();
                assert(tester.uiA.getRawText().includes('appTest'));
            }),
            this.createTest('modelTest_website', async test => {
                let environment = new Environment();
                environment.jsonData = testData;
                environment.url = new URL('https://testdomain1.org');
                let settedTitle : string;
                environment.setTitle = (text) => {
                    settedTitle = text;
                }

                let website = await environment.createApp().appA.createStarter().createWebsite();

                test.test_app = website;
                website.appA.logG.toListOfStrings = true;
                await website.uiA.update();
                let rawText = website.uiA.getRawText();
                test.test_app.log('setted title = ' + settedTitle);
                test.test_app.log('rawText = ' + rawText);
                return !rawText.includes('demo website (container)') &&
                    !rawText.includes('testdomain1.org') &&
                    !rawText.includes('start') &&
                    rawText.includes('collapsible parent') &&
                    rawText.includes('subitem') &&
                    rawText.includes('Home') &&
                    settedTitle === 'demo title';
            }),
            this.createTest('modelTest_website_virtualHostname', async test => {
                let environment = new Environment();
                environment.jsonData = testData;
                environment.url = new URL('http://localhost:1234/?virtualHostname=testdomain2.org');

                let website = await environment.createApp().appA.createStarter().createWebsite();

                test.test_app = website;
                website.appA.logG.toListOfStrings = true;
                await website.uiA.update();
                let rawText = website.uiA.getRawText();
                test.test_app.log('rawText = ' + rawText);
                return rawText.includes('testwebsite2');
            }),
            this.createTest('modelTest_objectViewer', async test => {
                let environment = new Environment();
                environment.jsonData = testData;
                let objectViewer = await environment.createApp().appA.createStarter().createObjectViewer('2'); // see const testData
                test.test_app = objectViewer;
                objectViewer.appA.logG.toListOfStrings = true;
                let rawText = objectViewer.uiA.getRawText();
                test.test_app.log(rawText);
                return rawText === 'collapsible parentsubitem' && test.test_app.uiA.countEditableTexts() === 0;
            }),
            this.createTest('modelTest_pasteNext', async test => {
                let app = await this.entity.appA.createStarter().createAppWithUIWithCommands_editable_updateUi();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                await app.appA.uiA.globalEventG.defaultAction();
                let firstObject = await app.appA.uiA.content.listA.getResolved(0);
                firstObject.text = 'first object';
                app.appA.uiA.clipboard = await app.appA.createText('pasted object');
                await app.uiA.click('paste next');

                let rawText = app.uiA.getRawText();
                app.log('rawText = ' + rawText);
                return rawText.includes('pasted object');
            }),
            this.createTest('modelTest_extraUiForText', async test => {
                let app = this.entity.appA.createStarter().createAppWithUI();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                let object = app.appA.unboundG.createText('foo');
                let ui : Entity = app.appA.uiA.createUiFor(object);
                await object.uis_update();

                let rawText = ui.uiA.getRawText();

                app.log('raw text = ' + rawText);
                return rawText === 'foo';
            }),
            this.createTest('modelTest_webMeta', async test => {
                let environment = new Environment();
                environment.jsonData = testData;
                let starter = environment.createApp().appA.createStarter();
                let app = starter.createAppWithUI();
                test.test_app = app;
                app.appA.logG.toListOfStrings = true;
                app.appA.uiA.webMeta = await starter.createUnboundWebMeta();
                await app.appA.uiA.globalEventG.newSubitem();
                (await app.appA.uiA.content.listA.getResolved(0)).text = 'foo';
                app.appA.uiA.withPlaceholderArea = true;
                await app.updateUi()
                let rawText = app.uiA.getRawText();
                test.test_app.log(rawText);
                return rawText === 'foosome meta information';
            }),
            this.createTest('modelTest_testRun', async outerTest => {
                let app : Entity = this.entity.appA.createStarter().createAppWithUI();
                let name = 'testName';
                let test : Entity = app.createCode(name, (testRun : TestRunA) => {
                    testRun.appUi = app.appA.createStarter().createAppWithUIWithCommands_editable().appA.uiA;
                    assert(false);
                });
                let testRun : Entity = await test.testG_run();

                let ui : Entity = app.appA.uiA.createUiFor(testRun);
                await ui.uiA.update();
                await ui.uiA.click('ui');
                let rawText = ui.uiA.getRawText();

                assert(rawText.includes(name));
                assert(rawText.includes('AssertionError'));
                assert(rawText.includes('default action'), 'includes default action');
            }),
            this.createTest('modelTest_testRun_withFailingNestedTest', async outerTest => {
                let app : Entity = this.entity.appA.createStarter().createAppWithUI();
                let name = 'foo';
                let test : Entity = app.createCode(name, (testRun : Entity) => {
                });
                test.testG_installNestedTestsA();
                test.testG_nestedTestsA.add_withoutApp('nestedTest', () => {
                    assert(false);
                });
                let testRun : Entity = await test.testG_run();

                let ui : Entity = app.appA.uiA.createUiFor(testRun);
                await ui.uiA.update();
                let rawText = ui.uiA.getRawText();

                assert(rawText.includes('nestedTest'));
                assert(rawText.includes('AssertionError'));
            }),
            this.createTest('modelTest_fullStart_tester2', async test => {
                let environment = new Environment();
                environment.url = localhostWithQueryParams('tester2');
                environment.jsonData = testData;
                environment.testCreator = (app : Entity) => {
                    return app.createCode('aTestTest', (run : Entity) =>  {});
                };
                let starter = environment.createApp().appA.createStarter();

                await starter.fullStart();

                let rawText = starter.createdApp.uiA.getRawText();
                assert(rawText.includes('aTestTest'));
            }),
            this.createTest('modelTest_runInOwnWindow', async (test : Entity) => {
                let environment = new Environment();
                environment.url = localhostWithQueryParams('run=isolatedRun');
                environment.testCreator = (app : Entity) => {
                    return app.createCode('isolatedRun', (run : Entity) => {});
                }
                test.test_app  = environment.createApp();
                test.test_app.appA.logG.toListOfStrings = true;
                let starterA = test.test_app.appA.createStarter();

                await starterA.fullStart();

                await starterA.createdApp.uiA.update();
                let rawText = starterA.createdApp.uiA.getRawText();
                test.test_app.log('rawText = ' + rawText);
                assert(rawText.includes('isolatedRun'));
            }),
        ];
    }

    private createTest(name: string, testAction: (test: Entity) => Promise<any>) {
        return this.entity.appA.testA.createTest(name, testAction);
    }
}