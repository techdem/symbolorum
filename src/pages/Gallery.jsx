import React, { Component } from 'react';
import { S3Album } from 'aws-amplify-react';

export default class Home extends Component {
  render() {
    const { user } = this.props;
      return (
        <React.Fragment>
          {!user && <h5>Sign up for an account to add your creations to this page!</h5>}
          {/* {user && <div className="App">
            <h5> Your Creations: </h5>
            <S3Album level="private" path='' />
          </div>} */}
          <h5>Recent Creations:</h5>
          <S3Album level="public" path='' />
        </React.Fragment>
      );
    }
}
