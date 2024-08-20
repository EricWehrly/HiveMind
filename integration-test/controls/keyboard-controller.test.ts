// AddDefaultBinding
// new KeyboardController
// expect binding to be bound
// simulate keypress
// expect event to be raised

import mockEvents from "../../engine/test/testHelpers/mockEvents";
import Action from "../../engine/js/action";
import KeyboardController from "../../js/controls/keyboard-controller.mjs";

jest.mock('@/engine/js/events', () => mockEvents);

// (post instantiation)
// AddDefaultBinding
// expect binding to be bound

describe('KeyboardController', () => {
    describe('AddDefaultBinding', () => {

        const testActionCallback = jest.fn();

        const testAction = new Action({
            name: "integrationTestAction",
            enabled: true,
            callback: testActionCallback
        });

        it('should bind the key', () => {
            const testKey = "t";
            KeyboardController.AddDefaultBinding(testAction.name, testKey);

            const keyboardController = new KeyboardController();
            keyboardController.handleKeyDown({ key: testKey });
            expect(testActionCallback).toHaveBeenCalled();
        });

        it('should add new default bindings after construction', () => {
            const testKey = "t";

            const keyboardController = new KeyboardController();
            KeyboardController.AddDefaultBinding(testAction.name, testKey);
            keyboardController.handleKeyDown({ key: testKey });
            
            expect(testActionCallback).toHaveBeenCalled();
        });
    });
});
