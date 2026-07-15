export class RegisterResponse {
  constructor(
    public readonly id: string,
    public readonly email: string,
  ) {}
}

export class FindByEmailResponse {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
  ) {}
}

export class LoginResponse {
  constructor(public readonly accessToken: string) {}
}
