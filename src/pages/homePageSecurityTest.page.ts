import { expect, type Locator, type Page } from '@playwright/test';

export class HomePageSecurityTestPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly mainArea: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox', {
      name: 'Search for legal documents...',
    });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.mainArea = page.getByRole('main');
  }

  async gotoHome() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Legal Assistant' })).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  async submitQuery(payload: string) {
    await this.searchInput.click();
    await this.searchInput.fill(payload);
    await this.searchButton.click();
  }

  async expectSafeUiState() {
    await expect(this.searchInput).toBeVisible();
    await expect(this.mainArea).toBeVisible();
  }
}
