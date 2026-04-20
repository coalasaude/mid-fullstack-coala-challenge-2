export interface UserAccessLogEventDto {
  module: string;
  useCase: string;
  userId: string;
  action: string;
  description: string;
  occurredAt: string;
}
