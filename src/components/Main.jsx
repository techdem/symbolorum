import React, { Component } from 'react';
import { Container } from 'bootstrap-4-react';
import { HashRouter, Route, Switch } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';

import { Auth } from 'aws-amplify';
import { Hub } from 'aws-amplify';

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.loadUser = this.loadUser.bind(this);

    Hub.listen('auth', this, 'navigator'); // Add this component as listener of auth event.

    this.state = { user: null }
  }

  componentDidMount() {
    this.loadUser(); // The first check
  }

  loadUser() {
    Auth.currentAuthenticatedUser()
      .then(user => this.setState({ user: user }))
      .catch(err => this.setState({ user: null }));
  }

  onHubCapsule(capsule) {
    this.loadUser(); // Triggered every time user sign in / out
  }
  
  render() {
    const { user } = this.state;

    return (
      <Container as="main" role="main">
        <div className="starter-template">
          <HashRouter>
            <Switch>
              <Route
                exact
                path="/"
                render={(props) => <Home user={user} />}
              />
              <Route
                exact
                path="/login"
                render={(props) => <Login user={user} />}
              />
            </Switch>
          </HashRouter>
        </div>
      </Container>
    )
  }
}
