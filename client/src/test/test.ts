import type {TestG_NestedTestsA} from "@/tester/TestG_NestedTestsA";
import {test_tester_add} from "@/test/test_tester";
import {
    assert,
    assert_notSameAs,
    assert_sameAs,
    assertFalse,
    createRandomString,
    getPathFromUrl,
    notNullUndefined,
    nullUndefined
} from "@/utils";
import {Entity} from "@/Entity";
import {testData} from "@/testData";
import {Environment} from "@/Environment";
import {StarterA} from "@/StarterA";
import {test_path_add} from "@/test/test_path";
import {test_additional_add} from "@/test/test_additional";
import {RelationshipA} from "@/RelationshipA";
import { Redirect } from "@/Redirect";

export function test_add(tests : TestG_NestedTestsA) {
    test_tester_add(tests);
    test_path_add(tests);
    tests.add('dependencies', run => {
        let object = run.app.createList();
        let dependency = run.app.createList();
        let dependencyOfDependency = run.app.createText('dependencyOfDependency');
        object.listA.add(dependency);
        dependency.listA.add(dependencyOfDependency);
        let context = run.app.createText('context');
        object.context = object.getPath(context);
        let propertyValue = run.app.createText('value');
        object.set('propName', propertyValue);

        let dependencies = object.getDependencies();

        assert(dependencies.has(dependency), 'has dependency');
        assert(dependencies.has(dependencyOfDependency));
        assert(dependencies.has(context));
        assert(dependencies.has(propertyValue));
        assert_sameAs(dependencies.size, 5);
    });
    tests.add('shallowCopy', run => {
        let object = run.app.createList();
        object.text = 'foo';
        object.collapsible = true;
        let dependency = run.app.createList();
        object.listA.add(dependency);

        let copy : Entity = object.shallowCopy();

        assert_sameAs(copy.listA.getResolved(0), dependency);
        assert_sameAs(copy.text, object.text);
        assert_sameAs(copy.collapsible, object.collapsible);
    });
    tests.addTestWithNestedTests('deepCopy', run => {
        let object = run.app.createList();
        let targetContainer = run.app.createBoundEntity();
        targetContainer.installContainerA();
        object.text = 'foo';
        object.collapsible = true;
        let dependency = run.app.createText('dependency');
        object.listA.add(dependency);
        object.context = object.getPath(run.app.createText('dummyContext'));
        let dependencyWithContext = run.app.createText('dependency with context');
        object.listA.add(dependencyWithContext);
        dependencyWithContext.context = dependencyWithContext.getPath(object);

        let copy : Entity = object.deepCopy(targetContainer.containerA).run();

        assert_sameAs(copy.text, object.text);
        assert_sameAs(copy.collapsible, object.collapsible);
        assert_sameAs(copy.context, undefined);
        assert_sameAs((copy.listA.getResolved(0)).text, 'dependency');
        assert_notSameAs(copy.listA.getResolved(0), dependency);
        assert_sameAs((copy.listA.getResolved(1)).context.resolve(), copy);
        assert_sameAs(copy.container, targetContainer);
    }, deepCopyTests => {
        deepCopyTests.add('property', run => {
           let property = run.app.createText('testProperty');
           property.installRelationshipA();
           property.relationshipA.to = property.getPath(run.app.createText('testValue'));

           let copy : Entity = property.deepCopy(run.app.entity.containerA).run();

           assert_notSameAs(undefined, copy.relationshipA);
           assert_sameAs(copy.text, 'testProperty');
           assert_sameAs(copy.relationshipA.to.resolve().text, 'testValue');
        });
    });
    tests.add('createBoundEntity', run => {
        let entity = run.app.createBoundEntity();

        assert_sameAs(run.app.entity.getPath(entity).listOfNames[0], entity.name);
        assert_sameAs(run.app.entity, entity.container);
    });
    tests.add('createFromOldJson', run => {
        let json = {
            "rootObject":"AHouse-0",
            "objects":[
                {
                    "id":"AHouse-0",
                    "details":["AHouse-567", "AnotherHouse-789"],
                    "properties":{
                        "context":"AHouse-345",
                        "text":"foo bar",
                        "defaultExpanded":true
                    }
                },
                {
                    "id":"AHouse-567",
                    "properties":{
                        "text":"foo bar",
                        "defaultExpanded":false
                    }
                }
            ]
        };

        let container = run.app.unboundG.createFromOldJson(json);

        assert_sameAs(container.containerA.mapNameEntity.size, 2);
        assert_sameAs(container.listA.jsList.length, 1);
        let root : Entity = container.listA.getResolved(0);
        assert_sameAs(root.text, 'foo bar');
        assert_sameAs(root.name, '0');
        assert_sameAs(root.context.listOfNames[0], '..');
        assert_sameAs(root.context.listOfNames[1], '345');
        assert_sameAs(root.collapsible, false);
        assert_sameAs(root.listA.jsList.length, 2);
        assert_sameAs(root.listA.jsList[0].listOfNames[0], '..');
        assert_sameAs(root.listA.jsList[0].listOfNames[1], '567');
        assert_sameAs(root.listA.jsList[1].listOfNames[0], '..');
        assert_sameAs(root.listA.jsList[1].listOfNames[1], '..');
        assert_sameAs(root.listA.jsList[1].listOfNames[2], 'AnotherHouse');
        assert_sameAs(root.listA.jsList[1].listOfNames[3], '789');
    });
    tests.add('export', run => {
        let container = run.app.unboundG.createTextWithList('the container');
        container.installContainerA();
        let subitemAndContained = container.containerA.createText('subitem + contained');
        container.listA.add(subitemAndContained);

        let exported = container.export();

        run.app.entity.log('exported: ' + JSON.stringify(exported, null, 4));
        assert_sameAs(exported.text, 'the container');
        assert_sameAs(exported.list.length, 1);
        assert_sameAs(exported.objects[exported.list[0][0].toString()].text, 'subitem + contained');
    });
    tests.add('jsonWithoutContainedObjects', run => {
        let object = run.app.unboundG.createTextWithList('prop');
        object.context = run.app.createPath(['aName'], object);
        object.installRelationshipA();

        let json = object.json_withoutContainedObjects();

        run.app.entity.log('json: ' + JSON.stringify(json, null, 4));
        assert_sameAs(json.text, 'prop');
        assert_sameAs(json.context[0], 'aName');
        assert_sameAs(json.to, null);
    });
    tests.addTestWithNestedTests('createFromJson', run => {
        let json : any = {
            text: 'container + parent',
            list: [
                ['0'],
                ['1'],
                {
                    text: 'inline',
                    to: null
                }
            ],
            objects: {'0': {
                    text: 'contained + subitem',
                    context: ['..']
                },
                '1': {
                    text: 'propertyName',
                    to: ['..','2']
                },
                '2': {
                    text: 'valueObject'
                }
            }
        };

        let container = run.app.unboundG.createFromJson(json);

        let containedAndSub = container.listA.getResolved(0);
        assert_sameAs(container.text, 'container + parent');
        assert_sameAs(containedAndSub.text, 'contained + subitem');
        assert_sameAs(containedAndSub.container, container);
        assert_sameAs(containedAndSub.name, container.containerA.mapNameEntity.keys().next().value);
        assert_sameAs(containedAndSub.context.resolve(), container);
        assert(notNullUndefined(container.listA.jsList[0]));
        assert(container.has('propertyName'));
        assert_sameAs(container.get('propertyName').text, 'valueObject');
        let inline = container.listA.getResolved(2);
        assert(inline.inline);
        assert_sameAs(inline.text, 'inline');
        assert_sameAs(inline.context.resolve(), container);
        assert(notNullUndefined(inline.relationshipA));
    }, createFromJson => {
        createFromJson.add('testData', run => {
            let container = run.app.unboundG.createFromJson(testData);

            assert_sameAs(container.text, 'demo website (container)');
        });
    });
    tests.addTestWithNestedTests('list', run => {
        let list : Entity = run.app.unboundG.createList();

        assert_notSameAs(list.listA, undefined);
        assert_notSameAs(list.listA.jsList, undefined);
        assert_sameAs(list.getShortDescription(), 'list (0)');
    }, list => {
        list.add('findByText', run => {
            let list : Entity = run.app.unboundG.createList();
            let subitem = run.app.unboundG.createText('findMe');
            list.listA.addDirect(subitem);

            let found = list.listA.findByText('findMe');

            assert_sameAs(found, subitem);
        });
        list.add('insertPathAtPosition', run => {
            let list : Entity = run.app.createList();
            let listItem : Entity = run.app.unboundG.createText('subitem');

            list.listA.insertPathAtPosition(run.app.direct(listItem), 0);

            assert_sameAs(list.listA.jsList[0].resolve(), listItem);
        });
        list.add('insertObjectAtPosition', run => {
            let list : Entity = run.app.createList();
            let listItem : Entity = run.app.createText('subitem');

            list.listA.insertObjectAtPosition(listItem, 0);

            assert_sameAs(list.listA.getResolved(0), listItem);
        });
        list.add('jsonWithoutContainedObjects', run => {
            let list = run.app.createList();
            let item = run.app.createText('bar');
            list.listA.add(item);

            let json : any = list.json_withoutContainedObjects();

            assert_sameAs(json.list.length, 1);
            assert_sameAs(json.list[0][1], item.name);
        });
    });
    tests.add('log', run => {
        run.app.logG.toListOfStrings = true;
        let object = run.app.createText('foo');

        object.log('Good morning!');

        assert_sameAs(run.app.logG.listOfStrings.join(), 'foo /// Good morning!');
    });
    tests.add('shortDescription', run => {
        let text : Entity = run.app.unboundG.createText('1234567890'.repeat(3));

        let shortDescription = text.getShortDescription();

        assert_sameAs(shortDescription, '12345678901234567890');
    });
    tests.add('createAppFromEnvironment', run => {
        let environment = new Environment();

        let app = environment.createApp();

        assert_sameAs(app.environment, environment);
    });
    tests.add('createStarter', test => {
        let starterApplication = new Environment().createApp();

        let starter : StarterA = starterApplication.createStarter();

        assert(notNullUndefined(starter));
        assert_sameAs(starter.entity.getApp(), starterApplication);
    });
    tests.addNestedTests('util', utilTests => {
        utilTests.add('randomString', run => {
            assert_sameAs(createRandomString().length, 10);
            assert_notSameAs(createRandomString(), createRandomString());
        });
        utilTests.add('nullUndefined', run => {
            assert(nullUndefined(null));
            assert(nullUndefined(undefined));
            assert(!nullUndefined(42));
            assert(notNullUndefined(42));
        });
        utilTests.addTestWithNestedTests('assert', run => {
            try {
                assert(false);
            } catch (throwable) {
                let error = throwable as Error;
                assert_sameAs(error.message, 'AssertionError: condition must be fulfilled');
                return;
            }
            throw new Error();
        }, assertTests => {
            assertTests.add('sameAs', run => {
                try {
                    assert_sameAs(42, 43);
                } catch (throwable) {
                    let error = throwable as Error;
                    if (error.message !== 'AssertionError: 42 !== 43') {
                        throw new Error();
                    }
                    return;
                }
                throw new Error();
            });
            assertTests.add('notSameAs', run => {
                try {
                    assert_notSameAs(42, 42);
                } catch (throwable) {
                    let error = throwable as Error;
                    if (error.message !== 'AssertionError: 42 === 42') {
                        throw new Error();
                    }
                    return;
                }
                throw new Error();
            });
        });
    });
    tests.add('code', run => {
        let name = 'nameOfCode';
        let jsFunction = () => {
            // do something
        };

        let code : Entity = run.app.entity.createCode(name, jsFunction);

        assert_sameAs(run.app.entity.containerA.mapNameEntity.get(name), code);
        assert_sameAs(code.codeG_jsFunction, jsFunction);
    });
    tests.add('getUrl', run => {
        let container = run.app.createBoundEntity();
        container.installContainerA();
        container.set('fixedUrl', run.app.createText('https://testdomain6.org'));
        let subContainer = container.containerA.createBoundEntity('foo');
        subContainer.installContainerA();
        let object = subContainer.containerA.createBoundEntity('testName');

        let url = object.getUrl();

        assert_sameAs(url, 'https://testdomain6.org/foo/testName');
    });
    tests.add('delete', run => {
        let container = run.app.createText('container');
        container.installContainerA();
        let object = container.containerA.createText('willBeDeleted');
        object.installListA();
        object.installContainerA();

        object.delete();

        assert_sameAs(container.containerA.mapNameEntity.size, 0);
        assert_sameAs(object.containerA, undefined);
        assert_sameAs(object.listA, undefined);
        assert_sameAs(object.text, undefined);
        assert_sameAs(object.name, undefined);
        assert_sameAs(object.container, undefined);
        assert_sameAs(object.app, run.app.entity);
    });
    tests.addTestWithNestedTests('shakeTree', run => {
        let container = run.app.createText('container');
        container.installContainerA();
        container.containerA.createText('will be removed');
        container.installListA();
        let subitemAndContainer = container.containerA.createText('subitem and container');
        container.listA.add(subitemAndContainer);
        subitemAndContainer.installContainerA();
        subitemAndContainer.containerA.createText('will also be removed');
        let containendContained = subitemAndContainer.containerA.createText('contained contained');
        container.listA.add(containendContained);
        let standaloneContainer = container.containerA.createText('standalone container');
        standaloneContainer.installContainerA();

        container.containerA.shakeTree();

        assert(container.containerA.mapNameEntity.has(standaloneContainer.name));
        assert_sameAs(container.containerA.mapNameEntity.size, 2);
        assert_sameAs(subitemAndContainer.containerA.mapNameEntity.size, 1);
    }, shakeTreeTests => {
        shakeTreeTests.add('withMultipleRoots', run => {
            let container = run.app.createText('container');
            container.installContainerA();
            let secondRoot = container.containerA.createText('secondRoot');

            run.app.shakeTree_withMultipleRoots([container, secondRoot], container.containerA);

            assert_sameAs(container.containerA.mapNameEntity.values().next().value, secondRoot);
        });
    });
    tests.addNestedTests('container', containerTests => {
        containerTests.add('countWithNestedEntities', run => {
            let container = run.app.createText('container');
            container.installContainerA();
            let nestedContainer = container.containerA.createText('nested');
            nestedContainer.installContainerA();
            nestedContainer.containerA.createText('nestedNested');
            nestedContainer.containerA.createText('nestedNested2');

            let count = container.containerA.countWithNestedEntities();

            assert_sameAs(count, 3);
        });
    });
    tests.addTestWithNestedTests('pathInUrl', run => {
        let url = new URL('https://einfaches-web.org/test/foo/?dummyParam');

        let path = getPathFromUrl(url);

        assert_sameAs(path, 'test_foo');
    }, pathInUrlTests => {
        pathInUrlTests.add('empty', run => {
            let url = new URL('https://einfaches-web.org?dummyParam');

            let path = getPathFromUrl(url);

            assert_sameAs(path, '');
        });
        pathInUrlTests.add('index.html', run => {
            let url = new URL('https://einfaches-web.org/index.html');

            let path = getPathFromUrl(url);

            assert_sameAs(path, '');
        });
    });
    tests.addTestWithNestedTests('property', run => {
        let propertyName = 'aPropertyName';
        let entity = run.app.createBoundEntity();
        let value = run.app.createBoundEntity();
        value.text = 'theValue';

        entity.set(propertyName, value);

        assert_sameAs(value, entity.get(propertyName));
    }, propertyTests => {
        propertyTests.add('setMultipleTimes', run => {
            let propertyName = 'foo';
            let entity = run.app.createBoundEntity();
            let value = run.app.createBoundEntity();
            value.text = 'theValue';

            entity.set(propertyName, value);
            entity.set(propertyName, value);

            assert_sameAs(entity.listA.jsList.length, 1);
        });
        propertyTests.add('otherSubWithSameText', run => {
            let propertyName = 'foo';
            let entity = run.app.createBoundEntity();
            let otherSub = run.app.unboundG.createText(propertyName);
            entity.installListA();
            entity.listA.addDirect(otherSub);
            let value = run.app.createBoundEntity();
            value.text = 'theValue';

            entity.set(propertyName, value);

            assert_sameAs(entity.listA.jsList.length, 2);
            assert_sameAs(entity.get(propertyName), value);
        });
    });
    tests.add('contains', run => {
        let container = run.app.createEntityWithApp();
        container.installContainerA();
        let contained = container.containerA.createBoundEntity();
        contained.installContainerA();
        let containedContained = contained.containerA.createBoundEntity();

        assert(container.contains(containedContained));
        assertFalse(container.contains(run.app.createEntityWithApp()));
    });
    tests.addTestWithNestedTests('redirect', run => {
        let redirect = new Redirect();
        redirect.url = new URL('http://www.example.com/foo/bar?a=b');

        let newUrl = redirect.getNewUrl();

        assert_sameAs('https://example.com/foo/bar?a=b', newUrl);
    }, redirectTests => {
        redirectTests.add('unsecureProtocoll', run => {
            let redirect = new Redirect();
            redirect.url = new URL('http://example.com');

            let newUrl = redirect.getNewUrl();

            assert(redirect.shouldRedirect());
            assert_sameAs('https://example.com', newUrl);
        });
        redirectTests.add('removeWWW', run => {
            let redirect = new Redirect();
            redirect.url = new URL('https://www.example.com');

            let newUrl = redirect.getNewUrl();

            assert(redirect.shouldRedirect());
            assert_sameAs('https://example.com', newUrl);
        });
        redirectTests.add('shouldNotRedirect', run => {
            let redirect = new Redirect();
            redirect.url = new URL('https://example.com/www./http');

            assertFalse(redirect.shouldRedirect());
        });
    });
    // test_additional_add(tests);
}