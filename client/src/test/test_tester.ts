import type {TestG_NestedTestsA} from "@/tester/TestG_NestedTestsA";
import {Entity} from "@/Entity";
import {assert, assert_notSameAs, assert_sameAs, assertFalse} from "@/utils";

export function test_tester_add(tests : TestG_NestedTestsA) {
    tests.addNestedTests('tester', testerTests => {
        testerTests.addTestWithNestedTests('run', async run => {
            let name = 'testName';
            let test: Entity = run.app.entity.createCode(name, () => {
                // test
            });

            let testRun: Entity = await test.testG_run();

            assert(testRun.testRunA.resultG_success);
            assert_sameAs(testRun.testRunA.test, test);
        }, runTest => {
            runTest.addTestWithNestedTests('withNestedTest', async run => {
                let name = 'testName';
                let test: Entity = run.app.entity.createCode(name, () => {
                });
                test.testG_installNestedTestsA();
                let nestedTest = test.testG_nestedTestsA.add_withoutApp('nestedTest', async () => {
                });

                let testRun: Entity = await test.testG_run();

                assert(testRun.testRunA.resultG_success, 'testRun->success');
                assert_sameAs(testRun.testRunA.test, test);
                let nestedTestRun = testRun.testRunA.nestedRuns.listA.getResolved(0);
                assert(nestedTestRun.testRunA.resultG_success, 'nestedTestRun->success');
                assert_sameAs(nestedTestRun.testRunA.test, nestedTest);
            }, withNestedTest => {
                withNestedTest.add('failingNestedTest', async run => {
                    let test: Entity = run.app.entity.createCode('foo', () => {
                    });
                    test.testG_installNestedTestsA();
                    test.testG_nestedTestsA.add_withoutApp('nestedTest', async () => {
                        assert(false);
                    });

                    let testRun: Entity = await test.testG_run();

                    assertFalse(testRun.testRunA.resultG_success);
                    assertFalse(testRun.testRunA.nestedRuns.listA.getResolved(0).testRunA.resultG_success);
                });
                withNestedTest.add('runWithoutNestedTests', async run => {
                    let test: Entity = run.app.entity.createCode('foo', () => {
                    });
                    test.testG_installNestedTestsA();
                    test.testG_nestedTestsA.add_withoutApp('nestedTest', async () => {
                        assert(false);
                    });

                    let testRun: Entity = await test.testG_run(true);

                    assert(testRun.testRunA.resultG_success);
                    assert_sameAs(testRun.testRunA.nestedRuns, undefined);
                });
            });
            runTest.add('failing', async run => {
                let name = 'testName';
                let test: Entity = run.app.entity.createCode(name, (testRun: Entity) => {
                    assert(false);
                });

                let testRun: Entity = await test.testG_run();

                assertFalse(testRun.testRunA.resultG_success);
                assert_notSameAs(testRun.testRunA.resultG_error, undefined);
            });
        });
    });
}