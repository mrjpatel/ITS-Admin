import React, { Component } from 'react';
import { apiurl } from "../../helpers/constants";
import firebase from 'firebase';
import { Button, Panel, Col} from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

class Tech extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tickets: [],
            text: {},
        };
        this.handleNewComment = this.handleNewComment.bind(this);
    }

    /* Handles the Escalation level change */
    handleEscalationChange = (e) => {
        this.setState({
            selectedEscalation: e.target.value
        });
    }

    //handling the drop down Ticket Status
    handleStatusChange = (e) => {
        this.setState({
            selectedStatus: e.target.value
        });
    }

    //handling the Comment from the WYSIWYG Editor
    handleNewComment(value) {
        this.setState({ text: value });
    }

    //Click event for the post comment
    submitComment = (e) => {
        if(this.state.text === null)  {
            alert('Please respond to the request!');
            return;
        }

        //Sending the Comments to the SQL database via API
        fetch(apiurl + '/api/comments', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticketID: e.target.id,
                description: this.state.text
            })
        })

        // Updating the Ticket Status to the SQL database via API
        fetch(apiurl + '/api/tickets/' + e.target.id +'/update', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: this.state.selectedStatus
            })
        })
        alert("Comment successfully Added");
    }

    componentDidMount() {
        /* Fetch all tickets and check which tickets have
            been assigned to this tech user
         */
        fetch(apiurl + '/api/tickets')
            .then((response) => response.json())
            .then((responseJson) => {
                const myTickets = [];
                for(const ele in responseJson) {
                    firebase.database().ref('ticket/'+responseJson[ele].id).on('value', (snapshot) => {
                        if(snapshot.val() !== null && snapshot.val().user_id === this.props.user.uid) {
                            myTickets.push(responseJson[ele]);
                            /* Force the view to re-render (async problem) */
                            this.forceUpdate();
                        }
                    })
                }
                return myTickets;
            })
            .then((tickets) => {
                this.setState({
                    tickets: tickets
                });
            })
    }

    render () {
        const { tickets } = this.state;
        return (
            <div>
                <h1>Tickets Assigned to me</h1>
                <Col md={12}>
                    {tickets.length < 1 ? (
                            <div className="alert alert-info">You have not been assigned any tickets.</div>
                        )
                        : tickets.map((ticket, i) => (
                            <Panel className = "panel-primary" key={i} header={ticket.issue}>
                                <p><b>Ticket ID: </b>{ticket.id}</p>
                                <p><b>User: </b>{ticket.name}</p>
                                <p><b>Description: </b>{ticket.description}</p>
                                <p><b>Priority: </b>{ticket.priority}</p>

                                <p><b>Ticket Status: </b>
                                    <select className="form-control" value={this.state.value} onChange={this.handleStatusChange} defaultValue="-1">
                                        <option value = "{ticket.status}" selected="selected">{ticket.status}</option>
                                        <option value = "In Progress">In Progress</option>
                                        <option value = "Unresolved">Unresolved</option>
                                        <option value = "Resolved">Resolved</option>
                                    </select></p>

                                <p><b>Comment:</b>
                                    <ReactQuill onChange={this.handleNewComment}/></p>

                                <Button className="form-control" bsStyle="success" id={ticket.id} onClick={this.submitComment}>Post a new Comment</Button>

                                <hr/><p><b>Escalate the Ticket: </b>
                                <select className="form-control" onChange={this.handleEscalationChange} defaultValue="-1">
                                    <option value="-1" defaultValue disabled>{ticket.escalationLevel}</option>
                                    <option>1</option>
                                    <option>2</option>
                                    <option>3</option>
                                </select></p>
                            </Panel>
                        ))}
                </Col>

            </div>
        );
    }
}

export default Tech;