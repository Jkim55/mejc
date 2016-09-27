'use strict'

const express = require('express');
const router = express.Router();

const passportVol = require('../passportVol')
const passportOrg = require('../passportOrg')
const bcrypt = require('bcrypt')

const indexModel = require('../model/index_query');
const volunteerModel = require('../model/volunteer_query');
const organizationModel = require('../model/organization_query');


/* GET splash page. */
router.get('/', (req, res, next) => {
  res.render('index/index', { title: 'MEJC' });
});

router.get('/register', (req,res,next) => {
  res.render('index/register');
});

router.get('/register/volunteer', (req,res,next) => {
  res.render('index/register_volunteer');
});

router.post('/register/volunteer', (req, res, next) => {
  indexModel.countofVolUser(req.body.user_name)
    .then((num) => {
      console.log('num is: ', num, 'num.count is: ', num[0].count)
      if (parseInt(num[0].count) > 0){
        res.render('error', {message: 'Username is taken.'})
      } else {
        let userData = {
          user_name: req.body.user_name,
          password: bcrypt.hashSync(req.body.password, 8),      // passwords are never stored in plain text
          email: req.body.email
        }
        indexModel.addVolunteer(userData)
          .then(() =>{
            res.redirect('/login/volunteer')
          })
          .catch((err) => {
            console.log(err)
            res.render('error', {message: 'error in inserting user data into database'})
          })
      }
    })
})

router.get('/register/organization', (req,res,next) => {
  res.render('index/register_organization');
});

router.post('/register/organization', (req, res, next) => {
  indexModel.countofOrgUser(req.body.user_name)
    .then((num) => {
      console.log('num is: ', num, 'num.count is: ', num[0].count)
      if (parseInt(num[0].count) > 0){
        res.render('error', {message: 'Username is taken.'})
      } else {
        let userData = {
          user_name: req.body.user_name,
          password: bcrypt.hashSync(req.body.password, 8),      // passwords are never stored in plain text
          email: req.body.email
        }
        indexModel.addOrganization(userData)
          .then(() =>{
            res.redirect('/login/organization')
          })
          .catch((err) => {
            console.log(err)
            res.render('error', {message: 'error in inserting user data into database'})
          })
      }
    })
})

router.get('/login', (req,res,next)=>{
  res.render('index/login');
});

router.get('/login/volunteer', (req,res,next) => {
  res.render('index/login_volunteer');
});

router.get('/login/organization', (req,res,next) => {
  res.render('index/login_organization');
});


router.post('/login/volunteer', passportVol.authenticate('local', {
  successRedirect:'/dashboard/volunteer',
  failureRedirect:'/login/volunteer'
}));

router.post('/login/organization', passportOrg.authenticate('local', {
  successRedirect:'/dashboard/organization',
  failureRedirect:'/login/organization'
}));



// NEED TO FLESH OUT - partially completed; don't work
router.get('/dashboard/volunteer', (req, res, next)=>{
  if (!req.isAuthenticated()){
    res.redirect('/login/volunteer');
    return;
  }
// find dashboard info for specific volunteer
volunteerModel.findVolunteerbyID(req.user.id) // hardcoded for testing
  .then((data) => {
    res.render('index/dashboard_volunteer')
      // render per object
  })
});

// NEED TO FLESH OUT - partially completed; don't work
router.get('/dashboard/organization', (req, res, next)=>{
  // if (!req.isAuthenticated()){
  //   res.redirect('/login/organization');
  //   return;
  // }
// find dashboard info for specific organization
// indexModel.findOrganizationbyID(id)
organizationModel.findOrganizationbyID(1) // hardcoded for testing
  .then((data) => {
    res.render('index/dashboard_organization', {
      // render per object
    })
  })
});


router.get('/logout', (req,res,next) => {
  if(req.isAuthenticated()){
    req.logout();
    res.redirect('/')
  }
});

// function authenticateVolunteer(username, password){
//   return findVolunteerUsername(username)
//   .then(function(userData){
//     if(!userData){
//       return false;
//     }
//     return findVolunteerHashedPassword(username)
//     .then(function(hashedPassword){
//       hashedPassword = hashedPassword.password;
//       return bcrypt.compareSync(password, hashedPassword);
//     });
//   });
// }

module.exports = router;
