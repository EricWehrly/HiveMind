import mockEvents from "../../engine/test/testHelpers/mockEvents";
import Action from "../../engine/js/action";
import KeyboardController from "../../js/controls/KeyboardController";

jest.mock('@/engine/js/events', () => mockEvents);

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

            const keyboardController = new KeyboardController({});
            const event = new KeyboardEvent('keydown', { key: testKey });
            keyboardController.handleKeyDown(event);
            expect(testActionCallback).toHaveBeenCalled();
        });

        it('should add new default bindings after construction', () => {
            const testKey = "t";

            const keyboardController = new KeyboardController({});
            KeyboardController.AddDefaultBinding(testAction.name, testKey);
            const event = new KeyboardEvent('keydown', { key: testKey });
            keyboardController.handleKeyDown(event);

            expect(testActionCallback).toHaveBeenCalled();
        });
    });
});
