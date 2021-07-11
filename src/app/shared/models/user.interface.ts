
export interface User {
  email: string;
  password: string;
}

export interface UserResponse extends User {
  message: string;
  userId: number;
  token: string;
}


export interface UserProfile {
  name: string;
  email: string;
  password: string;
}
