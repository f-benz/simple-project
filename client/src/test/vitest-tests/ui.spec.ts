import {describe, expect, it, test} from "vitest";
import {Entity} from "@/Entity";
import {StarterA} from "@/StarterA";
import {wait} from "@/utils";

describe('ui', () => {

    it('can create object', async () => {
        let app : Entity = StarterA.createAppWithUI();

        await app.appA.uiA.globalEventG.defaultAction();

        expect(app.appA.uiA.content.listA.jsList.length).toBe(1);
    });

    it('can get json', async () => {
        let app : Entity = StarterA.createAppWithUI();

        let json = app.json_withoutContainedObjects();

        expect(json.content.list).toEqual([]);
    });

    test('At beginning the app object has the focus', async () => {
        let app = StarterA.createAppWithUI();

        expect(app.appA.uiA.focused).toBe(app);
        expect(app.uiA.hasFocus()).toBeTruthy();
    });

    test('Created object has focus', async () => {
        let app = StarterA.createAppWithUI();

        await app.appA.uiA.globalEventG.defaultAction();

        expect(app.appA.uiA.content.uiA.listG.uisOfListItems.at(0).uiA.hasFocus()).toBeTruthy();
    });

    test('can create object after created object', async () => {
        let app = StarterA.createAppWithUI();
        await app.appA.uiA.globalEventG.defaultAction();

        await app.appA.uiA.globalEventG.defaultAction();

        expect(app.appA.uiA.content.listA.jsList.length).toBe(2);
        let resolvedContent = await app.appA.uiA.content.listA.getResolvedList();
        expect(app.appA.uiA.focused.uiA.object).toBe(resolvedContent.at(1));
    });
});