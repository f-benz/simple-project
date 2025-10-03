import type {Entity} from "@/Entity";
import type {UiA_AppA} from "@/ui/UiA_AppA";
import type {AppA} from "@/AppA";

export class UiA_AppA_GlobalEventG {

    constructor(public entity : Entity) {
    }

    defaultAction() {
        this.getAppUi().focused.defaultAction();
    }

    exportApp() {
        this.getAppUi().output.setAndUpdateUi(JSON.stringify(this.entity.getApp().entity.export(), null, 4));
    }

    toggleCollapsible() {
        this.getAppUi().focused.toggleCollapsible();
    }

    newSubitem() {
        this.entity.logInfo('newSubitem');
        this.getAppUi().focused.newSubitem();
    }

    paste() {
        this.getAppUi().focused.paste();
    }

    expandOrCollapse() {
        this.getAppUi().focused.expandOrCollapse();
    }

    ensureContainer() {
        this.getAppUi().ensureContainer_AndUpdateStyle(this.getAppUi().focused.object);

    }

    private getAppUi() : UiA_AppA {
        return this.entity.uiA.appA;
    }

    export() {
        let toExport = this.getAppUi().focused.object;
        this.getAppUi().output.setAndUpdateUi(JSON.stringify(toExport.export(), null, 4));
    }

    import() {
        let created = this.getApp().unboundG.createFromJson(JSON.parse(this.getAppUi().input.get()));
        this.getAppUi().focused.object.containerA.bind(created);
        this.getApp().uiA.clipboard = created;
    }

    importOldJson() {
        let created = this.getApp().unboundG.createFromOldJson(JSON.parse(this.getAppUi().input.get()));
        this.getAppUi().focused.object.containerA.bind(created);
        this.getApp().uiA.clipboard = created;
    }

    focusRoot() {
        this.getAppUi().focus(this.getAppUi().entity.uiA);
    }

    cut() {
        this.getAppUi().focused.cut();
    }

    mark() {
        this.getAppUi().focused.mark();
    }

    pasteNext() {
        this.getAppUi().focused.pasteNext();
    }

    scaleUp() {
        this.getAppUi().focused.scaleUp();
    }

    scaleDown() {
        this.getAppUi().focused.scaleDown();
    }

    deepCopy() {
        let focusedObject = this.getAppUi().focused.object;
        if (focusedObject.containerA) {
            let app_uiA = this.entity.getApp().uiA;
            if (app_uiA.clipboard) {
                app_uiA.clipboard = app_uiA.clipboard.deepCopy(focusedObject.containerA).run();
                this.getAppUi().signal('copied deep: ' + app_uiA.clipboard.getShortDescription());
            } else {
                this.getAppUi().signal('Error: no object in clipboard (will be copied)');
            }
        } else {
            this.getAppUi().signal('Error: the target is not a container (target = focus)');
        }
    }

    toggleContext() {
        this.getAppUi().focused.toggleContext()
    }

    script_setContextForAllObjectsInContainer() {
        this.getAppUi().focused.object.script_setContextForAllObjectsInContainer();
    }

    focusUiContext() {
        this.getAppUi().focus(this.getAppUi().focused.context);
    }

    setLink() {
        this.getAppUi().focused.setLink();
    }

    shakeTree() {
        this.getAppUi().focused.shakeTree();
    }

    getApp() : AppA {
        return this.entity.getApp();
    }

    editMode() {
        this.getAppUi().focused.enterEditMode();
    }

    focusPrevious() {
        this.getAppUi().focused.focusPrevious();
    }

    focusNext() {
        this.getAppUi().focused.focusNext();
    }

    toEndOfList() {
        this.getAppUi().focused.toEndOfList();
    }

    leaveEditMode() {
        this.getAppUi().focused.leaveEditMode();
    }

    clear() {
        this.getAppUi().clear();
    }

    exportProfile() {
        let exportedProfile = this.getApp().profileG.exportProfile();
        this.getAppUi().output.setAndUpdateUi(JSON.stringify(exportedProfile, null, 4));
        this.getAppUi().signal('Download the export from the output!');
    }

    importProfile() {
        this.getApp().profileG.importProfile(JSON.parse(this.getAppUi().input.get()));
        let profile = this.getApp().profileG.getProfile();
        this.getAppUi().focus(this.getAppUi().mainColumnUi);
        this.getAppUi().input.clear();
        this.getAppUi().input.ui.uiA.ensureCollapsed();
        if (profile.has(this.getApp().profileG.rootString)) {
            let root = profile.get(this.getApp().profileG.rootString);
            this.entity.uiA.appA.supportColumn_freeSpace.listA.add(root);
            this.entity.uiA.appA.supportColumn_freeSpace.uis_update();
        }
    }

    toggleColumn() {
        if (this.getAppUi().focused.getColumn() === this.getAppUi().mainColumnUi) {
            this.getAppUi().supportColumnUi.columnA_takeFocus();
        } else {
            this.getAppUi().mainColumnUi.columnA_takeFocus();
        }
    }

    exportRawText() {
        let rawText = this.getAppUi().focused.textA.getRawText(0);
        this.getAppUi().output.setAndUpdateUi(rawText);
    }

    transformToProperty() {
        this.getAppUi().focused.transformToProperty();
    }

    transformToPlainList() {
        this.getAppUi().focused.transformToPlainList();
    }

    zoomIn() {
        this.getAppUi().focused.zoomIn();
    }

}