import {Entity} from "@/Entity";
import {assert} from "@/utils";
import {test_add} from "@/test/test";

export class AppA_TesterA {

    test: Entity;

    constructor(public entity : Entity) {
    }

    run() {
        let run = this.test.testG_run();
        this.entity.appA.uiA.mainColumnData.listA.addDirect(run);
    }

    createTestForSimpleSoftware() : Entity {
        let tester = this.entity;
        let test = tester.createCode('test', () => {});
        test.installContainerA();
        test.testG_installNestedTestsA();
        let tests = test.testG_nestedTestsA;
        if (tester.appA.environment.url.searchParams.has('withFailingDemoTest')) {
            tests.add_withoutApp('failingDemoTest', run => {
                assert(false);
            });
        }
        test_add(tests);
        return test;
    }
}