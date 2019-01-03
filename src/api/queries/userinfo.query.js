export const userInfoQuery = `fragment totalCount on RepositoryConnection {
  totalCount
}

query ($login: String!) {
  user(login: $login) {
    login
    name
    avatarUrl
    publicRepos: repositories(ownerAffiliations: [OWNER], privacy: PUBLIC) {
      ...totalCount
    }
    privateRepos: repositories(ownerAffiliations: [OWNER], privacy: PRIVATE) {
      ...totalCount
    }
    allReposCount: repositories(ownerAffiliations: [OWNER]) {
      ...totalCount
    }
    repositoriesContributedTo {
      ...totalCount
    }
    starredRepositories {
      totalCount
    }
    followers {
      totalCount
    }
    following {
      totalCount
    }
    viewerIsFollowing
    bio
    company
    location
    email
    websiteUrl
    organizations(first: 50) {
      nodes {
        name
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
`;
