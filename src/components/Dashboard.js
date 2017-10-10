import React, { Component } from 'react';
import Helpdesk from './dashboard/Helpdesk';
import Tech from './dashboard/Tech';
import { Row, Grid, Col, Jumbotron } from 'react-bootstrap';

class Dashboard extends Component {
    render () {
        return (
            <div>
                <Grid>
                    <Row className="show-grid">
                        <Col md={2}>
                            {/*
                            * User Profile Picture
                            */}
                            <Jumbotron style={{padding: 10}} className="text-center">
                                <img src={this.props.user.photoURL} className="img-responsive img-circle" alt="profile pic" style={{padding:20}} />
                                <h5 className="text-uppercase">Hello</h5>
                                <h4>{this.props.user.displayName}</h4>
                            </Jumbotron>
                        </Col>
                        <Col md={10}>
                            {this.props.type === 'helpdesk' ? (
                                    <Helpdesk />
                                )
                                : this.props.type === 'tech' ? (
                                        <Tech user={this.props.user} />
                                    )
                                    :null}
                        </Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

export default Dashboard;