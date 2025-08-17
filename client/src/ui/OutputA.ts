import type {Entity} from "@/Entity";
import {UiA} from "@/ui/UiA";
import {div, downloadText, selectAllTextOfDiv} from "@/utils";

export class OutputA {

    private ui : Entity;
    private output : Entity;
    private outputDownload : Entity;

    constructor(public entity : Entity) {
    }

    static create(entity : Entity) : OutputA {
        let outputA = new OutputA(entity);
        let app = outputA.entity.getApp();
        outputA.output = app.unboundG.createText('There is no output. Click on \'export\'');
        outputA.outputDownload = app.createEntityWithApp();
        outputA.outputDownload.codeG_html = div();
        outputA.outputDownload.codeG_html.style.margin = '0.5rem';
        let uiData = app.unboundG.createTextWithList('output',
            outputA.outputDownload,
            app.unboundG.createButton('select', () => {
                selectAllTextOfDiv(outputA.ui.uiA.listA.elements[2].textG.htmlElement);
            }), outputA.output);
        uiData.collapsible = true;
        outputA.ui = entity.uiA.createSubUiFor(uiData).entity;
        return outputA;
    }

    setAndUpdateUi(string : string) {
        this.output.text = string;
        this.output.uis_update_text();
        //
        this.outputDownload.codeG_html.innerHTML = null;
        this.outputDownload.codeG_html.appendChild(downloadText(string, 'output.txt', 'download output'));
        this.outputDownload.uis_update();
        //
        this.ui.uiA.ensureExpanded();
    }

    getUi() : Entity {
        return this.ui;
    }
}