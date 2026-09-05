import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  articlesForCategory,
  getHelpArticle,
  helpArticlePath,
  popularHelpArticles,
  searchHelpArticles,
} from './help';

describe('help center content', () => {
  it('has an article for every required starter topic', () => {
    const slugs = HELP_ARTICLES.map((article) => article.slug);
    for (const slug of [
      'how-to-add-a-crop',
      'how-to-manage-crops',
      'how-to-record-a-harvest',
      'how-available-produce-is-calculated',
      'how-to-record-a-sale',
      'how-sales-affect-available-produce',
      'how-to-record-an-expense',
      'how-expenses-affect-profitability',
      'how-farmkeeper-calculates-profit',
      'how-to-add-livestock',
      'understanding-farmkeeper-plans',
    ]) {
      assert.ok(slugs.includes(slug), `missing article ${slug}`);
    }
  });

  it('only lists categories that have at least one article', () => {
    for (const category of HELP_CATEGORIES) {
      assert.ok(articlesForCategory(category.id).length > 0, category.id);
    }
  });

  it('searches title, description, keywords, and category', () => {
    const byTitle = searchHelpArticles('record a harvest');
    assert.ok(byTitle.some((article) => article.slug === 'how-to-record-a-harvest'));

    const byKeyword = searchHelpArticles('remaining');
    assert.ok(byKeyword.some((article) => article.slug === 'how-available-produce-is-calculated'));

    const byCategory = searchHelpArticles('subscription');
    assert.ok(byCategory.some((article) => article.slug === 'understanding-farmkeeper-plans'));
  });

  it('returns no results for an unknown query', () => {
    assert.deepEqual(searchHelpArticles('quantum tractor telemetry'), []);
  });

  it('ignores empty search queries', () => {
    assert.deepEqual(searchHelpArticles('   '), []);
  });

  it('builds article paths from the help base', () => {
    assert.equal(
      helpArticlePath('/en/demo/dashboard/help', 'how-to-add-a-crop'),
      '/en/demo/dashboard/help/articles/how-to-add-a-crop'
    );
    assert.equal(getHelpArticle('missing-article'), null);
  });

  it('lists popular help articles from real slugs', () => {
    const popular = popularHelpArticles();
    assert.equal(popular.length, 6);
    assert.ok(popular.every((article) => article.title && article.slug));
  });
});
