const { User } = require('../models/User');

// 인증 처리
let auth = async (req, res, next) => {
    try {
        // client cookie 에서 token을 가져옴
        let token = req.cookies.x_auth;
        // token 복호화 후 userid matching
        const user = await User.findByToken(token);

        if (!user) return res.json({ isAuth : false, error : true });

        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ isAuth : false, message: "인증 실패", error : err.message });
    }
}

module.exports = { auth };