import React, { Component } from 'react';
import './App.css';
import { Navbar, Button, Nav, NavItem, Jumbotron } from 'react-bootstrap';
import firebase from 'firebase';
import { Route, Redirect } from 'react-router';
import Dashboard from './components/Dashboard';

class App extends Component {
    state = {
        type: null,
        user: null
    }

    componentWillMount () {
        firebase.auth().onAuthStateChanged(this.handleCredentials);
    }

    componentWillUnmount() {
        if(this.state.user !== null) {
            localStorage.setItem('type', this.state.type);
        }
    }

    //Click Button event for the login
    handleClick = (type) => {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider)
            .then((success) => { this.handleCredentials(success.user) })
            .then(() => { this.handleLogin(type) });
    }

    //handling the credentials
    handleCredentials = (params) => {
        console.log(params);
        this.setState({
            user: params,
            type: localStorage.getItem('type')
        });
    }

    //handling login
    handleLogin = (type) => {
        localStorage.setItem('type', type);
        this.setState({
            type: type
        });

        /* Add user to mongodb database */
        /* MongoDB schema - will insert the user's details into the database */
        const user = {};
        user['user/' + this.state.user.uid] = {
            type: type,
            name: this.state.user.displayName,
            id: this.state.user.uid
        };
        firebase.database().ref().update(user)
    }

    //handle sign out
    handleSignout = () => {
        const vm = this;
        vm.setState({
            user: null,
            type: null
        });
        localStorage.setItem('type', null);
        firebase.auth().signOut().then(function () {
            alert('You have been signed out');
        });
    }

    render() {
        return (
            <div className="App">
                {/*Navbar*/}
                <Navbar>
                    <Navbar.Header>
                        <Navbar.Brand><a href="">ITS-Admin</a></Navbar.Brand>
                    </Navbar.Header>
                    <Nav pullRight>
                        {this.state.user !== null &&
                        <NavItem onClick={this.handleSignout}>Sign out</NavItem>
                        }
                    </Nav>
                </Navbar>

                {/*Content*/}
                <div className="container">
                    <Route exact path="/" render={() => (
                        this.state.user === null ? (
                                <Jumbotron className="text-center">
                                    <h1>ITS-ADMIN</h1> <br />
                                    <h4>Sign in to continue</h4>
                                    <h5>Please select your account type: </h5><br />
                                    <div className="text-center">
                                        <Button bsSize="large" bsStyle="primary" style={{marginRight:30}} onClick={() => this.handleClick('helpdesk')}>Helpdesk User</Button>
                                        <Button bsSize="large" bsStyle="success" onClick={() => this.handleClick('tech')}>Tech User</Button>
                                    </div>
                                </Jumbotron>
                            )
                            : (
                                <Redirect to="/dashboard" />
                            )
                    )} />
                    <Route exact path="/dashboard" render={() => (
                        this.state.user !== null ? (
                                <Dashboard user={this.state.user} type={this.state.type} />
                            )
                            : (
                                <Redirect to="/" />
                            )
                    )} />
                    {/*Footer*/}
                    <footer className="text-center">
                        <br /><p>Copyright © Japan Patel 2017. All right reserved.</p>
                    </footer>
                </div>
            </div>
        );
    }
}

export default App;

