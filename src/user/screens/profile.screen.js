/* eslint-disable no-shadow */
import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import {
  ActivityIndicator,
  Dimensions,
  View,
  RefreshControl,
} from 'react-native';
import { ListItem } from 'react-native-elements';
import ActionSheet from 'react-native-actionsheet';

import {
  ViewContainer,
  UserProfile,
  SectionList,
  ParallaxScroll,
  UserListItem,
  EntityInfo,
} from 'components';
import { emojifyText, t, openURLInView } from 'utils';
import { colors, fonts } from 'config';
import { RestClient } from 'api';
import { getIsFollower, changeFollowStatus } from '../user.action';

const mapStateToProps = (state, props) => {
  const currentUser = props.navigation.state.params.user;
  const userData = state.entities.gqlUsers[currentUser.login];
  const userDataAvailable = !isEmpty(userData);
  const propsToSend = userDataAvailable
    ? {
        user: userData,
        orgs: userData.organizations.nodes,
        starCount: userData.starredRepositories.totalCount,
        isFollowing: userData.viewerIsFollowing,
        isFollower: state.user.isFollower,
        isPendingUser: false,
        isPendingCheckFollower: false,
      }
    : {
        user: {},
        orgs: [],
        starCount: 0,
        isFollowing: false,
        isFollower: state.user.isFollower,
        isPendingUser: true,
        isPendingCheckFollower: true,
      };

  return {
    auth: state.auth.user,
    locale: state.auth.locale,
    ...propsToSend,
  };
};

const mapDispatchToProps = {
  getUserInfo: RestClient.graphql.getUserInfo,
  getIsFollower,
  changeFollowStatus,
};

const BioListItem = styled(ListItem).attrs({
  containerStyle: {
    borderBottomColor: colors.greyLight,
    borderBottomWidth: 1,
  },
  titleStyle: {
    color: colors.greyDark,
    ...fonts.fontPrimary,
  },
})``;

class Profile extends Component {
  props: {
    getUserInfo: Function,
    getIsFollower: Function,
    changeFollowStatus: Function,
    auth: Object,
    user: Object,
    orgs: Array,
    starCount: string,
    locale: string,
    isFollowing: boolean,
    isFollower: boolean,
    isPendingUser: boolean,
    isPendingCheckFollower: boolean,
    navigation: Object,
  };

  state: {
    refreshing: boolean,
  };

  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    this.getUserInfo(false);
  }

  getUserInfo = (forceRefresh = true) => {
    if (
      forceRefresh ||
      this.props.isPendingUser ||
      this.props.isPendingCheckFollower
    ) {
      this.setState({ refreshing: true });
    }

    const user = this.props.navigation.state.params.user;
    const auth = this.props.auth;

    Promise.all([
      this.props.getUserInfo(user.login),
      this.props.getIsFollower(user.login, auth.login),
    ]).then(() => {
      this.setState({ refreshing: false });
    });
  };

  showMenuActionSheet = () => {
    this.ActionSheet.show();
  };

  handlePress = index => {
    const { user, isFollowing, changeFollowStatus } = this.props;

    if (index === 0) {
      changeFollowStatus(user.login, isFollowing);
    } else if (index === 1) {
      openURLInView(user.html_url);
    }
  };

  render() {
    const {
      user,
      orgs,
      starCount,
      locale,
      isFollowing,
      isFollower,
      isPendingUser,
      isPendingCheckFollower,
      navigation,
    } = this.props;
    const { refreshing } = this.state;
    const initialUser = navigation.state.params.user;
    const isPending = isPendingUser || isPendingCheckFollower;
    const userActions = [
      isFollowing ? t('Unfollow', locale) : t('Follow', locale),
      t('Open in Browser', locale),
    ];

    return (
      <ViewContainer>
        <ParallaxScroll
          renderContent={() => (
            <UserProfile
              type="user"
              initialUser={initialUser}
              starCount={!isPending ? starCount : ''}
              isFollowing={!isPending ? isFollowing : false}
              isFollower={!isPending ? isFollower : false}
              user={!isPending ? user : {}}
              locale={locale}
              navigation={navigation}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isPending}
              onRefresh={this.getUserInfo}
            />
          }
          stickyTitle={user.login}
          showMenu={!isPendingUser && initialUser.login === user.login}
          menuAction={() => this.showMenuActionSheet()}
          navigateBack
          navigation={navigation}
        >
          {isPending && (
            <ActivityIndicator
              animating={isPending}
              style={{ height: Dimensions.get('window').height / 3 }}
              size="large"
            />
          )}

          {!isPending && initialUser.login === user.login && (
            <View>
              {!!user.bio && user.bio !== '' && (
                <SectionList title={t('BIO', locale)}>
                  <BioListItem
                    titleNumberOfLines={0}
                    title={emojifyText(user.bio)}
                    hideChevron
                  />
                </SectionList>
              )}

              <EntityInfo
                entity={user}
                orgs={orgs}
                navigation={navigation}
                locale={locale}
              />

              <SectionList
                title={t('ORGANIZATIONS', locale)}
                noItems={orgs.length === 0}
                noItemsMessage={t('No organizations', locale)}
              >
                {orgs.map(item => (
                  <UserListItem
                    key={item.id}
                    user={item}
                    navigation={navigation}
                  />
                ))}
              </SectionList>
            </View>
          )}
        </ParallaxScroll>

        <ActionSheet
          ref={o => {
            this.ActionSheet = o;
          }}
          title={t('User Actions', locale)}
          options={[...userActions, t('Cancel', locale)]}
          cancelButtonIndex={2}
          onPress={this.handlePress}
        />
      </ViewContainer>
    );
  }
}

export const ProfileScreen = connect(
  mapStateToProps,
  mapDispatchToProps
)(Profile);
