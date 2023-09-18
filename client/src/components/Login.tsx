import { useState, useEffect } from "react";

const Login = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleClick = async () => {
    const request = await fetch(
      "https://slippi-leaderboard.onrender.com/login",
      {
        credentials: "include",
      }
    );
    const data = await request.json();
    window.location.href = data.url;
  };

  // const checkLoggedInStatus = async () => {
  //   const request = await fetch("");
  //   const data = await request.json();
  // };

  useEffect(() => {
    setLoggedIn(false);
  }, []);

  return (
    (!loggedIn && (
      <>
        <h1>POC. Login with Discord below.</h1>
        <button onClick={handleClick}>Login</button>
        <button
          onClick={() =>
            (location.href = "https://slippi-leaderboard.onrender.com/home")
          }
        >
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
