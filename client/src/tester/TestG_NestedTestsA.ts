import type {Entity} from "@/Entity";
import type {TestRunA} from "@/tester/TestRunA";

export class TestG_NestedTestsA {

    nestedTests : Entity;

    constructor(public entity : Entity) {
    }

    install() {
        this.nestedTests = this.entity.getApp().unboundG.createList();
    }

    add_withoutApp(name: string, jsFunction: (run: TestRunA) => void) : Entity {
        let nestedTest : Entity = this.entity.createCode(name, jsFunction);
        this.nestedTests.listA.addDirect(nestedTest);
        return nestedTest;
    }

    add(name: string, jsFunction: (run: TestRunA) => void) : Entity {
        return this.add_withoutApp(name, _run => {
           _run.app =  this.entity.getApp().createStarter().createApp_typed();
           jsFunction(_run);
        });
    }

    prepareApp(run : TestRunA) {
        run.app = this.entity.getApp().createStarter().createApp_typed();
    }

    addTestWithNestedTests_withoutApp(name: string, jsFunction : (run: TestRunA) => void, creator : ((nestedTestsA : TestG_NestedTestsA) => void)) {
        let test = this.add_withoutApp(name, jsFunction);
        test.testG_installNestedTestsA();
        test.installContainerA();
        creator(test.testG_nestedTestsA);
    }

    addTestWithNestedTests(name: string, jsFunction : (run: TestRunA) => void, creator : ((nestedTestsA : TestG_NestedTestsA) => void)) {
        this.addTestWithNestedTests_withoutApp(name, _run => {
            this.prepareApp(_run);
            jsFunction(_run);
        }, creator);
    }

    addNestedTests(name: string, creator : ((nestedTestsA : TestG_NestedTestsA) => void)) {
        this.addTestWithNestedTests_withoutApp(name, ()=>{}, creator);
    }
}