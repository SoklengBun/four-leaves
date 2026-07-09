export enum UserRole {
  USER = 1,
  ADMIN = 0,
}

export type User = {
  id: number;
  createdAt: string;
  name: string;
  role: UserRole;
};
