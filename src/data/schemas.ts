import { z } from 'astro/zod';

export const kelompokIdSchema = z.enum(['t1', 't2', 't3']);
export const contentStatusSchema = z.enum([
  'draft',
  'planned',
  'ongoing',
  'completed',
  'cancelled',
]);
export const programCategorySchema = z.enum([
  'umkm',
  'education',
  'aid_distribution',
  'supporting',
]);
export const outputTypeSchema = z.enum(['physical', 'non_physical']);
export const verificationStatusSchema = z.enum(['draft', 'verified']);
export const activityPhotoRoleSchema = z.enum(['hero', 'narrative', 'output', 'evidence']);
export const activityArticleSectionSchema = z.enum([
  'penerima_manfaat',
  'hasil_program',
  'cerita_program',
  'ukuran_keberhasilan',
]);

const requiredString = z.string().min(1);
const nullableString = requiredString.nullable();
const stableIdSchema = requiredString;
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable();
const optionalCountSchema = z.number().nonnegative().nullable();
const orderSchema = z.number().int().nonnegative();

export const siteSettingsSchema = z
  .object({
    productionMode: z.boolean(),
    autoRebuild: z.boolean(),
    lastPublishedAt: nullableString,
    lastPublishStatus: nullableString,
  })
  .strict();

export const groupDataSchema = z
  .object({
    id: kelompokIdSchema,
    name: requiredString,
    village: requiredString,
    programTheme: requiredString,
    shortDescription: requiredString,
    thumbnail: nullableString,
    active: z.boolean(),
  })
  .strict();

export const activityDataSchema = z
  .object({
    id: stableIdSchema,
    groupId: kelompokIdSchema,
    slug: slugSchema,
    title: requiredString,
    category: programCategorySchema,
    status: contentStatusSchema,
    csrPillars: z.array(requiredString),
    tags: z.array(requiredString),
    plannedDate: isoDateSchema,
    actualDate: isoDateSchema,
    location: requiredString,
    shortDescription: requiredString,
    driveFolderId: nullableString,
    verificationStatus: verificationStatusSchema,
    active: z.boolean(),
  })
  .strict();

export const activityArticleDataSchema = z
  .object({
    activityId: stableIdSchema,
    beneficiaryNarrative: nullableString,
    programResultsNarrative: nullableString,
    programStory: nullableString,
    successMeasureNarrative: nullableString,
  })
  .strict();

export const beneficiarySchema = z
  .object({
    id: stableIdSchema,
    activityId: stableIdSchema,
    label: requiredString,
    planned: optionalCountSchema,
    actual: optionalCountSchema,
    unit: requiredString,
    order: orderSchema,
  })
  .strict();

export const programOutputSchema = z
  .object({
    id: stableIdSchema,
    activityId: stableIdSchema,
    outputNumber: z.number().int().positive(),
    type: outputTypeSchema,
    name: requiredString,
    planned: optionalCountSchema,
    actual: optionalCountSchema,
    unit: requiredString,
    recipient: nullableString,
    verificationStatus: verificationStatusSchema,
    order: orderSchema,
    image: nullableString.optional().default(null),
    imageAlt: nullableString.optional().default(null),
    imageCaption: nullableString.optional().default(null),
  })
  .strict();

export const successIndicatorSchema = z
  .object({
    id: stableIdSchema,
    activityId: stableIdSchema,
    label: requiredString,
    achieved: z.boolean().nullable(),
    evidence: nullableString,
    order: orderSchema,
  })
  .strict();

export const activityPhotoSchema = z
  .object({
    id: stableIdSchema,
    activityId: stableIdSchema,
    outputId: nullableString,
    indicatorId: nullableString,
    role: activityPhotoRoleSchema,
    articleSection: activityArticleSectionSchema.nullable(),
    driveFile: requiredString,
    alt: requiredString,
    caption: nullableString,
    description: nullableString,
    order: orderSchema,
    verificationStatus: verificationStatusSchema,
    active: z.boolean(),
  })
  .strict();

export const umkmDataSchema = z
  .object({
    id: stableIdSchema,
    groupId: kelompokIdSchema,
    slug: slugSchema,
    name: requiredString,
    owner: nullableString,
    category: requiredString,
    tagline: nullableString,
    shortDescription: requiredString,
    heroPhoto: nullableString,
    whatsapp: z.string().regex(/^62\d{8,13}$/).nullable(),
    address: nullableString,
    mapsEmbed: nullableString,
    openingHours: nullableString,
    assistance: z.array(requiredString).min(1),
    catalogUrl: nullableString,
    qrisImage: nullableString,
    story: nullableString,
    uniqueness: nullableString,
    assistanceImpact: nullableString,
    verificationStatus: verificationStatusSchema,
    active: z.boolean(),
  })
  .strict();

export const productDataSchema = z
  .object({
    id: stableIdSchema,
    umkmId: stableIdSchema,
    name: requiredString,
    price: nullableString,
    description: nullableString,
    photo: nullableString,
    active: z.boolean(),
  })
  .strict();

export const sheetsDataSchema = z
  .object({
    settings: siteSettingsSchema.nullable(),
    groups: z.array(groupDataSchema),
    activities: z.array(activityDataSchema),
    activityArticles: z.array(activityArticleDataSchema),
    beneficiaries: z.array(beneficiarySchema),
    outputs: z.array(programOutputSchema),
    indicators: z.array(successIndicatorSchema),
    activityPhotos: z.array(activityPhotoSchema),
    umkm: z.array(umkmDataSchema),
    products: z.array(productDataSchema),
  })
  .strict();
