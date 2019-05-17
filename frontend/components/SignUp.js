import React from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import PasswordValidator from "password-validator";
import Error from "./ErrorMessage";
import { CURRENT_USER_QUERY } from "./User";
import { CreateWithFilesUpload } from "./abstractions/CreateWithFilesUpload";

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
    $organisation: String!
    $phone: String!
    $image: String!
    $largeImage: String!
  ) {
    signup(
      email: $email
      name: $name
      password: $password
      organisation: $organisation
      phone: $phone
      image: $image
      largeImage: $largeImage
    ) {
      id
      email
      name
      verificationEmailToken
    }
  }
`;

class SignUp extends CreateWithFilesUpload {
  state = {
    name: "",
    email: "",
    password: "",
    organisation: "",
    phone: "",
    image: "",
    largeImage: "",
    uploadError: "",
    validPassword: false,
    touchedPassword: false,
    readyToSubmit: false
  };

  readyToSubmit = () => {
    const {
      name,
      email,
      organisation,
      phone,
      validPassword,
      uploadError
    } = this.state;
    let readyToSubmit = true;
    if (!name || !email || !organisation || !phone || !validPassword)
      readyToSubmit = false;
    if (uploadError) readyToSubmit = false;
    this.setState({ readyToSubmit });
  };

  // TODO extract this method to ../lib/validatePassword
  validatePassword = e => {
    const schema = new PasswordValidator();
    schema
      .is()
      .min(8)
      .is()
      .max(100)
      .has()
      .lowercase()
      .has()
      .uppercase()
      .has()
      .digits()
      .has()
      .not()
      .spaces();

    this.setState({
      validPassword: schema.validate(e.target.value),
      touchedPassword: true
    });
  };

  render() {
    return (
      <Mutation
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        onCompleted={() => Router.push("/signupSuccess")}
      >
        {(signUpFunction, { error, loading }) => {
          return (
            <form
              method="post"
              onChange={this.readyToSubmit}
              onSubmit={async e => {
                e.preventDefault();
                await signUpFunction();
                this.setState({ name: "", email: "", password: "" });
              }}
            >
              <fieldset
                disabled={loading}
                aria-busy={loading}
                className="signup__fieldset"
              >
                <h2>Sign up for an account</h2>
                <Error error={error || { message: this.state.uploadError }} />
                <label>
                  Name
                  <input
                    required
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={this.state.name}
                    onChange={this.saveToState}
                  />
                </label>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={this.state.email}
                    onChange={this.saveToState}
                  />
                </label>
                <label>
                  Password
                  <input
                    required
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={this.state.password}
                    onBlur={this.validatePassword}
                    onChange={this.saveToState}
                  />
                  {!this.state.validPassword && this.state.touchedPassword
                    ? "Password should contain at least one letter, digit, uppercase, lowercase and to be at least 8 characters long"
                    : ""}
                </label>
                <label>
                  Organisation
                  <input
                    required
                    type="text"
                    name="organisation"
                    placeholder="Organisation"
                    value={this.state.organisation}
                    onChange={this.saveToState}
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    required
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={this.state.phone}
                    onChange={this.saveToState}
                  />
                </label>
                <label>
                  Avatar Picture
                  <input
                    required
                    type="file"
                    name="avatar"
                    onChange={this.uploadFile}
                  />
                </label>
                <button
                  type="submit"
                  disabled={!this.state.readyToSubmit && !this.state.image}
                >
                  Sign Up
                </button>
              </fieldset>
            </form>
          );
        }}
      </Mutation>
    );
  }
}

SignUp.propTypes = {};

export default SignUp;
export { SIGNUP_MUTATION };
