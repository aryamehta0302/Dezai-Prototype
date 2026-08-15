import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AssignMentorDto {
  @IsString()
  @IsNotEmpty()
  facultyId: string;

  @IsString()
  @IsNotEmpty()
  enrollmentId: string;
}

export class ChangeMentorDto {
  @IsString()
  @IsNotEmpty()
  newFacultyId: string;
}
