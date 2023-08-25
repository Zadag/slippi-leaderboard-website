import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState();
  const [message, setMessage] = useState();

  const fetchUsers = async () => {
    const data = await fetch("http://localhost:8080/users");
    const json = await data.json();
    const users = json.message;
    setUsers(users);
    console.log(users);
  };

  const updateUser = async (username) => {
    const response = await fetch(`http://localhost:8080/update-user`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: username }),
    });
    const data = await response.json();
    const message = `${data.message.username} updated!`;
    setMessage(message);
  };

  const handleClick = async (username) => {
    await updateUser(username);
  };

  useEffect(() => {
    fetchUsers();
  }, [message]);

  return (
    <>
      {message && <h1>{message}</h1>}
      {users &&
        users.map((user) => {
          return (
            <div key={user.id}>
              <p>
                {user.username} - {user.slippielo}
              </p>
              <button name="userId" onClick={() => handleClick(user.username)}>
                Update
              </button>
            </div>
          );
        })}
    </>
  );
}

export default App;
