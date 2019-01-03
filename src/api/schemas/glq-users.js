import { schema } from 'normalizr';

export const gqlUserSchema = new schema.Entity(
  'gqlUsers',
  {},
  {
    idAttribute: ({ user }) => user.login,
    processStrategy: ({ user }) => ({
      ...user,
      organizations: {
        ...user.organizations,
        nodes: user.organizations.nodes.map(item => ({
          ...item,
          type: 'org',
        })),
      },
    }),
  }
);
