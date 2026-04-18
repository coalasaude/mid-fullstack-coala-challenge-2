import { Entity, ERole } from '@healthflow/shared';

export interface UserProps {
  id: string;
  email: string;
  role: ERole;
}

export class User extends Entity<UserProps> {
  static fromPrimitives(props: Pick<UserProps, 'id' | 'email' | 'role'>): User {
    return new User({
      id: props.id,
      email: props.email,
      role: props.role,
    });
  }

  get email(): string {
    return this.props.email;
  }

  get role(): ERole {
    return this.props.role;
  }

  isDoctor(): boolean {
    return this.props.role === ERole.DOCTOR;
  }

  isAttendant(): boolean {
    return this.props.role === ERole.ATTENDANT;
  }
}
