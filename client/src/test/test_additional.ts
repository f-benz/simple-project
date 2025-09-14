import {assert_sameAs, wait} from "@/utils";
import type {TestG_NestedTestsA} from "@/tester/TestG_NestedTestsA";

export function test_additional_add(tests : TestG_NestedTestsA) {
    tests.addNestedTests('additional', additional => {
        additional.addNestedTests('platform', platform => {
            platform.add('parseJsonString', run => {
                let json = JSON.parse('{"text":"bar"}');

                assert_sameAs(json.text, 'bar');
            });
            platform.add('nullAndUndefined', run => {
                assert_sameAs(undefined == null, true);
                assert_sameAs(undefined != null, false);
                assert_sameAs(undefined === null, false);
                assert_sameAs(undefined !== null, true);
                assert_sameAs(null ?? 42, 42);
            })
        });
        // additional.addNestedTests('slowTests', slowTests => {
        //     slowTests.add('wait', run => {
        //         let flag = false;
        //         setTimeout(() => {
        //             flag = true;
        //         }, 100);

        //         await wait(150);

        //         assert_sameAs(flag, true);
        //     });
        // })
    });
}