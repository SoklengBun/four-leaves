export enum UserRole {
  USER = 0,
  ADMIN = 1,
}

export type User = {
  id: number;
  createdAt: string;
  name: string;
  role: UserRole;
};
