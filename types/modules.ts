import type { ChallengeCategory } from './assessment';
import type { ModuleColorKey } from '../theme/colors';

export interface AppModule {
  id: ChallengeCategory;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  colorKey: ModuleColorKey;
  route: string;
}
