import React, { useState } from "react";
import axios from "axios";
import { useAuthState } from "../utils/state";
import { useHistory } from "react-router-dom";

function Login() {
  let history = useHistory();
  const [state, dispatch] = useAuthState();

  const [userState, setState] = useState({
    email: "",
    password: "",
  });

  const onChange = (e) => {
    setState({ ...userState, [e.target.name]: e.target.value });
  };

  const loginFormHandler = async (event) => {
    event.preventDefault();

    if (userState.email && userState.password) {
      const response = await axios.post("/api/users/login", {
        email: userState.email,
        password: userState.password,
      });

      console.log("response", response);

      if (response.data.message === "You are now logged in!") {
        console.log("success!");
        dispatch({
          type: "LOGIN",
          payload: { user: response.data.user.id },
        });
        console.log(state);
        history.push("/profile");
      } else {
        alert(response.data.message);
      }
    }
  };

  const signupFormHandler = async (event) => {
    event.preventDefault();

    if (userState.name && userState.email && userState.password) {
      if (userState.password.length >= 8) {
        const response = await axios.post("/api/users", {
          name: userState.name,
          email: userState.email,
          password: userState.password,
        });

        console.log(response);

        if (response.status === 200) {
          console.log("Account created successfully!");
          axios.post("/api/mailer", {
            userData: {
              name: userState.name,
              email: userState.email,
            },
          });
          dispatch({
            type: "LOGIN",
            payload: { user: response.data.id },
          });
          console.log(state);
          history.push("/profile");
        } else {
          alert(response.statusText);
        }
      } else {
        alert("Password must be at least 8 characters");
      }
    } else {
      alert("Please fill out name, email, & password fields");
    }
  };

  React.useEffect(() => {
    console.log(state);
  }, [state]);
  return (
    <div
      className="container-flex"
      id="loginpic"
      style={{
        backgroundImage: "url(/images/BadHabitsBG.jpg)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="row">
        <br />
        <div className="col-md">
          <h2 style={{ paddingLeft: "10px" }}>Login</h2>

          <form
            className="form login-form"
            onSubmit={(e) => loginFormHandler(e)}
          >
            <div className="form-group">
              <label for="email-login">E-mail:</label>
              <input
                className="form-input"
                type="text"
                id="email-login"
                name="email"
                onChange={(e) => onChange(e)}
                style={{ float: "right" }}
              />
            </div>
            <br />
            <div className="form-group">
              <label for="password-login">Password:</label>
              <input
                className="form-input"
                type="password"
                id="password-login"
                name="password"
                onChange={(e) => onChange(e)}
                style={{ float: "right" }}
              />
            </div>
            <br />
            <div className="form-group">
              <button
                className="btn btn-primary"
                type="submit"
                style={{ placeSelf: "center" }}
              >
                Login
              </button>
            </div>
          </form>

          <br />

          <br />
          <div className="col-md" style={{ paddingBottom: "60px" }}>
            <h2 style={{ paddingLeft: "10px" }}>Sign Up</h2>

            <form
              className="form signup-form"
              onSubmit={(e) => signupFormHandler(e)}
            >
              <div className="form-group" style={{ paddingBottom: "10px" }}>
                <label for="name-signup">Name:</label>
                <input
                  className="form-input"
                  type="text"
                  id="name-signup"
                  name="name"
                  onChange={(e) => onChange(e)}
                  style={{ float: "right" }}
                />
              </div>

              <div className="form-group">
                <label for="email-signup">Email:</label>
                <input
                  className="form-input"
                  type="text"
                  id="email-signup"
                  name="email"
                  onChange={(e) => onChange(e)}
                  style={{ float: "right" }}
                />
              </div>
              <br />
              <div className="form-group">
                <label for="password-signup">Password:</label>
                <input
                  className="form-input"
                  type="password"
                  id="password-signup"
                  name="password"
                  onChange={(e) => onChange(e)}
                  style={{ float: "right" }}
                />
              </div>
              <br />
              <div
                className="form-group"
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <button className="btn btn-primary" type="submit">
                  Sign Up
                </button>
              </div>
            </form>
          </div>
          <br />
        </div>
      </div>
    </div>
  );
}

export default Login;
