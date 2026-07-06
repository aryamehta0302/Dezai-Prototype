import { IsOptional, IsIn, IsBooleanString } from 'class-validator';
import { AchievementCategory } from '@prisma/client';

export class AchievementsQueryDto {
  @IsOptional()
  @IsIn(Object.values(AchievementCategory))
  category?: AchievementCategory;

  @IsOptional()
  @IsBooleanString()
  unlocked?: string;
}

export class CheckCategoryDto {
  @IsIn(Object.values(AchievementCategory))
  category: AchievementCategory;
}
