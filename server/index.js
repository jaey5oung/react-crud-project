const express = require("express") //익스프레스 모듈을 갖고온다 (require:요구하다)
const app = express() //새로운 함수를 만들어 새로운 익스프레스 앱을 만든다
const port = 4000 //포트는 아무렇게 해도 상관없다 4000포트를 백서버로 둔다
const bodyParser = require("body-parser")
const { User } = require("./models/User") //유저 모델에있는 정보를 가져오는것
const config = require("./config/key") //config에서 몽고키값을 가져온다
const cookieParser = require("cookie-parser")
const { auth } = require("./middleware/auth")

//바디파서가 클라이언트에서 오는 (밑에와같은)정보를 서버에서 분석해서 가져올수있게 해주는것  (urlencoded,json)
//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

//application/json
app.use(bodyParser.json())

app.use(cookieParser())

const mongoose = require("mongoose") //몽구스 다운이후 require로 몽구스를 불러와서 connect에 키값을 넣어준다
const { Router } = require("express")
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err))
//위에있는 4개의 use를쓰는이유는 이것을써야 이후에 에러를 방지할수있다
//그 뒤에 then,catch를쓰는것은 몽고디비가 연결이 잘되고있다를 알려주는것이구 안됬으면 catch로 에러를 잡아준다

app.get("/", (req, res) => res.send("i'm jaeyoung")) //익스프레스앱을 '/'(루트) 디렉토리에 넣으면 helloworld를 출력해주는것

app.get("/api/hello", (req, res) => {
  res.send("ㅎㅇ~")
})

//회원가입을 위한 라우터

app.post("/api/users/register", (req, res) => {
  //회원가입 할때 필요한 정보들을 클라이언트에서 가져오면 그것들을 데이터 베이스에 넣어 준다.
  //위에 유저모델로 갖고온것을 인스턴스로 만든다

  const user = new User(req.body) //req바디에 들어올수있는것은 위에 bodyParser가 있기떄문에가능하다 클라이언트에있는 정보들을 받아준다
  //여기서 세이브를 하기전에 비밀번호를 암호화 시켜줘야한다
  user.save((err, userInfo) => {
    //bodyPaser에있는정보들이 저장되는것 (몽고db메소드에서 오는것\)
    //<-콜백함수 저장할때 에러가있으면 클라이언트에 에러가있다고 전달해준다(json형식으로) 만약 성공을하면(userinfo를 클라이언트에다가 성공했다는 문구를 success로 전달한다)
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true,
    })
  })
})

//로그인 라우터!
app.post("/api/users/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다
  User.findOne({ email: req.body.email }, (err, user) => {
    //이 이메일을 가진 유저가 한명도없다면
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      })
    }
    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
      //비밀번호까지 맞다면 토큰을 생성하기
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err) //토큰을 저장한다 로컬에다 할수도있고 쿠키에다가 할수도있는데 지금은 쿠키에 진행한다

        res.cookie("x_auth", user.token).status(200).json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

//role 1  어드민     role 2 특정부서 어드민
//role 0 -> 일반유저  role 0이 아니면 관리자

app.get("/api/users/auth", auth, (req, res) => {
  //여기 까지 미들웨어를 통과해 왔다는 얘기는 Authentication 이 True 라는 말
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    emalli: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  })
})

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },

    { token: "" },
    (err, user) => {
      if (err) return res.json({ success: false, err })
      return res.status(200).send({
        success: true,
      })
    }
  )
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}!`)) //이후 포트4000으로 이앱을 실행시킨다 이 앱이 4000포트에 리슨을하면 이 콘솔이 프린트가 된다
