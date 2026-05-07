import { Asset } from 'expo-asset';

/**
 * Personalized Outfit Suggestions carousel (feature overview slide).
 * Preload via {@link preloadOutfitGalleryImages} from the welcome screen so decode/cache warms early.
 */
export const OUTFIT_GALLERY_IMAGES = [
  require('@/assets/images/onboarding-assets/Frame 121075726.png'),
  require('@/assets/images/onboarding-assets/Frame 121075729.png'),
  require('@/assets/images/onboarding-assets/Frame 121075728.png'),
] as const;

export async function preloadOutfitGalleryImages(): Promise<void> {
  await Promise.all(
    OUTFIT_GALLERY_IMAGES.map((mod) =>
      Asset.fromModule(mod as number).downloadAsync()
    )
  );
}
