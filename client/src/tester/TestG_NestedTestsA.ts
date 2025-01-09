import type {Entity} from "@/Entity";
import type {TestRunA} from "@/tester/TestRunA";

export class TestG_NestedTestsA {

    nestedTests : Entity;

    constructor(public entity : Entity) {
    }

    install() {
        this.nestedTests = this.entity.getApp().appA.unboundG.createList();
    }

    add_withoutApp(name: string, jsFunction: (run: TestRunA) => Promise<void>) : Entity {
        let nestedTest : Entity = this.entity.createCode(name, jsFunction);
        this.nestedTests.listA.addDirect(nestedTest);
        return nestedTest;
    }

    add(name: string, jsFunction: (run: TestRunA) => Promise<void>) : Entity {
        return this.add_withoutApp(name, async _run => {
           _run.app =  this.entity.getApp_typed().createStarter().createApp_typed();
           await jsFunction(_run);
        });
    }

    addUiTest(name: string, uiJsFunction: (uiRun: TestRunA) => Promise<void>) : Entity {
        return this.add_withoutApp(name, async run => {
            this.prepareUi(run);
            await uiJsFunction(run);
        });
    }

    prepareApp(run : TestRunA) {
        run.app = this.entity.getApp_typed().createStarter().createApp_typed();
    }

    prepareUi(run: TestRunA) {
        run.appUi = this.entity.getApp_typed().createStarter().createAppWithUI_typed();
        run.app = run.appUi.entity.getApp_typed();
    }

    addTestWithNestedTests_withoutApp(name: string, jsFunction : (run: TestRunA) => Promise<void>, creator : ((nestedTestsA : TestG_NestedTestsA) => void)) {
        let test = this.add_withoutApp(name, jsFunction);
        test.testG_installNestedTestsA();
        test.installContainerA();
        creator(test.testG_nestedTestsA);
    }

    addUiTestWithNestedTests(name: string, uiJsFunction: (uiRun: TestRunA) => Promise<void>, creator : ((nestedTestsA : TestG_NestedTestsA) => void)) {
        this.addTestWithNestedTests_withoutApp(name, async run => {
            this.prepareUi(run);
            await uiJsFunction(run);
        }, creator);
    }

    addTestWithNestedTests(name: string, jsFunction : (run: TestRunA) => Promise<void>, creator : ((nestedTestsA : TestG_NestedTestsA) => void)) {
        this.addTestWithNestedTests_withoutApp(name, async _run => {
            this.prepareApp(_run);
            await jsFunction(_run);
        }, creator);
    }

    addNestedTests(name: string, creator : ((nestedTestsA : TestG_NestedTestsA) => void)) {
        this.addTestWithNestedTests_withoutApp(name, async ()=>{}, creator);
    }
}