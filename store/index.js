import { createStore } from 'redux';
import { updateProfile } from './actions';
import Symbolorum from './reducers';

const store = createStore(Symbolorum);

export default store;
export {
  updateProfile
}
export { default as AmplifyBridge } from './AmplifyBridge';
