import { Auth, Hub } from 'aws-amplify';

import { switchUser, updateProfile, deleteProfile } from './actions';

export default class AmplifyBridge {
  constructor(store) {
    this.store = store;

    this.onHubCapsule = this.onHubCapsule.bind(this);
    Hub.listen('auth', this, 'AmplifyBridge');

    this.checkUser(); // first check
  }

  onHubCapsule(capsule) {
    this.checkUser();
  }

  checkUser() {
    Auth.currentAuthenticatedUser()
      .then(user => this.checkUserSuccess(user))
      .catch(err => this.checkUserError(err));
  }

  loadUserInfo(user) {
    Auth.currentUserInfo()
      .then(info => this.loadUserInfoSuccess(user, info))
      .catch(err => this.loadUserInfoUserError(user, err));
  }

  loadProfile(user) {
    Auth.userAttributes(user)
      .then(data => this.loadProfileSuccess(data))
      .catch(err => this.loadProfileError(err));
  }

  checkUserSuccess(user) {
    this.loadUserInfo(user);
    this.loadProfile(user);
  }

  checkUserError(err) {
    this.store.dispatch(switchUser(null));
    this.store.dispatch(deleteProfile());
  }

  loadUserInfoSuccess(user, info) {
    Object.assign(user, info);
    this.store.dispatch(switchUser(user));
  }

  loadUserInfoError(user, err) {
    this.store.dispatch(switchUser(user));
  }

  loadProfileSuccess(data) {
    const profile = this.translateAttributes(data);
    this.store.dispatch(updateProfile(profile));
  }

  loadProfileError(err) {
    this.store.dispatch(deleteProfile());
  }

  translateAttributes(data) {
    const attributes = {};
    data
      .filter(attr => ['given_name', 'family_name'].includes(attr.Name))
      .forEach(attr => attributes[attr.Name] = attr.Value);
    return attributes;
  }
}
