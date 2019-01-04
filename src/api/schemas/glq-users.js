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
      public_repos: user.public_repos.totalCount,
      private_repos: user.private_repos.totalCount,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
    }),
  }
);
