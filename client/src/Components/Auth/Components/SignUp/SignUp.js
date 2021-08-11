import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SignForm from '../SignForm/SignForm';
import api from '../../../../Constants/APIEndpoints/APIEndpoints';
import Errors from '../../../Errors/Errors';
import PageTypes from '../../../../Constants/PageTypes/PageTypes';
import {Container, Row, Col} from 'react-bootstrap';

/**
 * @class
 * @classdesc SignUp handles the sign up component
 */
class SignUp extends Component {
    static propTypes = {
        setPage: PropTypes.func,
        setAuthToken: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            passwordConf: "",
            error: ""
        };

        this.fields = [
            {
                name: "Email Address",
                key: "email"
            },
            {
                name: "Password",
                key: "password"
            },
            {
                name: "Confirm Password",
                key: "passwordConf"
            },
            {
                name: "First Name",
                key: "firstName"
            },
            {
                name: "Last Name",
                key: "lastName"
            }
        ];
    }

    /**
     * @description setField will set the field for the provided argument
     */
    setField = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    /**
     * @description setError sets the error message
     */
    setError = (error) => {
        this.setState({ error })
    }

    /**
     * @description submitForm handles the form submission
     */
    submitForm = async (e) => {
        e.preventDefault();
        const { email,
            password,
            passwordConf,
            firstName,
            lastName
        } = this.state;
        const sendData = {
            email,
            password,
            passwordConf,
            firstName,
            lastName
        };
        const response = await fetch(api.base + api.handlers.users, {
            method: "POST",
            body: JSON.stringify(sendData),
            headers: new Headers({
                "Content-Type": "application/json"
            })
        });
        if (response.status >= 300) {
            const error = await response.text();
            this.setError(error);
            return;
        }
        const authToken = response.headers.get("Authorization")
        localStorage.setItem("Authorization", authToken);
        this.setError("");
        this.props.setAuthToken(authToken);
        const user = await response.json();
        this.props.setUser(user);
    }

    render() {
        const values = this.state;
        const { error } = this.state;
        return <>
            <Errors error={error} setError={this.setError} />

              <section className="left-half white-background">
                  <div className="container">
                    <h2>get started</h2>
                    <SignForm
                          setField={this.setField}
                          submitForm={this.submitForm}
                          values={values}
                          fields={this.fields} />
                  </div>
              </section>
              <div className="right-half">
                    <Container id="welcome">
                            <div className="centered-text white-text">
                                <h3>welcome to</h3>
                                <h1><b>verdancy</b></h1>
                                <h3>get ready to go green with us!</h3>
                            </div>
                    </Container>
              </div>
            {/* <button onClick={(e) => this.props.setPage(e, PageTypes.signIn)}>Sign in instead</button> */}
        </>
    }
}

export default SignUp;
