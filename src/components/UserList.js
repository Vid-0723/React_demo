import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Avatar from '@mui/material/Avatar';

function UserList() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [finalConversionValue, setFinalConversionValue] = useState([])
  const [offset, setOffset] = useState("")
  const [newData, setNewData] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paginationArray, setPaginationArray] = useState([])
  const [sort, setSort] = useState("asc")
  const key = 'user_id';
  const arrayUniqueByKey = [...new Map(finalConversionValue.map(item =>
    [item[key], item])).values()];

  //get user data from API
  const fetchUsers = async () => {
    setLoading(true)
    let url;
    if (offset === "" && users.length === 0) {
      url = `https://api.airtable.com/v0/apptGSwbv1I1JyXoD/Users?pageSize=9&sort%5B0%5D%5Bfield%5D=Id&sort%5B0%5D%5Bdirection%5D=${sort}&sort%5B1%5D%5Bfield%5D=Name&sort%5B1%5D%5Bdirection%5D=asc`
    } else if (offset !== "" && users.length > 0 && paginationArray.indexOf(offset) === -1) {
      url = `https://api.airtable.com/v0/apptGSwbv1I1JyXoD/Users?pageSize=9&sort%5B0%5D%5Bfield%5D=Id&sort%5B0%5D%5Bdirection%5D=${sort}&sort%5B1%5D%5Bfield%5D=Name&sort%5B1%5D%5Bdirection%5D=asc`
    }
    else if (offset !== "" && users.length > 0) {
      url = `https://api.airtable.com/v0/apptGSwbv1I1JyXoD/Users?pageSize=9&sort%5B0%5D%5Bfield%5D=Id&sort%5B0%5D%5Bdirection%5D=${sort}&sort%5B1%5D%5Bfield%5D=Name&sort%5B1%5D%5Bdirection%5D=asc&offset=${offset}`
    }
    else {
    }
    await axios.get(`${url}`, {
      headers: {
        Authorization: 'Bearer keyGR8j8fXBpOHrWP'
      }
    })
      .then(res => {
        if (res.status === 200) {
          const data = res.data.records
          let newArray = []
          for (let i = 0; i < data.length; i++) {
            newArray.push(data[i].fields)
          }
          setUsers(newArray)
          setNewData(false)
          setLoading(false)
          if (res.data.offset !== undefined) {
            setOffset(res.data.offset);
          } else {
            setOffset("")
          }
        }
      }).catch(err => {
        setNewData(false)
        setLoading(false)
        console.log(err)
        console.log("error");
      })
  }

  //get data from log
  const fetchLogs = async () => {
    await axios.get('https://assets.interviewhelp.io/INTERVIEW_HELP/reactjs/logs.json')
      .then(res => {
        if (res.status === 200) {
          let impression = [];
          let conversion = [];
          for (let i = 0; i < res.data.length; i++) {
            if (res.data[i].type === "conversion") {
              impression.push(res.data[i])
            }
            else {
              conversion.push(res.data[i])
            }
          }
          let groupedlogsss = groupBy(impression, 'user_id');
          function groupBy(objectArray, property) {
            return objectArray.reduce((acc, obj) => {
              const key = obj[property];
              acc[key] ??= [];
              acc[key].push(obj);
              return acc;
            }, {});
          }
          for (let i in groupedlogsss) {
            let sum = 0;
            for (let j in groupedlogsss[i]) {
              sum += groupedlogsss[i][j].revenue;
            }
            setFinalConversionValue(prevState => [...new Set([...prevState, { user_id: groupedlogsss[i][0].user_id, revenue: sum }])])
          }
        }
      }).catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [sort])

  useEffect(() => {
    if (offset === "" && users.length === 0) {
      fetchUsers()
    } else if (offset !== "" && users.length > 0 && newData === true) {
      fetchUsers()
    } else {
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newData])

  const handlePrev = () => {
    console.log(users.length);
    console.log(paginationArray.length);
    console.log(offset);
    setNewData(true)
    if (paginationArray === "undefined" || paginationArray.length === 0) {
      setOffset("")
    } else {
      paginationArray.pop();
      setOffset(paginationArray.slice(-1)[0]);
    }
  }

  const handleNext = () => {
    console.log(offset);
    setNewData(true)
    if (offset !== "") {
      setPaginationArray(prevState => [...new Set([...prevState, offset])])
    }
    else {
      setOffset(offset)
    }
  }

  return (
    <>
      <div className='bg-color'>
        <div class="container">
          <h3 className="text-center text-secondary mt-5 " >UserList Pages</h3>
          <div className="d-flex justify-content-end align-items-center ">
            <div class="form-group mx-sm-3">
              <input type="text" class="form-control" id="inputPassword2" placeholder="Searching..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button type="button" class="btn btn-secondary btn-md" onClick={() => setSort("asc")}>Ascending </button> &nbsp;
            <button type="button" class="btn btn-secondary btn-md" onClick={() => setSort("desc")}>Descending </button>
          </div>
          <div class="row">
            {loading && <div className="text-center"> <div className="spinner-border" style={{ width: "3rem", height: "3rem" }} role="status">
            </div></div>}
            {users.filter(user => {
              if (search === '') {
                return user
              } else if (user.Name.toLowerCase().includes(search.toLowerCase())) {
                return user
              }
            })
              .map((item, id) => {
                return (
                  <>
                    <div class="col-lg-4 mb-2 mt-3 " key={item}  >
                      <div className='main'>
                        <div className='row align-items-center'>
                          <div className='col-sm-3'>
                            <div><div>
                              <span>
                                <Avatar alt={item.Name} src={item.avatar} sx={{ height: "70px", width: "70px", fontSize: "25px", backgroundColor: "#6c757d" }} />
                              </span>
                            </div></div>
                          </div>
                          <div className='col-sm-9 '>
                            <h4 className="title-user">{id}{item.Name}</h4>
                            <p className='mb-0' style={{ fontSize: "14px" }}>{item.Id} {item.occupation}</p>
                          </div>
                        </div>
                        <div className='row text-end'>
                          <div className='impressions'>

                            {arrayUniqueByKey && arrayUniqueByKey.map((item1) => {
                              return (
                                <div>
                                  {item.Id === item1.user_id && <div>
                                    <h6 className='mb-0' style={{ color: "orange" }}>{item1.revenue}</h6>
                                  </div>}
                                </div>
                              )
                            })}
                            <p className='mb-0' style={{ color: "lightgray", fontSize: "13px" }}>impressions</p>
                          </div>
                        </div>
                        <div className='row text-end'>
                          <div className='impressions'>
                            <h6 className='mb-0' style={{ color: "#1e7fb3" }}>0</h6>
                            <p className='mb-0' style={{ color: "lightgray", fontSize: "13px" }}>conversions</p>
                          </div>
                        </div>
                        <div className='d-flex justify-content-between align-items-center'>
                          <div className='align-items-end'>
                            <h6 className="mb-0 ">conversion 4/12 - 4/30</h6>
                          </div>
                          <div>
                            <h3 style={{ color: "green", fontSize: "20px" }}>$53,982</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })}
            <div className='pagination-btn mt-3 mb-3 '>
              <button type="button" className="btn btn-secondary" disabled={paginationArray === ""} onClick={handlePrev}>Prev</button>&nbsp;&nbsp;
              <button type="button" className="btn btn-secondary" disabled={offset === ""} onClick={handleNext}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UserList
