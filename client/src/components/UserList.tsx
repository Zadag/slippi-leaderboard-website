import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function UserList() {
  const location = useLocation();
  const token = location.search.substring(6);
  console.log(token);
  console.log(location);
  const [users, setUsers] = useState();
  const [message, setMessage] = useState();
  //const [clientObj, setClientObj] = useState();

  const tokenCookie = document.cookie;
  console.log("cookie", tokenCookie);

  const fetchUsers = async () => {
    try {
      const data = await fetch("http://localhost:8080/users");
      const json = await data.json();
      const users = json.message;
      setUsers(users);
      console.log(users);
    } catch (err) {
      console.error(err);
    }
  };

  const testPost = async () => {
    const req = await fetch("http://localhost:8080/register", {
      headers: { Authorization: `Bearer ${tokenCookie}` },
    });

    const data = await req.json();
    console.log(data);
    console.log(tokenCookie);
  };

  // const fetchDiscUserObj = async () => {
  //   try {
  //     const data = await fetch("https://discord.com/api/users/@me", {
  //       headers: {
  //         authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const json = await data.json();
  //     setClientObj(json);
  //     console.log(json);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const updateUser = async (username) => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = async (username) => {
    await updateUser(username);
  };

  useEffect(() => {
    fetchUsers();
    // fetchDiscUserObj();
  }, [message]);

  return (
    <>
      {message && <h1>{message}</h1>}
      <button onClick={testPost}>test register</button>
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

export default UserList;
