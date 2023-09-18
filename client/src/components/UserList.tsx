import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type user = {
  id: string;
  username: string;
  slippielo: string;
};

function UserList() {
  const location = useLocation();
  const token = location.search.substring(6);
  console.log(token);
  console.log(location);
  const [users, setUsers] = useState<Array<user>>();
  const [message, setMessage] = useState<string>();
  //const [clientObj, setClientObj] = useState();

  const tokenCookie = document.cookie;
  console.log("cookie", tokenCookie);

  const fetchUsers = async () => {
    try {
      // no authorization required to get users
      const data = await fetch(
        "https://slippi-leaderboard.onrender.com/users",
        {
          credentials: "include",
        }
      );
      const json = await data.json();
      const users = json.message;
      setUsers(users);
      console.log(users);
    } catch (err) {
      console.error(err);
    }
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
    console.log(tokenCookie);
  };

  const updateUser = async (username: string) => {
    try {
      const response = await fetch(
        `https://slippi-leaderboard.onrender.com/update-user`,
        {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: username }),
        }
      );
      const data = await response.json();
      const message = `${data.message.username} updated!`;
      setMessage(message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = async (username: string) => {
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
