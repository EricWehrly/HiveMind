import StacklessError from "../../../testHelpers/StacklessError";

const glob = require('glob');
const fs = require('fs');
const path = require('path');
// import { MakeLiving } from "../../../../js/entities/character/mixins/Living";

// const mixinFunctionPattern = /export\s+function\s+\w+<.*>\(\w+:\s*\w+\)\s*\{\s*return\s+class\s+\w+\s+extends.*/
const mixinFunctionPattern = /export\s+function\s+\w+<.*>\(\w+:\s*\w+\)\s*(?::\s*\w+\s*&\s*\w+<.*>)?\s*\{\s*(?:if.*\{)?\s*return\s+class\s+\w+\s+extends\s+\w+(\s+implements\s+\w+)?\s*\{/;


describe('regex sanity check', () => {
    it('should detect mixin in Living.ts', () => {
        const livingFilePath = require.resolve("../../../../js/entities/character/mixins/Living");
        const livingFileContents = fs.readFileSync(livingFilePath, 'utf8');
        expect(mixinFunctionPattern.test(livingFileContents)).toBeTruthy();
    });
});

const tsFiles = glob.sync('**/*.ts');

function getFileName(fullPath: string): string {
    return fullPath.substring(fullPath.lastIndexOf('\\') + 1, fullPath.lastIndexOf('.'));
}

describe.each(tsFiles)('Mixin %s', (filePath: string) => {
    
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');

        if (mixinFunctionPattern.test(fileContents)) {
            it('should do a thing', async () => {
                const filename = getFileName(filePath);
                console.log(`Testing mixin ${filename}`);

                const absolutePath = path.resolve(filePath);
                const mixinModule = await import(absolutePath);
                
                const exportedValues = Object.values(mixinModule);
                const firstExportedFunction = exportedValues.find(value => typeof value === 'function');
                expect(firstExportedFunction).toBeDefined();
            });
        }
    } catch (ex) {
        throw new StacklessError(ex.message);
    }
});
