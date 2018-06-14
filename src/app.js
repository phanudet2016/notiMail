const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const firebase = require('firebase')
var nodemailer = require('nodemailer')
var dateFormat = require('dateformat')


const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

var config = {
  apiKey: "AIzaSyCnkwco1-0ZiC82eVmgsfhPYvF2ZrvEpZk",
  authDomain: "projectospital.firebaseapp.com",
  databaseURL: "https://projectospital.firebaseio.com",
  projectId: "projectospital",
  storageBucket: "projectospital.appspot.com",
  messagingSenderId: "969365951070"
};
firebase.initializeApp(config);
var showdata = []
var showdataUser = []
var showdataEqm = []
var historys = firebase.database().ref('history')
var equipments = firebase.database().ref('equipments')
var users = firebase.database().ref('users')

////////////////////////////////////////////////////////////////////////////////////////////////////////
users.on('child_changed', function (snapshot) { 
  let data = snapshot.val()
  data.id = snapshot.key
  var key = snapshot.key
  var index = showdataUser.findIndex(user => user.id === key)
  showdataUser.splice(index,1)
  showdataUser.push(data)
})

users.on('child_removed', function (snapshot) {
    var id = snapshot.key
    var index = showdataUser.findIndex(user => user.id === id)
    showdataUser.splice(index,1)
})

users.on('child_added', function (snapshot) {
  let item = snapshot.val()
  item.id = snapshot.key
  showdataUser.push(item)
})
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
equipments.on('child_changed', function (snapshot) { 
  let data = snapshot.val()
  data.id = snapshot.key
  var key = snapshot.key
  var index = showdataEqm.findIndex(equipment => equipment.id === key)
  showdataEqm.splice(index,1)
  showdataEqm.push(data)
})

equipments.on('child_removed', function (snapshot) {
    var id = snapshot.key
    var index = showdataEqm.findIndex(equipment => equipment.id === id)
    showdataEqm.splice(index,1)
})

equipments.on('child_added', function (snapshot) {
  let item = snapshot.val()
  item.id = snapshot.key
  showdataEqm.push(item)
})
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
historys.on('child_changed', function (snapshot) { 
  let data = snapshot.val()
  data.id = snapshot.key
  var key = snapshot.key
  var index = showdata.findIndex(history => history.id === key)
  showdata.splice(index,1)
  showdata.push(data)
})

historys.on('child_removed', function (snapshot) {
    var id = snapshot.key
    var index = showdata.findIndex(history => history.id === id)
    showdata.splice(index,1)
})

historys.on('child_added', function (snapshot) {
  let item = snapshot.val()
  item.id = snapshot.key
  showdata.push(item)
})
////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/posts', (req, res) => {
  res.send(
    [{
      title: "Hello World!",
      description: "Hi there! How are you?"
    }]
  )
  // วันที่ปัจจุบัน
  let now = new Date()
  let date = dateFormat(now, "m/d/yyyy")
  let dateNow = new Date(date).getTime()

  setTimeout(() => {
    for (let i = 0; i < showdata.length; i++) {
      let dateCheck = new Date(showdata[i].dateCheckReturn).getTime()
      let dateSendNotiFive = new Date(dateCheck).getTime() - 432000000 // set วันที่แจ้งเตือนก่อน 5 วัน
      let dateSendNotiThree = new Date(dateCheck).getTime() - 259200000 // set วันที่แจ้งเตือนก่อน 3 วัน
      let dateSendNotiOne = new Date(dateCheck).getTime() - 86400000 // set วันที่แจ้งเตือนก่อน 1 วัน

      let dateCheckRepair = new Date(showdata[i].dateCheckRepair).getTime()
      let dateSendRepairNotiFive = new Date(dateCheckRepair).getTime() - 432000000 // set วันที่แจ้งเตือนก่อน 5 วัน
      let dateSendRepairNotiThree = new Date(dateCheckRepair).getTime() - 259200000 // set วันที่แจ้งเตือนก่อน 3 วัน
      let dateSendRepairNotiOne = new Date(dateCheckRepair).getTime() - 86400000 // set วันที่แจ้งเตือนก่อน 1 วัน

      let dateCheckCalibrate = new Date(showdata[i].dateCheckCalibrate).getTime()
      let dateSendCalibrateNotiFive = new Date(dateCheckCalibrate).getTime() - 432000000 // set วันที่แจ้งเตือนก่อน 5 วัน
      let dateSendCalibrateNotiThree = new Date(dateCheckCalibrate).getTime() - 259200000 // set วันที่แจ้งเตือนก่อน 3 วัน
      let dateSendCalibrateNotiOne = new Date(dateCheckCalibrate).getTime() - 86400000 // set วันที่แจ้งเตือนก่อน 1 วัน
      // แจ้งเตือนส่งคืนจากผู้ยืม
      if (dateNow === dateSendNotiFive || dateNow === dateSendNotiOne || dateNow === dateSendNotiThree) {
        let email = showdata[i].email
        let idLend = showdata[i].idLend
        let firstname = showdata[i].firstname
        let lastname = showdata[i].lastname
        let department = showdata[i].department
        let nameEqm = showdata[i].nameEqm
        let dateReturn = showdata[i].dateCheckReturn

        let HelperOptions = {
          from: '"ADMIN_HOSPITAL" <admin_hospital@admin.com>',
          to: email,
          subject: 'แจ้งกำหนดการคืนอุปกรณ์ทางการแพทย์',
          html: 'เรียนคุณ ' + firstname + ' ' + lastname + '<br>' + ' แผนก ' + department + '<br><br>' + 'เลขที่การยืม ' + idLend + '<br>' + nameEqm + ' ครบกำหนดการคืนในวันที่ ' + dateReturn + ' กรุณานำอุปกรณ์มาส่งคืนภายในวันที่กำหนด'
        };
        if (showdata[i].status === 'ถูกยืม') {
          for (let j = 0; j < showdata[i].returnedDate.length; j++) {
            if (showdata[i].returnedDate[j].status === 'ยังไม่ส่งคืน') {
              sendEmail(HelperOptions)
              break
            }
          }
        }
      }
      // แจ้งเตือนส่งซ่อม /////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (dateNow === dateSendRepairNotiFive || dateNow === dateSendRepairNotiThree || dateNow === dateSendRepairNotiOne) {
        let emailRepair = showdata[i].email
        let idLendRepair = showdata[i].idLend
        let firstnameRepair = showdata[i].firstname
        let lastnameRepair = showdata[i].lastname
        let departmentRepair = showdata[i].department
        let nameEqmRepair = showdata[i].nameEqm
        let dateReturnRepair = showdata[i].dateCheckRepair

        let HelperOptions = {
          from: '"ADMIN_HOSPITAL" <admin_hospital@admin.com>',
          to: emailRepair,
          subject: 'แจ้งกำหนดการซ่อมบำรุงของอุปกรณ์ (Maintenance)',
          html: 'เรียนคุณ ' + firstnameRepair + ' ' + lastnameRepair + '<br>' + ' แผนก ' + departmentRepair + '<br><br>' + 'เลขที่การยืม ' + idLendRepair + '<br>' + nameEqmRepair + ' ถึงเวลาที่ต้องซ่อมบำรุงอุปกรณ์ (Maintenance) ในวันที่ ' + dateReturnRepair + ' กรุณานำอุปกรณ์มาส่งคืนภายในวันที่กำหนด'
        };
        if (showdata[i].status === 'ถูกยืม') {
          for (let j = 0; j < showdata[i].returnedDate.length; j++) {
            if (showdata[i].returnedDate[j].status === 'ยังไม่ส่งคืน') {
              sendEmail(HelperOptions)
              break
            }
          }
        }
      }
      // แจ้งเตือนตรวจเช็คความเรียบร้อย ////////////////////////////////////////////////////////////////////////////////////////////////////
      if (dateNow === dateSendCalibrateNotiFive || dateNow === dateSendCalibrateNotiOne || dateNow === dateSendCalibrateNotiThree) {
        let emailCalibrate = showdata[i].email
        let idLendCalibrate = showdata[i].idLend
        let firstnameCalibrate = showdata[i].firstname
        let lastnameCalibrate = showdata[i].lastname
        let departmentCalibrate = showdata[i].department
        let nameEqmCalibrate = showdata[i].nameEqm
        let dateReturnCalibrate = showdata[i].dateCheckCalibrate

        let HelperOptions = {
          from: '"ADMIN_HOSPITAL" <admin_hospital@admin.com>',
          to: emailCalibrate,
          subject: 'แจ้งกำหนดการตรวจเช็คความเรียบร้อยของอุปกรณ์ (Calibration)',
          html: 'เรียนคุณ ' + firstnameCalibrate + ' ' + lastnameCalibrate + '<br>' + ' แผนก ' + departmentCalibrate + '<br><br>' + 'เลขที่การยืม ' + idLendCalibrate + '<br>' + nameEqmCalibrate + ' ถึงเวลาที่ต้องตรวจเช็คความเรียบร้อยของอุปกรณ์ (Calibration) ในวันที่ ' + dateReturnCalibrate + ' กรุณานำอุปกรณ์มาส่งคืนภายในวันที่กำหนด'
        };
        if (showdata[i].status === 'ถูกยืม') {
          for (let j = 0; j < showdata[i].returnedDate.length; j++) {
            if (showdata[i].returnedDate[j].status === 'ยังไม่ส่งคืน') {
              sendEmail(HelperOptions)
              break
            }
          }
        }
      }
     }
     // แจ้งเตือนส่งซ่อมไปยัง ADMID
     for (let i = 0; i < showdataEqm.length; i++) {
       // แจ้งเตือนส่งซ่อม
      let dateCheckRepairAM = new Date(showdataEqm[i].dateCheckRepair).getTime()
      let dateSendRepairNotiFiveAM = new Date(dateCheckRepairAM).getTime() - 432000000 // set วันที่แจ้งเตือนก่อน 5 วัน
      let dateSendRepairNotiThreeAM = new Date(dateCheckRepairAM).getTime() - 259200000 // set วันที่แจ้งเตือนก่อน 3 วัน
      let dateSendRepairNotiOneAM = new Date(dateCheckRepairAM).getTime() - 86400000 // set วันที่แจ้งเตือนก่อน 1 วัน
      // แจ้งเตือนตรวจเช็คความเรียบร้อย
      let dateCheckCalibrateAM = new Date(showdataEqm[i].dateCheckCalibrate).getTime()
      let dateSendCalibrateNotiFiveAM = new Date(dateCheckCalibrateAM).getTime() - 432000000 // set วันที่แจ้งเตือนก่อน 5 วัน
      let dateSendCalibrateNotiThreeAM = new Date(dateCheckCalibrateAM).getTime() - 259200000 // set วันที่แจ้งเตือนก่อน 3 วัน
      let dateSendCalibrateNotiOneAM = new Date(dateCheckCalibrateAM).getTime() - 86400000 // set วันที่แจ้งเตือนก่อน 1 วัน
      // แจ้งเตือนส่งซ่อม ADMID //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      if (dateNow === dateSendRepairNotiFiveAM || dateNow === dateSendRepairNotiThreeAM || dateNow === dateSendRepairNotiOneAM) {
        let nameEqmRepairAM  = showdataEqm[i].nameEqm
        let dateReturnRepairAM  = showdataEqm[i].dateCheckRepair

        for (let j = 0; j < showdataUser.length; j++) {
          if (showdataUser[j].status === 'admin') {
            let emailAm = showdataUser[j].email
            let firstnameRepairAm = showdataUser[j].firstname
            let lastnameRepairAM = showdataUser[j].lastname   
            let departmentAM = showdataUser[j].department

            let HelperOptions = {
              from: '"ADMIN_HOSPITAL" <admin_hospital@admin.com>',
              to: emailAm,
              subject: 'แจ้งกำหนดการซ่อมบำรุงของอุปกรณ์ (Maintenance)',
              html: 'เรียนคุณ ' + firstnameRepairAm + ' ' + lastnameRepairAM + '<br>' + ' แผนก ' + departmentAM + '<br><br>' + nameEqmRepairAM + ' ถึงเวลาที่ต้องซ่อมบำรุงอุปกรณ์ (Maintenance) ในวันที่ ' + dateReturnRepairAM + ' กรุณานำอุปกรณ์ส่งซ่อมบำรุงด้วย'
            };
            sendMailRepair(HelperOptions)
          }
        }
      }
      // แจ้งเตือนตรวจเช็คความเรียบร้อย ADMID /////////////////////////////////////////////////////////////////////////////////////////////////////
      if (dateNow === dateSendCalibrateNotiFiveAM || dateNow === dateSendCalibrateNotiThreeAM || dateNow === dateSendCalibrateNotiOneAM) {
        let nameEqmCalibrateAM  = showdataEqm[i].nameEqm
        let dateReturnCalibrateAM  = showdataEqm[i].dateCheckCalibrate

        for (let j = 0; j < showdataUser.length; j++) {
          if (showdataUser[j].status === 'admin') {
            let emailAm = showdataUser[j].email
            let firstnameCalibrateAm = showdataUser[j].firstname
            let lastnameCalibrateAM = showdataUser[j].lastname   
            let departmentAM = showdataUser[j].department

            let HelperOptions = {
              from: '"ADMIN_HOSPITAL" <admin_hospital@admin.com>',
              to: emailAm,
              subject: 'แจ้งกำหนดการตรวจเช็คความเรียบร้อยของอุปกรณ์ (Calibration)',
              html: 'เรียนคุณ ' + firstnameCalibrateAm + ' ' + lastnameCalibrateAM + '<br>' + ' แผนก ' + departmentAM + '<br><br>' + nameEqmCalibrateAM + ' ถึงเวลาที่ต้องตรวจเช็คความเรียบร้อยของอุปกรณ์ (Calibration) ในวันที่ ' + dateReturnCalibrateAM + ' กรุณานำอุปกรณ์ตรวจเช็คความเรียบร้อยของอุปกรณ์ด้วย'
            };
            sendMailRepair(HelperOptions)
          }
        }
      }
     }
  },5000)
  
  // sendEmail()
})

function sendEmail(HelperOptions) {
  // sendEmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
      user: '5706021622141@fitm.kmutnb.ac.th',
      pass: '08486787bg'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  // let HelperOptions = {
  //   from: '"Beer" <5706021622141@fitm.kmutnb.ac.th>',
  //   to: 'panudach_beer_2012@hotmail.co.th',
  //   subject: '555',
  //   text: 'GGGG'
  // };
  
  transporter.sendMail(HelperOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("The message was sent!");
      console.log(info);
  })
}
////////////////////////////////////////////////////////////////////////
function sendMailRepair(HelperOptions) {
  // sendEmail
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
      user: '5706021622141@fitm.kmutnb.ac.th',
      pass: '08486787bg'
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  // let HelperOptions = {
  //   from: '"Beer" <5706021622141@fitm.kmutnb.ac.th>',
  //   to: 'panudach_beer_2012@hotmail.co.th',
  //   subject: '555',
  //   text: 'GGGG'
  // };
  
  transporter.sendMail(HelperOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("The message was sent!");
      console.log(info);
  })
}
app.listen(process.env.PORT || 8081)