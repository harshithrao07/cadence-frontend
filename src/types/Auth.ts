export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

export interface AuthenticationResponseDTO {
  id: string;
  accessToken: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string
}

enum Role {
  ADMIN,
  USER
}
