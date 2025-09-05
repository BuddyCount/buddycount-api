import { SetMetadata } from '@nestjs/common';

// Key used to mark routes or controllers as public
export const IS_PUBLIC_KEY = 'isPublic';

// Custom decorator to mark a route or controller as public (bypasses JWT auth)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
