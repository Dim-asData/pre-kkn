import { describe, expect, it } from 'vitest';
import { extractDriveId, hasSyncedDrivePhoto, photoUrl, toDriveReference } from '../src/lib/photos';

describe('referensi foto Google Drive', () => {
  const fileId = '1UrpAsYfu-sMmEhL2uwGfK_vzexirkXa0';

  it('menormalisasi ID mentah dan endpoint Drive lama ke referensi stabil', () => {
    expect(extractDriveId(`drive://${fileId}`)).toBe(fileId);
    expect(extractDriveId(`https://drive.google.com/uc?export=download&id=${fileId}`)).toBe(fileId);
    expect(extractDriveId(`https://lh3.googleusercontent.com/d/${fileId}`)).toBe(fileId);
    expect(toDriveReference(`https://drive.google.com/file/d/${fileId}/view`)).toBe(`drive://${fileId}`);
  });

  it('tidak menjadikan URL Drive mentah sebagai URL yang dirender', () => {
    expect(photoUrl(`drive://${fileId}`)).toMatch(/^\/(?:_photos\/|default\.png$)/);
    expect(photoUrl('https://example.com/foto-eksternal.webp')).toBe(
      'https://example.com/foto-eksternal.webp',
    );
    expect(photoUrl('https://placehold.co/800x800.webp?text=Produk')).toBe('/default.png');
    expect(photoUrl('https://www.placehold.co/1200x800.webp')).toBe('/default.png');
    expect(photoUrl(null)).toBe('/default.png');
    expect(hasSyncedDrivePhoto('drive://1Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(false);
  });
});
