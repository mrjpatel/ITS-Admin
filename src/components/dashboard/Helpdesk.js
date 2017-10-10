import React, { Component } from 'react';
import { apiurl } from '../../helpers/constants';
import { Table, Row, Col, Jumbotron, Button } from 'react-bootstrap';
import firebase from 'firebase';

class Helpdesk extends Component {
    state = {
        tickets: [],
        selectedTicket: null,
        techUsers: [],
        selectedTech: null
    }

    /* Once component has mounted, fetch from API + firebase */
    componentDidMount() {
        /* Fetch all tickets and check which tickets have
            an assigned tech
         */
        fetch(apiurl + '/api/tickets')
            .then((response) => response.json())
            .then((responseJson) => {
                const pendingTickets = [];
                for(const ele in responseJson) {
                    firebase.database().ref('ticket/'+responseJson[ele].id).on('value', (snapshot) => {
                        if(snapshot.val() === null) {
                            pendingTickets.push(responseJson[ele]);

                            /* Force the view to re-render (async problem) */
                            this.forceUpdate();
                        }
                    })
                }
                return pendingTickets;
            })
            .then((tickets) => {
                this.setState({
                    tickets: tickets
                });
            })

        /* Creates a firebase listener which will automatically
            update the list of tech users every time a new tech
            registers into the system
         */
        const users = firebase.database().ref('user/')
        users.on('value', (snapshot) => {
            const tempTech = [];
            for(const ele in snapshot.val()) {
                if(snapshot.val()[ele].type === 'tech') {
                    tempTech.push(snapshot.val()[ele]);
                }
            }
            this.setState({
                techUsers: tempTech
            });
        })
    }

    /* Toggle the ticket dialog */
    ticketDetailsClick = (ticket) => {
        const { selectedTicket } = this.state;
        this.setState({
            selectedTicket: (selectedTicket !== null && selectedTicket.id === ticket.id ? null : ticket)
        });
    }

    /* Close button for dialog */
    closeDialogClick = () => {
        this.setState({
            selectedTicket: null
        })
    }

    /* Update the selected tech from dropdown box */
    handleTechChange = (e) => {
        this.setState({
            selectedTech: e.target.value
        });
    }

    /* Handles the priority status change */
    handlePriorityChange = (e) => {
        this.setState({
            selectedPriorityStatus: e.target.value
        });
    }

    /* Handles the Escalation level change */
    handleEscalationChange = (e) => {
        this.setState({
            selectedEscalation: e.target.value
        });
    }

    /* Click assign button */
    assignTicketToTech = () => {
       if(this.state.selectedTech != null && this.state.selectedPriorityStatus != null && this.state.selectedEscalation != null){
           /* Add assigned ticket+tech into database*/
           const data = {};
           data['ticket/' + this.state.selectedTicket.id] = {
               ticket_id: this.state.selectedTicket.id,
               user_id: this.state.selectedTech, // stored Tech ID
           };
           firebase.database().ref().update(data)

           /*Sending the priority status and Escalation Level data to SQL via API*/
           fetch(apiurl + '/api/tickets/' + this.state.selectedTicket.id +'/update', {
               method: 'POST',
               headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   status: 'Pending'
               })
           })

           fetch(apiurl + '/api/tickets/' + this.state.selectedTicket.id +'/updatePriority', {
               method: 'POST',
               headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   priority: this.state.selectedPriorityStatus
               })
           })

           fetch(apiurl + '/api/tickets/' + this.state.selectedTicket.id +'/updateEscalation', {
               method: 'POST',
               headers: {
                   'Accept': 'application/json',
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                   escalationLevel: this.state.selectedEscalation
               })
           })
           alert('Tech successfully assigned to ticket!');
           window.location.reload();
       }
        else{
            if(this.state.selectedTech == null) {
                alert('Please select the Tech User.');
            }
            if(this.state.selectedPriorityStatus == null){
                alert('Please add priority status.');
            }
            if(this.state.selectedEscalation == null) {
                alert('Please add escalation level.');
            }
        }

    }

    /* Render the page! */
    render () {
        const vm = this
        const { selectedTicket, tickets, techUsers } = this.state

        return (
            <div>
                <Row>
                    <Col md={(selectedTicket !== null ? 6 : 12)}>
                        <h2>Pending Tickets</h2>
                        {tickets.length < 1 && (
                            <p className="alert alert-info">There are no tickets to display.</p>
                        )}
                        <Table striped hover>
                            <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Issue</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tickets.map((ticket, i) => (
                                <tr key={i}>
                                    <td>{ticket.id}</td>
                                    <td>{ticket.issue}</td>
                                    <td>
                                        <Button bsStyle={vm.state.selectedTicket !== null && vm.state.selectedTicket.id === ticket.id ? 'success' : 'info'} onClick={() => vm.ticketDetailsClick(ticket)}>More Details</Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Col>
                    {selectedTicket !== null && (
                        <Col md={6}>
                            <Jumbotron style={{padding: 10}}>
                                <h4 className="text-uppercase">Ticket Details</h4><hr/>
                                <b>Ticket ID: </b>{selectedTicket.id}<br/>
                                <b>User: </b>{selectedTicket.name}<br/>
                                <b>Title: </b>{selectedTicket.issue}<br/><br/>
                                <b>Operating System: </b>{selectedTicket.os}<br/>
                                <b>Description: </b>{selectedTicket.description}<br/>
                                {techUsers.length >= 0 && (
                                    <div>
                                        <hr/>
                                        {/*Assign to Tech*/}
                                        <h5 className="text-uppercase">Assign to tech</h5>
                                        <select className="form-control" onChange={this.handleTechChange} defaultValue="-1">
                                            <option value="-1" defaultValue disabled>Select a tech user</option>
                                            {techUsers.map((user, i) => (
                                                <option key={i} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>

                                        {/*Change Priority*/}
                                        <h5 className="text-uppercase">Add priority</h5>
                                        <select className="form-control" onChange={this.handlePriorityChange} defaultValue="-1">
                                            <option value="-1" defaultValue disabled>Select Priority</option>
                                                <option>low</option>
                                                <option>moderate</option>
                                                <option>high</option>
                                        </select>

                                        {/*change Escalation level*/}
                                        <h5 className="text-uppercase">Add Escalation level</h5>
                                        <select className="form-control" onChange={this.handleEscalationChange} defaultValue="-1">
                                            <option value="-1" defaultValue disabled>Select level</option>
                                            <option>1</option>
                                            <option>2</option>
                                            <option>3</option>
                                        </select>

                                        {/*Button event to assign tech*/}
                                        <div className="clearfix"><br/>
                                            <Button bsStyle="danger" onClick={this.closeDialogClick}>Close Dialog</Button>
                                            <Button className="pull-right" bsStyle="success" id={selectedTicket.id} onClick={this.assignTicketToTech}>Assign</Button>
                                        </div>
                                    </div>
                                )
                                }
                            </Jumbotron>
                        </Col>
                    )}
                </Row>
            </div>
        );
    }
}

export default Helpdesk;