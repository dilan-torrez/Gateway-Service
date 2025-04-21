export interface Role {
  id: number;
  name: string;
}

export interface ModuleWithRoles {
  id: number;
  name: string;
  urlProd: string;
  urlDev: string;
  urlManual: string;
  roles: Role[];
}

export interface CurrentUser {
  access_token: string;
  user: {
    username: string;
    data: {
      username: string;
      name: string;
      id: number;
    };
    modules: Omit<ModuleWithRoles, 'roles'>[]; // solo los módulos sin roles
    modulesWithRoles: ModuleWithRoles[]; // módulos con sus roles
    roles?: Role[]; // opcional si lo usás
  };
}
