import type {Entity} from "@/Entity";
import type {CommandA} from "@/CommandA";
import {InputPattern} from "@/ui/InputPattern";
import type {AccessMode} from "@/ui/AccessMode";
import {notNullUndefined, nullUndefined} from "@/utils";

export class UiA_AppA_CommandsA {

    mapInputPatternToCommand : Map<string, CommandA> = new Map(); // TODO maybe map to Array<CommandA> ?

    listOfStaticCommands : Array<CommandA> = [];

    defaultAction : CommandA;
    newSubitem : CommandA;
    toggleCollapsible : CommandA;
    scaleDown : CommandA;
    scaleUp : CommandA;
    toggleContext : CommandA;
    mark : CommandA;
    cut : CommandA;
    pasteNext : CommandA;
    paste : CommandA;
    focusUiContext : CommandA;
    deepCopy: CommandA;
    shakeTree: CommandA;
    editMode: CommandA;
    focusNext: CommandA;
    focusPrevious: CommandA;
    exportProfile: CommandA;
    importProfile: CommandA;
    clear: CommandA;
    exportRawText: CommandA;
    transformToProperty: CommandA;
    transformToPlainList: CommandA;

    constructor(public entity: Entity) {
    }

    installCommands() {
        this.defaultAction = this.addCommand(
            'default action',
            () => {
                this.getGlobalEventG().defaultAction();
            },
            this.pattern('Enter')
        );

        this.newSubitem = this.addCommand(
            'new subitem',
            () => {
                this.getGlobalEventG().newSubitem();
            },
            this.pattern(MetaKey.ALT, 'Enter'), this.pattern('Tab')
        );

        this.toggleCollapsible = this.addCommand(
            'toggle collapsible',
            () => {
                this.getGlobalEventG().toggleCollapsible();
            },
            this.pattern(MetaKey.CTRL, 'f'), this.pattern_viewMode('c'), this.pattern('F10'),
        );

        this.scaleDown = this.addCommand(
            'scale down',
            () => {
                this.getGlobalEventG().scaleDown();
            },
            this.pattern(MetaKey.CTRL, 'e'), this.pattern_viewMode('e')
        );

        this.scaleUp = this.addCommand(
            'scale up',
            () => {
                this.getGlobalEventG().scaleUp();
            },
            this.pattern(MetaKey.CTRL, 'd'), this.pattern_viewMode('d')
        );

        this.toggleContext = this.addCommand(
            'toggle context',
            () => {
                this.getGlobalEventG().toggleContext();
            },
            this.pattern(MetaKey.CTRL, 'g'), this.pattern_viewMode('g')
        );

        this.mark = this.addCommand(
            'mark',
            () => {
                this.getGlobalEventG().mark();
            },
            this.pattern_viewMode('m')
        );

        this.cut = this.addCommand(
            'cut',
            () => {
                this.getGlobalEventG().cut();
            },
            this.pattern('F1'), this.pattern_viewMode('x')
        );

        this.pasteNext = this.addCommand(
            'paste next',
            () => {
                this.getGlobalEventG().pasteNext();
            },
            this.pattern('F6'),
        );

        this.paste = this.addCommand(
            'paste',
            () => {
                this.getGlobalEventG().paste();
            },
            this.pattern('F7')
        );

        this.focusUiContext = this.addCommand(
            'focus ui context',
            () => {
                this.getGlobalEventG().focusUiContext();
            },
            this.pattern(MetaKey.CTRL, 'o'), this.pattern_viewMode('o')
        );

        this.deepCopy = this.addCommand(
            'deep copy (marked object will be copied into focused container)',
            () => {
                this.getGlobalEventG().deepCopy();
            },
            this.pattern(MetaKey.CTRL, MetaKey.SHIFT, MetaKey.ALT, 'c')
        );

        this.shakeTree = this.addCommand(
            'shake tree',
            () => {
                this.getGlobalEventG().shakeTree();
            },
            this.pattern(MetaKey.CTRL, MetaKey.SHIFT, MetaKey.ALT, 'q')
        );

        this.editMode = this.addCommand(
            'enter edit mode',
            () => {
                this.getGlobalEventG().editMode();
            },
            this.pattern(MetaKey.CTRL, 'i'), this.pattern('F12')
        );

        this.focusPrevious = this.addCommand(
            'focus previous',
            () => {
                this.getGlobalEventG().focusPrevious();
            },
            this.pattern_viewMode('i'), this.pattern(MetaKey.ALT, 'i')
        );

        this.focusNext = this.addCommand(
            'focus next',
            () => {
                this.getGlobalEventG().focusNext();
            },
            this.pattern_viewMode('k'),
            this.pattern(MetaKey.ALT, 'k')
        );

        this.addCommand(
            'to end of list',
            () => {
                this.getGlobalEventG().toEndOfList();
            },
            this.pattern_viewMode('l'),
            this.pattern(MetaKey.ALT, 'l')
        );

        this.addCommand(
            'leave edit mode',
            () => {
                this.getGlobalEventG().leaveEditMode();
            },
            this.pattern('Escape')
        );

        this.importProfile = this.addCommand(
            'import profile',
            () => {
                this.getGlobalEventG().importProfile();
            }
        );

        this.exportProfile = this.addCommand(
            'export profile',
            () => {
                this.getGlobalEventG().exportProfile();
            }
        );

        this.clear = this.addCommand(
            'clear',
            () => {
                this.getGlobalEventG().clear();
            }
        )

        this.addCommand(
            'toggle column',
            () => {
                this.getGlobalEventG().toggleColumn();
            },
            this.pattern_viewMode('j'), this.pattern('F9')
        )

        this.exportRawText = this.addCommand(
            'export raw text',
            () => {
                this.getGlobalEventG().exportRawText();
            }
        )

        this.transformToProperty = this.addCommand(
            'transform to property',
            () => {
                this.getGlobalEventG().transformToProperty();
            }
        )

        this.transformToPlainList = this.addCommand(
            'transform to PlainList',
            () => {
                this.getGlobalEventG().transformToPlainList();
            }
        )
    }

    addCommand(text : string, action : Function, ...patterns : Array<InputPattern>) : CommandA {
        let command = this.createAndRegisterCommand();
        command.entity.text = text;
        command.entity.codeG_jsFunction = action;
        command.inputPatterns.push(...patterns);
        return command;
    }

    private getGlobalEventG() {
        return this.entity.uiA.appA.globalEventG;
    }

    keyboardEvent(keyboardEvent: KeyboardEvent) {
        if (this.shouldPreventDefault(keyboardEvent)) {
            keyboardEvent.preventDefault();
        }
        this.trigger(keyboardEvent);
    }

    shouldPreventDefault(keyboardEvent : KeyboardEvent) : boolean {
        if (this.mapInputPatternToCommand.has(InputPattern.createFromKeyboardEvent(keyboardEvent).createCompareString()) ||
            this.mapInputPatternToCommand.has(InputPattern.createFromKeyboardEvent_withoutType(keyboardEvent).createCompareString())) {
            return true;
        } else {
            let mode = this.getMode();
            if (notNullUndefined(mode)) {
                return this.mapInputPatternToCommand.has(InputPattern.createFromKeyboardEvent(keyboardEvent, mode).createCompareString()) ||
                    this.mapInputPatternToCommand.has(InputPattern.createFromKeyboardEvent_withoutType(keyboardEvent, mode).createCompareString());
            }
        }
    }

    trigger(keyboardEvent: KeyboardEvent) {
        let triggers : Array<InputPattern> = [];
        let mode = this.getMode();
        triggers.push(InputPattern.createFromKeyboardEvent(keyboardEvent));
        if (notNullUndefined(mode)) {
            triggers.push(InputPattern.createFromKeyboardEvent(keyboardEvent, mode));
        }
        if (keyboardEvent.type === 'keydown') {
            triggers.push(InputPattern.createFromKeyboardEvent_withoutType(keyboardEvent));
            if (notNullUndefined(mode)) {
                triggers.push(InputPattern.createFromKeyboardEvent_withoutType(keyboardEvent, mode));
            }
        }
        for (let trigger of triggers) {
            let compareString = trigger.createCompareString();
            if (this.mapInputPatternToCommand.has(compareString)) {
                this.mapInputPatternToCommand.get(compareString).entity.codeG_jsFunction.call(null);
            }
        }
    }

    private createAndRegisterCommand() : CommandA {
        let command = this.entity.getApp().createEntityWithApp();
        command.installCommandA();
        this.listOfStaticCommands.push(command.commandA);
        return command.commandA;
    }

    pattern(...keys: Array<string | MetaKey>) : InputPattern{
        let inputPattern = new InputPattern();
        for (let key of keys) {
            if (key === MetaKey.CTRL) {
                inputPattern.ctrl = true;
            } else if (key === MetaKey.SHIFT) {
                inputPattern.shift = true;
            } else if (key === MetaKey.ALT) {
                inputPattern.alt = true;
            } else {
                inputPattern.key = InputPattern.normalize(key);
            }
        }
        return inputPattern;
    }

    installMapForInputPatterns() {
        for (let command of this.listOfStaticCommands) {
            for (let inputPattern of command.inputPatterns) {
                this.mapInputPatternToCommand.set(inputPattern.createCompareString(), command);
            }
        }
    }

    pattern_editMode(...keys: Array<string | MetaKey>) : InputPattern {
        let inputPattern = this.pattern(...keys);
        inputPattern.mode = 'edit';
        return inputPattern;
    }

    pattern_viewMode(...keys: Array<string | MetaKey>) : InputPattern {
        let inputPattern = this.pattern(...keys);
        inputPattern.mode = 'view';
        return inputPattern;
    }

    getMode() : AccessMode {
        if (nullUndefined(this.entity.uiA.appA.focused)) {
            return undefined;
        } else {
            if (this.entity.uiA.appA.focused.editMode) {
                return 'edit';
            } else {
                return 'view';
            }
        }
    }
}

enum MetaKey {
    CTRL,
    SHIFT,
    ALT
}