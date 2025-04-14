export interface CurrentUser {
  access_token: string;
  user: {
    username: string;
    userData: { username: string; name: string; userId: number };
    modules: [];
    roles: [];
  };
}
