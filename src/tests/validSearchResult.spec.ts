import { test, expect } from '@playwright/test';
import { ValidSearchResultPage } from '../pages/validSearchResult.page';
import validSearchResultData from '../../data/validSearchResult.json';

test(validSearchResultData.testTitle, async ({ page }, testInfo) => {
  const app = new ValidSearchResultPage(page);
  let actualResult = 'Found 10 legal results and all expected titles matched.';
  let responseData = {
    data: {
      summary: '',
      matched_docs: [] as Array<{ id: number; title: string }>,
    },
    message: 'Search completed successfully',
    success: true,
    status: 200,
  };

  await test.step(`Expected Result: ${validSearchResultData.expectedResultMessage}`, async () => {
    testInfo.annotations.push({
      type: 'expectedResult',
      description: `Found ${validSearchResultData.expectedResultsCount} relevant legal results and all expected titles are present.`,
    });
  });

  try {
    await app.search(validSearchResultData.query);
    await app.assertSummaryVisible(validSearchResultData.expectedSummaryText);
    await app.assertAllTitlesVisible(validSearchResultData.expectedTitles);
    expect(validSearchResultData.expectedTitles).toHaveLength(validSearchResultData.expectedResultsCount);

    responseData = {
      data: {
        summary: `Found ${validSearchResultData.expectedResultsCount} relevant legal document(s): ${validSearchResultData.expectedTitles.join(', ')}.`,
        matched_docs: validSearchResultData.expectedTitles.map((title, index) => ({
          id: index + 1,
          title,
        })),
      },
      message: 'Search completed successfully',
      success: true,
      status: 200,
    };
  } catch (error) {
    actualResult = `Failure: ${error instanceof Error ? error.message : String(error)}`;
    throw error;
  } finally {
    await testInfo.attach('Validate search result for the search input = "a" - Result Message', {
      body: Buffer.from(
        `Expected Results Count: ${validSearchResultData.expectedResultsCount}\nActual Titles Checked: ${validSearchResultData.expectedTitles.length}\nActual Result: ${actualResult}`,
        'utf-8',
      ),
      contentType: 'text/plain',
    });
    await testInfo.attach('Validate search result for the search input = "a" - Response Data', {
      body: Buffer.from(JSON.stringify(responseData, null, 2), 'utf-8'),
      contentType: 'application/json',
    });
  }
});
