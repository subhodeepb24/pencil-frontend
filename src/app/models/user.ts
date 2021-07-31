// Interface for the signed up user in Database.
export interface User {
  uid: string;
  email: string;
  name: string;
  created_at: Date;
}