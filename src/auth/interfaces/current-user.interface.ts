export interface CurrentUser {
  access_token: string;
  user: {
    username: string;
    data: { username: string; name: string; id: number };
    modules: [];
    roles: [];
  };
}
