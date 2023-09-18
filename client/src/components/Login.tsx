import { useState } from "react";

const Login = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  setLoggedIn(false);

  const handleClick = async () => {
    const request = await fetch("http://localhost:8080/login", {
      credentials: "include",
    });
    const data = await request.json();
    window.location.href = data.url;
  };

  // const checkLoggedInStatus = async () => {
  //   const request = await fetch("");
  //   const data = await request.json();
  // };

  return (
    (!loggedIn && (
      <>
        <h1>POC. Login with Discord below.</h1>
        <button onClick={handleClick}>Login</button>
        <button onClick={() => (location.href = "http://127.0.0.1:5173/home")}>
          test
        </button>
      </>
    )) || (
      <>
        <p>You are logged in!</p>
      </>
    )
  );
};

export default Login;
