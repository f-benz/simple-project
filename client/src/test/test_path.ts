import type {TestG_NestedTestsA} from "@/tester/TestG_NestedTestsA";
import {Entity} from "@/Entity";
import {assert_sameAs} from "@/utils";
import type {PathA} from "@/PathA";

export function test_path_add(tests : TestG_NestedTestsA) {
    tests.addNestedTests('path', path => {
        path.addNestedTests('getPath', getPathTest => {
            getPathTest.add('ofContained', run => {
                let text = run.app.createText('');

                let path: PathA = run.app.entity.getPath(text);

                assert_sameAs(path.listOfNames.length, 1);
                assert_sameAs(path.listOfNames[0], text.name);
            });
            getPathTest.add('ofContainedOfContained', run => {
                let container = run.app.createText('container');
                container.installContainerA();
                let containedContained = container.containerA.createText('containedContained');

                let path : PathA = run.app.entity.getPath(containedContained);

                assert_sameAs(path.listOfNames.length, 2);
                assert_sameAs(path.listOfNames[0], container.name);
                assert_sameAs(path.listOfNames[1], containedContained.name);
            });
            getPathTest.add('ofContainer', run => {
                let text = run.app.createText('');

                let path: PathA = text.getPath(run.app.entity);

                assert_sameAs(path.listOfNames.length, 1);
                assert_sameAs(path.listOfNames[0], '..');
            });
            getPathTest.add('ofContainedOfContainedOfContainer', run => {
                let container = run.app.createText('container');
                container.installContainerA();
                let containedContained = container.containerA.createText('containedContained');
                let text = run.app.createText('foo');

                let path : PathA = text.getPath(containedContained);

                assert_sameAs(path.listOfNames.length, 3);
                assert_sameAs(path.listOfNames[0], '..');
                assert_sameAs(path.listOfNames[1], container.name);
                assert_sameAs(path.listOfNames[2], containedContained.name);
            });
            getPathTest.add('ofContainer-WhichHasAContainerItself', run => {
                let container = run.app.createText('container');
                container.installContainerA();
                let containedContained = container.containerA.createText('containedContained');
                let text = run.app.createText('foo');

                let path: PathA = containedContained.getPath(container);

                assert_sameAs(path.listOfNames.length, 1);
                assert_sameAs(path.listOfNames[0], '..');
            });
            getPathTest.add('fromInline', run => {
                let object = run.app.createEntityWithApp();
                let inline = run.app.createEntityWithApp();
                object.makeInline(inline);

                let path : PathA = inline.getPath(object);

                assert_sameAs(path.listOfNames.length, 0);
            });
        });
        path.addNestedTests('resolve', path_resolve => {
            path_resolve.add('direct', run => {
                let entity = run.app.createEntityWithApp();
                let path = run.app.direct(entity);

                let resolved = path.resolve();

                assert_sameAs(resolved, entity);
            });
            path_resolve.addTestWithNestedTests('listOfNames', run => {
                let container = run.app.createEntityWithApp();
                container.installContainerA();
                let contained = container.containerA.createBoundEntity();
                let path = container.getPath(contained);

                let resolved = path.resolve();

                assert_sameAs(resolved, contained);
            }, listOfNamesTests => {
                listOfNamesTests.add('containedOfContainer', run => {
                    let object: Entity = run.app.createText('bar');
                    let otherObject: Entity = run.app.createText('foo');
                    let pathOfOther: PathA = object.getPath(otherObject);

                    let resolved: Entity = pathOfOther.resolve();

                    assert_sameAs(resolved, otherObject);
                });
                listOfNamesTests.add('containedOfContainedOfContainer', run => {
                    let container = run.app.createText('container');
                    container.installContainerA();
                    let containedContained = container.containerA.createText('containedContained');
                    let text = run.app.createText('foo');
                    let path = text.getPath(containedContained);

                    let resolved: Entity = path.resolve();

                    assert_sameAs(resolved, containedContained);
                });
                listOfNamesTests.add('inline', run => {
                    let list = run.app.unboundG.createList();
                    let inline : Entity = run.app.createEntityWithApp();
                    list.makeInline(inline);
                    list.listA.addDirect(inline);

                    let resolved = inline.resolveListOfNames([]);

                    assert_sameAs(resolved, list);
                });
            });
        });
    });
}