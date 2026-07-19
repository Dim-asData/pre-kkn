import { describe, expect, it } from 'vitest';

const componentSources = import.meta.glob('../src/components/TableOfContents.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const layoutSources = import.meta.glob('../src/layouts/ArticleLayout.astro', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

describe('posisi daftar isi responsif', () => {
  const component = componentSources['../src/components/TableOfContents.astro'];
  const layout = layoutSources['../src/layouts/ArticleLayout.astro'];

  it('menempatkan daftar isi mobile tepat sebelum Penerima manfaat', () => {
    const mobileToc = layout.indexOf(
      '<TableOfContents headings={headings} placement="mobile" />',
    );
    const beneficiarySection = layout.indexOf('id="penerima-manfaat"');

    expect(mobileToc).toBeGreaterThan(-1);
    expect(beneficiarySection).toBeGreaterThan(mobileToc);
  });

  it('mempertahankan daftar isi desktop sebagai sidebar setelah konten utama', () => {
    const relatedContent = layout.indexOf('<RelatedContent');
    const desktopToc = layout.indexOf(
      '<TableOfContents headings={headings} placement="desktop" />',
    );

    expect(desktopToc).toBeGreaterThan(relatedContent);
  });

  it('hanya menampilkan placement yang sesuai pada tiap breakpoint', () => {
    expect(component).toContain(".table-of-contents--desktop {\n    display: none;");
    expect(component).toContain('@media (min-width: 64rem)');
    expect(component).toContain(".table-of-contents--mobile {\n      display: none;");
    expect(component).toContain(".table-of-contents--desktop {\n      display: block;");
    expect(component).toContain('data-toc-placement={placement}');
  });
});
