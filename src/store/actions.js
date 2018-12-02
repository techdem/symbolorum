const SWITCH_USER = 'SWITCH_USER';

const UPDATE_PROFILE = 'UPDATE_PROFILE';
const DELETE_PROFILE = 'DELETE_PROFILE';

function switchUser(user) {
  return {
    type: SWITCH_USER,
    user
  }
}

function updateProfile(profile) {
  return {
    type: UPDATE_PROFILE,
    profile
  }
}

function deleteProfile() {
  return { type: DELETE_PROFILE }
}

export { SWITCH_USER, UPDATE_PROFILE, DELETE_PROFILE }
export { switchUser, updateProfile, deleteProfile }
