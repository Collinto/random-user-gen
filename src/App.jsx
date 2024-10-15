import { useState, useCallback, useEffect } from 'react'
import './App.css';
import axios from "axios";
import debounce from "lodash.debounce"

const filterUserData = (searchParameters, userData) => {
  let filtered = userData;

  const { searchParameter, nationality, fromDate, toDate } = searchParameters;

  if (searchParameter) {
    filtered = filtered.filter(
      (user) =>
        user.login.username
          .toLowerCase()
          .includes(searchParameter.toLowerCase().trim()) ||
        user.email.toLowerCase().includes(searchParameter.toLowerCase().trim()),
    );
  }

  if (nationality) {
    filtered = filtered.filter((user) => user.nat === nationality);
  }

  if (fromDate) {
    filtered = filtered.filter(
      (user) => new Date(user.dob.date) >= new Date(fromDate),
    );
  }

  if (toDate) {
    filtered = filtered.filter(
      (user) => new Date(user.dob.date) <= new Date(toDate),
    );
  }

  return filtered;
};

function App() {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [nationalities, setNationalities] = useState([]);

  const [searchParameters, setSearchParameters] = useState({});

  const [debouncing, setDebouncing] = useState(false); // This manages the debounce state 

  const handleInput = (e) => {
    setSearchParameters({
      ...searchParameters,
      [e.target.name]: e.target.value,
    });
  };


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://randomuser.me/api/?results=50",
        );
        setUserData(response.data.results);
        setFilteredUsers(response.data.results);

        const nationalitySet = new Set(); // This is for the options of different Nationalities
        response.data.results.forEach(user => {
          nationalitySet.add( user.nat);
        });
        setNationalities([...nationalitySet])

      } catch (error) {
        setError(error)
        console.log("Error Fetching User Data: ", error.message)
      }
      finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const debouncedFilter = useCallback(
    debounce(() => {
      setFilteredUsers(filterUserData(searchParameters, userData));
      setDebouncing(false);
  }, 1000), 
[searchParameters, userData]
); 

  useEffect(() => {
    setFilteredUsers([]);
    setDebouncing(true);
      debouncedFilter();
      return () => {
        debouncedFilter.cancel(); // To cancel the debounce function when component unmounts
      };
    }, 
  [searchParameters, userData, debouncedFilter]);


  if (loading) {
    return (
      <div className="App">
        {" "}
        <h1 className="load">LOADING...</h1>{" "}
        {/* <Ebuy className="eb" /> */}
      </div>
    );
  }
  if (Error) {
    return (
      <div className="App">
        {" "}
        <h1 className="load">Error: {Error.message}</h1>{" "}
      </div>
    );
  }

  return (
    <div className="App">
    <h1>Random User App</h1>

    <div className="top">
      <div className="search">
        <input
          type="text"
          id="user"
          placeholder="Username or Email"
          className="username"
          value={searchParameters.searchParameter || ""}
          name="searchParameter"
          onChange={handleInput}
        />
      </div>

      <div className="sect">
        <div>
          <label htmlFor="nat" className="label">
            Filter by Nationality:{" "}
          </label>
          <select
            id="nat"
            onChange={handleInput}
            value={searchParameters.nationality || ""}
            name="nationality"
          >
            <option value="">All Nationalities</option>
            {nationalities.map((nat) => <option key={nat} value={nat}>
              {nat}
            </option>)}
          </select>
        </div>

        <div>
          <div className="filter">
            <label className="label" htmlFor="fromDate"> Filter by Date of Birth: </label>

            <div>
              <label htmlFor="fromDate"> From : </label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={searchParameters.fromDate || ""}
                onChange={handleInput}
              />
            </div>

            <div>
              <label htmlFor="toDate">To: </label>
              <input
                type="date"
                id="toDate"
                name="toDate"
                value={searchParameters.toDate || ""}
                onChange={handleInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="main">
      <div className="userCount">
        Number of users: <span className="count">{filteredUsers.length}</span>
      </div>
      <div className="container">
        {debouncing ? (<h1>Getting Users...</h1>
        ) :  filteredUsers.length > 0 ? (
        filteredUsers.map((user) => (
          <div className="card" key={user.email}>
            <img
              className="img"
              src={`${user.picture.thumbnail}`}
              alt={`${user.name.first} ${user.name.last}`}
            />
            <p className="name">{`${user.name.first} ${user.name.last}`}</p>
            <p>
              <span>Date of Birth:</span>{" "}
              {new Date(`${user.dob.date}`).toLocaleDateString()}
            </p>
            <p>
              {" "}
              <span>Email: </span>
              {`${user.email}`}
            </p>
            <p>
              <span>Nationality: </span>
              {`${user.nat}`}
            </p>
          </div>
        ))
      ) : (
        <h1>No User Found.</h1>
      )}
      </div>
    </div>

  </div>
  )
}

export default App
