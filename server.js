require('dotenv').config()
const express=require('express');
const jwt=require('jsonwebtoken')
const app=express();

app.use(express.json());

const posts=[{
    userName:'ayush',
    title:'post1'
},{
    userName:'anand',
    title:'post2'
}]

app.get('/posts',authenticateToken,(req,res)=>{
    res.json(posts.filter(post=>post.username===req.user.name));

})

let refreshTokens=[]

app.post('/token',(req,res)=>{
    const refreshToken=req.body.token
    if (refreshToken==null){
        return res.sendStatus(401)
    }
    if(!refreshTokens.includes(refreshToken))return res.sendStatus(403)
    jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403)
        const accessToken=generateAccessToken({name:user.name})
        res.json({accessToken:accessToken})

    })
})

app.post('/login',(req,res)=>{

   
    const username=req.body.username
    const user={name:username}

    const accessToken=generateAccessToken(user);
    const refreshToken=jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({accessToken:accessToken,refreshToken:refreshToken})

})


function authenticateToken(req,res,next){
    const authHeader=req.headers['authorization']
    const token=authHeader && authHeader.split(' ')[1]
    if (token==null) return res.sendStatus(401)

    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user=user
        next()
    })

}

function generateAccessToken(user){
    return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'20s'})
}

app.delete('/logout',(req,res)=>{
    refreshTokens=refreshTokens.filter(token=>token!=req.body.token);
    res.sendStatus(204);
})

app.listen(3000,()=>{
    console.log('server up and running at port 3000')
});
