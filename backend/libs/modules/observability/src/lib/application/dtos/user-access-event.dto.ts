export interface UserAccessEventDto {
  module: string;
  useCase: string;
  userId: string;
  action: string;
  description: string;
  occurredAt: string;
}
