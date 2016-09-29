'use strict'

const express = require('express')
const router = express.Router()

const volunteerModel = require('../model/volunteer_query')
const eventModel = require('../model/event_query')
// const testModel = require('../model/test_queries')

router.get('/', (req, res, next) => {
  volunteerModel.findAllVolunteers()
    .then((data) => {
      res.render('volunteer/volunteer', {
        data: data
      })
    })
})

router.get('/dashboard', (req, res, next)=>{
  if (!req.isAuthenticated()){
    res.redirect('/login/volunteer')
    return
  }
  let volData  = volunteerModel.findVolunteerbyID(req.user.id)
  let volEvents = eventModel.findEventbyVolID(req.user.id)
  Promise.all([volData, volEvents])
  .then((data) => {
    console.log(data);
    res.render('volunteer/dashboard_volunteer', {
      title: 'MEJC',
      volData:data[0],
      eventData:data[1]
    })
  })
})

router.get('/view/:id', (req, res, next) => {
  volunteerModel.findVolunteerbyID(req.params.id)
  .then(function(volunteer){
    res.render('volunteer/volunteer_single', {
      title: 'MEJC',
      volunteer: JSON.stringify(volunteer),
      volunteerRender: volunteer
    })
  })
})

router.get('/profile/new', (req, res, next) => {
  res.render('volunteer/profile_new_volunteer', {
    username: req.user.user_name
  })
})

router.post('/profile/new', (req, res, next) => {
  volunteerModel.updateVolunteerInfo(req.user.user_name, req.body)
    .then((data) => {
      res.redirect('/volunteer/dashboard')
    })
    .catch((err) => {
      console.error('Error caught in inserting into DB')
      next(err)
    })
})

router.get('/profile/update/:id', (req, res, next) => {
  volunteerModel.findVolunteerbyID(req.params.id)
    .then((volData) => {
      res.render('volunteer/profile_update_volunteer', {
        volData: volData
      })
    })
})

router.post('/profile/update/:id', (req, res, next) => {
  console.log('i got hit')
  if(req.isAuthenticated() && req.user.id === parseInt(req.params.id)){
    volunteerModel.updateVolunteerUser(req.params.id, req.body)
    .then(() => {
      res.redirect('/volunteer/dashboard')
    })
    .catch((err) => {
      console.error('Error caught in deleting user from DB')
      next(err)
    })
  } else {
    console.log('CAN\'T UPDATE A USER PROFILE ACCOUNT IF YOU\'RE NOT LOGGED IN OR AREN\'T THE USER!!!!')
    return
  }
})

router.get('/delete/:id', (req, res, next) => {
  if(req.isAuthenticated() && req.user.id === parseInt(req.params.id)){
    volunteerModel.deleteVolunteerUser(req.params.id)
    .then(() => {
      req.logout()
      res.redirect('/')
    })
    .catch((err) => {
      console.error('Error caught in deleting user from DB')
      next(err)
    })
  } else {
    console.log('CAN\'T DELETE AN ACCOUNT IF YOU\'RE NOT LOGGED IN OR AREN\'T THE USER!!!!')
    return
  }
})

// router.get('/test/searchc', (req, res, next) => {
//   testModel.filterVolunteerbyCause('LGBTQIA')
//   .then((data) => {
//     console.log(data)
//   })
// })
//
// router.get('/test/searchcc', (req, res, next) => {
//   testModel.filterVolunteerbyCause_City('LGBTQIA', 'Pueblo')
//   .then((data) => {
//     console.log(data)
//   })
// })

module.exports = router
