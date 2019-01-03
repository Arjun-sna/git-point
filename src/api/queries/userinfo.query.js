export const userInfoQuery = `fragment totalCount on RepositoryConnection {
  totalCount
}

fragment nodeInfo on Actor {
  login
  avatarUrl
  url
}

fragment repoInfo on RepositoryOwner {
  publicRepos: repositories(ownerAffiliations: [OWNER], privacy: PUBLIC) {
    ...totalCount
  }
  privateRepos: repositories(ownerAffiliations: [OWNER], privacy: PRIVATE) {
    ...totalCount
  }
  allReposCount: repositories(ownerAffiliations: [OWNER]) {
    ...totalCount
  }
}

query ($login: String!) {
  user(login: $login) {
    ...nodeInfo
    ...repoInfo
    name
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
    updatedAt
    
    organizations(first: 50) {
      nodes {
        name
        ...nodeInfo
        ...repoInfo
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
`;
