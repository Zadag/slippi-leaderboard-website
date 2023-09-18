import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const navigate = useNavigate();
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

  const testPost = async () => {
    // authorization required register
    const req = await fetch(
      "https://slippi-leaderboard.onrender.com/register",
      {
        credentials: "include",
      }
    );

    const data = await req.json();
    console.log(data);
  };

  const handleNavigate = () => navigate("/home");

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
        <button onClick={handleNavigate}>test</button>
        <button onClick={testPost}>test</button>
      </>
    )) || (
      <>
        <p>You are logged in!</p>
      </>
    )
  );
};

export default Login;
