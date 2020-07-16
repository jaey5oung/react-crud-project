import React, { useState, useCallback } from "react"
import Axios from "axios"
import { useDispatch } from "react-redux"
import { loginUser } from "../../../_actions/user_action"
import { withRouter } from "react-router-dom"

function LoginPage(props) {
  const dispatch = useDispatch()

  const [Email, setEmail] = useState("")
  const [Password, setPassword] = useState("")

  const onEmailHandler = (event) => {
    setEmail(event.currentTarget.value)
  }
  const onPasswordHandler = (event) => {
    setPassword(event.currentTarget.value)
  }
  const onSubmitHandler = (event) => {
    event.preventDefault() //페이지를 리프레쉬를 하는걸 방지하는것

    let body = {
      email: Email,
      password: Password,
    }
    //아래로그인성공후 시작페이지로 옮기는것 디스패치
    dispatch(loginUser(body)).then((response) => {
      if (response.payload.loginSuccess) {
        props.history.push("/")
      } else {
        alert('Error"')
      }
    })
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
      }}
    >
      <form style={{ display: "flex", flexDirection: "column" }} onSubmit={onSubmitHandler}>
        <label>Email</label>
        <input type="email" value={Email} onChange={onEmailHandler} />
        <label>Password</label>
        <input type="password" value={Password} onChange={onPasswordHandler} />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default withRouter(LoginPage)
