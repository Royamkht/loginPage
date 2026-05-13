import { expect as baseExpect, type MatcherReturnType } from '@playwright/test';
import { APIlogger } from './logger';
import { validateSchema } from './schema-validator';

let apiLogger: APIlogger | undefined;

export function setCustomExpectLogger(logger: APIlogger) {
    apiLogger = logger;
}

/** Must live in `PlaywrightTest` (same as generated `test.d.ts`), not `declare module '@playwright/test'`. */
declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T = unknown> {
            toMatchSchema(dirName: string, fileName: string): Promise<R>;
        }
    }
}

export const expect = baseExpect.extend({
    // Use a property + arrow so the matcher’s first typed parameter is `received` (not `this`), which
    // Playwright’s ToUserMatcherObject requires when attaching matchers to `expect(value)`.
    toMatchSchema: async (
        received: unknown,
        dirName: string,
        fileName: string,
    ): Promise<MatcherReturnType> => {
        let pass: boolean;
        let message = '';

        try {
            await validateSchema(dirName, fileName, received as object);
            pass = true;
            message = 'Schema validation passed';
        } catch (e: unknown) {
            pass = false;
            const errMsg = e instanceof Error ? e.message : String(e);
            const logs = apiLogger?.getRecentLogs() ?? '(no logger — call setCustomExpectLogger first)';
            message = `${errMsg}\n\nRecent API Activity: \n${logs}`;
        }
        return {
            message: () => message,
            pass,
        };
    },
});
