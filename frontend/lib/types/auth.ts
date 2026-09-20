export interface RegisterData {
  email: string;
  password: string;
  phone: string;
  fullname: string;

}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  fullname: string;
  role: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}