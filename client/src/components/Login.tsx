const Login = () => {
  const handleClick = async () => {
    const request = await fetch("http://localhost:8080/login");
    const data = await request.json();
    console.log(data);
    window.location.href = data.url;
  };

  return (
    <>
      <h1>POC. Login with Discord below.</h1>
      <button onClick={handleClick}>Login</button>
    </>
  );
};

export default Login;
