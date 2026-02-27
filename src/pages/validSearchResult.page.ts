import { expect, type Page } from '@playwright/test';
import { HomePageSecurityTestPage } from './homePageSecurityTest.page';

export class ValidSearchResultPage {
  private readonly page: Page;
  private readonly homePageSecurityTestPage: HomePageSecurityTestPage;

  constructor(page: Page) {
    this.page = page;
    this.homePageSecurityTestPage = new HomePageSecurityTestPage(page);
  }

  async search(query: string) {
    await this.homePageSecurityTestPage.gotoHome();
    await this.homePageSecurityTestPage.submitQuery(query);
  }

  async assertSummaryVisible(summaryText: string) {
    await expect(this.page.getByText(summaryText, { exact: false })).toBeVisible();
  }

  async assertAllTitlesVisible(titles: string[]) {
    const pageText = await this.page.locator('body').innerText();
    for (const title of titles) {
      expect(pageText).toContain(title);
    }
  }
}
