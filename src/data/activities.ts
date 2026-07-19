import type {
  ActivityData,
  ActivityDetail,
  ActivityPhoto,
  ProgramOutput,
  SheetsData,
} from './types.ts';

const byOrderThenId = <T extends { order: number; id: string }>(left: T, right: T): number =>
  left.order - right.order || left.id.localeCompare(right.id, 'id');

export const splitMultilineParagraphs = (
  text: string | null | undefined,
): string[] =>
  text
    ? text
        .split(/\r?\n+/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
    : [];

export const isSupplementalActivityPhoto = (photo: ActivityPhoto): boolean =>
  photo.role === 'narrative' &&
  photo.articleSection === null &&
  photo.outputId === null &&
  photo.indicatorId === null;

export const activityRoute = (
  activity: Pick<ActivityData, 'groupId' | 'slug'>,
): string => `/kegiatan/${activity.groupId}/${activity.slug}`;

export const compareActivities = (left: ActivityData, right: ActivityData): number => {
  const leftDate = left.actualDate ?? left.plannedDate ?? '9999-12-31';
  const rightDate = right.actualDate ?? right.plannedDate ?? '9999-12-31';
  return (
    leftDate.localeCompare(rightDate) ||
    left.groupId.localeCompare(right.groupId) ||
    left.title.localeCompare(right.title, 'id') ||
    left.id.localeCompare(right.id, 'id')
  );
};

export const sortActivities = <T extends ActivityData>(activities: readonly T[]): T[] =>
  [...activities].sort(compareActivities);

const publicOutputPhoto = (
  output: ProgramOutput,
  photos: readonly ActivityPhoto[],
): ActivityPhoto | null =>
  photos
    .filter(
      (photo) =>
        photo.role === 'output' &&
        photo.outputId === output.id &&
        photo.activityId === output.activityId &&
        photo.active &&
        photo.verificationStatus === 'verified',
    )
    .sort(byOrderThenId)[0] ?? null;

/**
 * Mengagregasikan sepuluh tab produksi menjadi model view kegiatan. Fungsi ini
 * tidak menyelesaikan referensi Drive menjadi URL dan tidak mengubah status
 * kegiatan/output berdasarkan ketersediaan foto.
 */
export const buildActivityDetails = (data: SheetsData): ActivityDetail[] => {
  const articleByActivity = new Map(
    data.activityArticles.map((article) => [article.activityId, article] as const),
  );

  return sortActivities(data.activities).map((activity) => {
    const beneficiaries = data.beneficiaries
      .filter(({ activityId }) => activityId === activity.id)
      .sort(byOrderThenId);
    const indicators = data.indicators
      .filter(({ activityId }) => activityId === activity.id)
      .sort(byOrderThenId);
    const photos = data.activityPhotos
      .filter(({ activityId }) => activityId === activity.id)
      .sort(byOrderThenId);
    const outputs = data.outputs
      .filter(({ activityId }) => activityId === activity.id)
      .sort(byOrderThenId)
      .map((output): ProgramOutput => {
        const photo = publicOutputPhoto(output, photos);
        return {
          ...output,
          image: photo?.driveFile ?? null,
          imageAlt: photo?.alt ?? null,
          imageCaption: photo?.caption ?? null,
        };
      });
    const heroPhoto =
      photos.find(
        ({ role, active, verificationStatus }) =>
          role === 'hero' && active && verificationStatus === 'verified',
      ) ?? null;

    return {
      ...activity,
      article: articleByActivity.get(activity.id) ?? null,
      beneficiaries,
      outputs,
      indicators,
      photos,
      heroPhoto,
    };
  });
};
