const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const users = [
{
    id: 0,
    mail: "1",
    password: "1",
    name: "Администратор",
    age:"24",
    tokens: ['92a39003-cb5c-42a9-a2bf-bd785e99cd9b'],

},
{
    id: 1,
    mail: "2@mail.ru",
    password: "2",
    name: "Наталья К",
    age:"25",
    tokens: ['d7973c0b-cbad-4740-925b-e8507e53b5e1'],
},
{
  id: 2,
  mail: "3@mail.ru",
  password: "3",
  name: "Виталий Ю",
  age:"25",
  tokens: ['d7973c0b-czad-4740-925b-e8507e53b5e1'],
},
{
  id: 3,
  mail: "4@mail.ru",
  password: "3",
  name: "Николай Б",
  age:"25",
  tokens: ['d7973c0b-czad-4740-925b-e8507e53b5e1'],
},
{
  id: 4,
  mail: "5@mail.ru",
  password: "3",
  name: "Матвей З 4 юзер",
  age:"35",
  tokens: ['d7923c0b-czad-4740-925b-e8507e53b5e1'],
}
]

const Friends = [
{
    one: 0,
    two: 1,
    status: "ACCEPTED",
},
{
  one: 2,
  two: 0,
  status: "REQUEST",
},
{
  one: 0,
  two: 3,
  status: "ACCEPTED",
}
] 

const app = express();
 
app.use(bodyParser.json());
app.use(cors())
 
const authorizationHandler = (req, res, next) => {
    const token = req.headers.authorization; 
    if (token !==  'Bearer') {
        res.json({
            message: "Bad token type"
        });
        return
    }
 
const parsedToken = token.replace('-token', '');
const user = users.find(item => item.mail === parsedToken);
 
if (!user) {
    res.json({
        message: "Bad token"
    })
} else {
    req.locals = {
        user,
    };
    next();
}
};
 

app.get("/users", (request, response) => {
  return response.json({
    friends: users
  });
})
app.post("/register/", (request, response) => {
    const name = request.body.name;
    const age = request.body.age;
    const mail = request.body.mail;
    const password = request.body.password2;
    const confirmPassword = request.body.confirmPassword2;
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);

    if (!name || !age || !mail || !password || !confirmPassword) {
      return response.json({
        status:0,
        message: "Некоторое из полей не заполнено", 
      })
    }
    if (!pattern.test(mail)) {
      return response.json({
        status:0,
        message: "Неверная почта"
      })
    }
    if (password !== confirmPassword) {
      return response.json({
        status:0,
        message: "Пароли не совпадают"
      })
    }
    const checkmail = users.find(item => item.mail === mail);
    if (checkmail) {
        return response.json({
          status:0,
          message: "Пользователь с такой почтой существует"
        })
      }
    const id =  users.length
    const user = {
      id,
      name,
      age,
      mail,
      password,
      tokens: [],

    };
    users.push(user);
    response.json({
      user,
      id,
      status:1,
      message: user,
    });
  })


app.post('/auth/',(req, response) => {
    
    
    const email = req.body.email;
    const password = req.body.password;
    
    const user = users.find(item => item.mail == email && item.password === password);
    if (!user) { return response.json({ status:0, message: "Bad authorization."}); }
    
    const token = uuidv4();

    user.tokens.push(token);
  
    response.json({
      name:user.name,
      status:1,
      message: "Authorization succeed.",
      token:token,
    })
  })
app.get("/me", async (request, response) => {
    const authorization = request.headers.authorization;
    const user = users.find(user => !!user.tokens.find(token => token === authorization));
  
    if (!user) {
      return response.json({
        status:0,
        message: "Token not valid"
      });
    }
    const meid = users.findIndex(user => !!user.tokens.find(tokens2 => tokens2 === authorization))
    return response.json({
      status:1,
      ProfileName: user.name,
      ProfileAge: user.age
  });
  })

  app.get("/logout", async (request, response) => {
    const authorization = request.headers.authorization;
    const user = users.find(user => !!user.tokens.find(token => token === authorization));
  
    if (!user) {
      return response.json({
        status: 0
      });
    }
    return response.json({
      status: 1
  });
  })

  app.get("/friends", async (req, res) => {
    const authorization = req.headers.authorization;
    const user = users.find(user => !!user.tokens.find(token => token === authorization));
  
    if (!user) {
      return res.json({
        status:0,
        message: "Token not valid"
      });
    }

    const meid = users.findIndex(user => !!user.tokens.find(tokens2 => tokens2 === authorization))
    var values = Friends.filter(function(obj) {
      let retval;
      if(obj.one === meid && obj.status === "ACCEPTED" || obj.two === meid && obj.status === "ACCEPTED")
      { 
        retval = obj; 
        if(obj.one === meid) { retval['friend'] = users[obj.two].name }
        if(obj.two === meid) { retval['friend'] = users[obj.one].name }
      }
      return retval;
  });
    return res.json({
      statusf:1,
      friends:values
  });
})
  app.get("/friends/request", (req, res) => {
  const authorization = req.headers.authorization;
  const user = users.find(user => !!user.tokens.find(token => token === authorization));

  if (!user) {
    return res.json({
      status:0,
      message: "Token not valid"
    });
  }

  const meid = users.findIndex(user => !!user.tokens.find(tokens2 => tokens2 === authorization))
  var values = Friends.filter(function(obj) {
    let retval;
    if(obj.one === meid && obj.status === "REQUEST" || obj.two === meid && obj.status === "REQUEST")
    { 
      retval = obj; 
      if(obj.one === meid) { retval['friend'] = users[obj.two].name }
      if(obj.two === meid) { retval['friend'] = users[obj.one].name }
    }
    return retval;
});
  return res.json({
    statusf:1,
    friends:values
});
})

app.post("/friends/addfriend/", async (req, res) => {
  const authorization = req.headers["authorization"];
  const friendid = req.body.friendid;
  const user = users.find(user => !!user.tokens.find(token => token === authorization));
  let response;
  if (!user) {
    return res.json({
      status:0,
      message: "Token not valid"
    });
  }

  const meid = users.findIndex(user => !!user.tokens.find(tokens2 => tokens2 === authorization))
  if(friendid === meid) {
    response = {status: 0, message: "Нельзя отправить заявку самому себе"}
    return res.json({
      info:response
  });
  }
  const friendwith = Friends.find(friend => friend.one === meid && friend.two === friendid || friend.two === meid && friend.one === friendid);
  if(friendwith)
  {
    var values = Friends.filter(function(obj) 
    {
      if(obj.two === meid && obj.one === friendid && obj.status === "REQUEST") // если человек отправил нам заявку
      { 
        obj.status = "ACCEPTED";
        response = {status: 1, message: "Успешно добавлен новый друг "}
      }
      if(obj.one === meid && obj.two === friendid && obj.status === "REQUEST" || obj.one === meid && obj.two === friendid && obj.status === "ACCEPTED" || obj.one === friendid && obj.two === meid && obj.status === "ACCEPTED")
      { 
        if(obj.status === "ACCEPTED"){ response = {status: 0, message: "Человек уже в списке Ваших друзей"}}
        else{ response = {status: 0, message: "Вы уже отправили заявку в друзья этому человеку"} }
      }
      return response;
    });
  }
  if(!friendwith) { 
    const newfriends = {
      one:meid,
      two:friendid,
      status:"REQUEST",
    };
    Friends.push(newfriends); 
    response = "Новая заявка в друзья создана"
  }
  return res.json({
    info:response
});
})

app.get("/uusers", (request, response) => {
  return response.json({
    users:users
});
})

 
app.listen(6060, () => console.log("Started."))