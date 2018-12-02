import { Auth, Hub, Logger } from 'aws-amplify';

import { switchUser, updateProfile, deleteProfile } from './actions';

const logger = new Logger('AmplifyBridge');

export default class AmplifyBridge {
  constructor(store) {
    this.store = store;

    this.onHubCapsule = this.onHubCapsule.bind(this);
    Hub.listen('auth', this, 'AmplifyBridge');

    this.checkUser();
  }

  onHubCapsule(capsule) {
    logger.info('on Auth event', capsule);
    this.checkUser();
  }

  checkUser() {
    Auth.currentAuthenticatedUser()
      .then(user => this.checkUserSuccess(user))
      .catch(err => this.checkUserError(err));
  }

  loadProfile(user) {
    Auth.userAttributes(user)
      .then(data => this.loadProfileSuccess(data))
      .catch(err => this.loadProfileError(err));
  }

  checkUserSuccess(user) {
    logger.info('check user success', user);
    this.store.dispatch(switchUser(user));
    this.loadProfile(user);
  }

  checkUserError(err) {
    logger.info('check user error', err);
    this.store.dispatch(switchUser(null));
    this.store.dispatch(deleteProfile());
  }

  loadProfileSuccess(data) {
    logger.info('load profile success', data);
    const profile = this.translateAttributes(data);
    this.store.dispatch(updateProfile(profile));
  }

  loadProfileError(err) {
    logger.info('load profile error', err);
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
