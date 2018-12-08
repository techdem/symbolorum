import React, { Component } from 'react';
import { S3Album } from 'aws-amplify-react';

export default class Home extends Component {
  render() {
    const { user } = this.props;
      return (
        <React.Fragment>
          {!user && <h5>Sign up for an account and saved creations will be displayed here!</h5>}
          {user && <div className="App">
            <h5> Your Creations: </h5>
            <S3Album level="private" path='' />
          </div>}
        </React.Fragment>
      );
    }
}
