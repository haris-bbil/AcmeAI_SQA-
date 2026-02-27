import { test, expect } from '@playwright/test';
import { HomePageSecurityTestPage } from '../pages/homePageSecurityTest.page';
import { loadCoreTestingCases } from '../test-data/loaders';

const coreTestingCases = loadCoreTestingCases();

function expectNoSensitiveErrorLeak(pageText: string) {
  expect(pageText).not.toMatch(/sql\s*syntax|stack\s*trace|exception|typeorm|sequelize|traceback/i);
}

for (const tc of coreTestingCases) {
  test(`Core Testing | ${tc.requirementId} | ${tc.testCaseId} | ${tc.description}`, async ({ page }, testInfo) => {
    const app = new HomePageSecurityTestPage(page);
    let xssDialogTriggered = false;
    let actualResult = 'Test executed successfully with safe UI behavior and no sensitive error leak.';

    await test.step(`Expected Result: ${tc.expectedResult}`, async () => {
      testInfo.annotations.push({ type: 'expectedResult', description: tc.expectedResult });
    });

    page.on('dialog', async (dialog) => {
      xssDialogTriggered = true;
      await dialog.dismiss();
    });

    try {
      await app.gotoHome();

      if (tc.mode === 'upload') {
        await expect(page.locator('input[type="file"]')).toHaveCount(0);
        await app.expectSafeUiState();
        actualResult = 'No file upload control was available. Restricted upload condition passed.';
        return;
      }

      if (tc.mode === 'server-validation') {
        await page.evaluate(() => {
          const form = document.querySelector('form');
          if (!form) return;
          for (const element of form.querySelectorAll('[required]')) {
            element.removeAttribute('required');
          }
        });
      }

      await app.submitQuery(tc.payload ?? 'invalid-input');
      await app.expectSafeUiState();

      const pageText = (await page.locator('body').innerText()).toLowerCase();
      expectNoSensitiveErrorLeak(pageText);
      expect(xssDialogTriggered).toBeFalsy();

      if (tc.testCaseId === 'TC-ERR-01') {
        expect(pageText).not.toMatch(/stack\s*trace|sql\s*syntax|internal\s*server\s*error/i);
      }
    } catch (error) {
      actualResult = `Failure: ${error instanceof Error ? error.message : String(error)}`;
      throw error;
    } finally {
      await testInfo.attach('Core Testing Result Message', {
        body: Buffer.from(
          `Requirement: ${tc.requirementId}\nTest Case: ${tc.testCaseId}\nExpected Result: ${tc.expectedResult}\nActual Result: ${actualResult}`,
          'utf-8',
        ),
        contentType: 'text/plain',
      });
    }
  });
}
