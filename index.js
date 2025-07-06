const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');
const config = require('./config/key');
const { auth } = require('./middleware/auth');

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended : true}));
// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/users/register', async (req, res) => {
    try {
        const user = new User(req.body);

        
        await user.save();  // 콜백 없이 await 사용

        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(400).json({ success: false, err });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        // 이메일로 사용자 찾기
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "존재하지 않는 EMAIL 입니다."
            });
        }

        // 비밀번호 비교
        const isMatched = await user.comparePassword(req.body.password);
        if (!isMatched) {
            return res.json({
                loginSuccess: false,
                message: "비밀번호가 일치하지 않습니다."
            });
        }

        // 토큰 생성
        const tokenUser = await user.genToken();

        // 쿠키에 토큰 저장 및 응답
        res.cookie("x_auth", tokenUser.token)
            .status(200)
            .json({ loginSuccess: true, userId: tokenUser._id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ loginSuccess: false, message: "서버 오류가 발생했습니다." });
    }
});

app.get('/api/users/auth', auth, async (req, res) => {
    res.status(200).json({
        _id : req.user._id,
        isAdmin : req.user.role === 0 ? false : true,
        isAuth : true,
        email : req.user.email,
        lastname : req.user.lastname,
        role : req.user.role,
        image : req.user.image
    })
});

app.get('/api/users/logout', auth, async (req, res) => {
    try {
        await User.findOneAndUpdate(
            { _id : req.user._id },
            { token : "" }
        );
        return res.status(200).send({ success : true });
    } catch (err) {
        return res.status(400).json({ success : false, err });
    }
})



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
