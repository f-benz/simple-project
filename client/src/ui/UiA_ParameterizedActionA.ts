import type {Entity} from "@/Entity";
import type {UiA} from "@/ui/UiA";
import {assert, assert_notSameAs, notNullUndefined} from "@/utils";

export class UiA_ParameterizedActionA {
    bodyContentUi: UiA;
    constructor(public entity : Entity) {
    }

    bodyContentG_update() {
        let bodyContent = this.entity.getApp().unboundG.createList();
        let userParameters = this.entity.getApp().createList();
        let fillWithUiReference : string;
        let uiReference = this.entity.uiA.uiReference_withContext();
        if (uiReference) {
            for (let parameter of this.entity.uiA.object.parameterizedActionA.parameters) {
                if (parameter.type === 'entity') {
                    fillWithUiReference = parameter.name;
                    break;
                }
            }
        }
        for (let parameter of this.entity.uiA.object.parameterizedActionA.parameters) {
            if (parameter.name !== fillWithUiReference) {
                if (parameter.type === 'stringValue') {
                    userParameters.set(parameter.name, this.entity.getApp().createText(''));
                } else if (parameter.type === 'entity') {
                    userParameters.addProperty(parameter.name);
                }
            }
        }
        bodyContent.listA.addDirect(userParameters);
        let resultsProperty = bodyContent.addProperty("results");
        let resultsList = this.entity.getApp().unboundG.createList();
        resultsProperty.to = this.entity.getApp().direct(resultsList);
        let button = this.entity.getApp().unboundG.createButton('run', () => {
            let args = this.entity.getApp().createList();
            for (let parameter of this.entity.uiA.object.parameterizedActionA.parameters) {
                if (uiReference && parameter.name === fillWithUiReference) {
                    args.set(parameter.name, uiReference.object);
                } else {
                    args.set(parameter.name, userParameters.get(parameter.name));
                }
            }
            let result = this.entity.uiA.object.parameterizedActionA.runWithArgs(args);
            if (result) {
                this.entity.getApp().uiA.clipboard = result;
                this.entity.getApp().uiA.clipboard_lostContext = false;
            }
            resultsList.listA.addDirect(result);
            resultsList.uis_update_addedListItem(resultsList.listA.jsList.length - 1);
            this.entity.uiA.findAppUi().signal('run: ' + this.entity.uiA.object.text);
        });
        bodyContent.listA.addDirect(button);
        this.bodyContentUi = this.entity.uiA.createSubUiFor(bodyContent);
    }
}