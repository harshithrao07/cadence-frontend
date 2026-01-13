export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: Date;
}

export interface AuthenticationResponseDTO {
  id: string;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string
}

enum Role {
  ADMIN,
  USER
}
