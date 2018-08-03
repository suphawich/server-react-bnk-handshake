const express = require('express')
const firebase = require("firebase")
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3001

const config = {
  apiKey: "AIzaSyAZ7Gyvslxm20aSsh7pVIivqCJ7-JYnA9I",
  authDomain: "react-bnk.firebaseapp.com",
  databaseURL: "https://react-bnk.firebaseio.com",
  projectId: "react-bnk",
  storageBucket: "react-bnk.appspot.com",
  messagingSenderId: "211102279711"
}
firebase.initializeApp(config)

// const db = firebase.firestore()
const db = firebase.database()
const settings = {/* your settings... */ timestampsInSnapshots: true };
// db.settings(settings);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/api/data/members', (req, res) => {
  // let members = req.body.members
  // console.log(members)
  const send = (data) => { res.send(data) }
  // if (members.length > 0) {
  //   getRound(members, send)
  // } else {
  //   send([])
  // }

  getMembersFirebase(send)
  // res.send('request GET /api/data/members, DONE.')
  
})

const getRound = (members, callback) => {
  
  // let memberRef = db.collection('members').where('nickname', '==', nickname)
  let hsRef = db.collection('3rd_handshake').where('date', '==', new Date('Aug 18, 2018'))

  hsRef.get().then(snapshot => {
    let data = []
    snapshot.forEach(doc => {
      let memberRef = doc.data().member_ref
      memberRef.get().then(member => {
        if (members.includes(member.data().nickname)) {
          // data[member.id] = {nickname: member.data().nickname, rounds: doc.data().rounds}
          data.push({nickname: member.data().nickname, rounds: doc.data().rounds})
          // console.log(data)
          // console.log(members[members.length -1])
          if (members[members.length-1] === member.data().nickname) {
            callback(data)
          }
        }
      })
    })
    
  })
  .catch(err => {
    console.log('Error getting documents', err);
  })
  
}

app.get('/api/members', (req, res) => {
  const send = (data) => { res.send(data) }
  // getMembers(send)
  getMembersFirebase(send)

  console.log('Get All members from Cloud Firestore successfully.')
  // res.send('Get Members gen '+ gen +' from Cloud Firestore successfully.')
  // res.send(a)
})

app.get('/api/getGen/:gen', (req, res) => {
  let gen = parseInt(req.params.gen)
  if (isNaN(gen)) {
    res.send('Error, parameter not number.')
    return
  }

  const send = (data) => { res.send(data) }
  getGen(gen, send)

  console.log('Get Members gen ' + gen + ' from Cloud Firestore successfully.')
  // res.send('Get Members gen '+ gen +' from Cloud Firestore successfully.')
  // res.send(a)
})

app.get('/api/3rdhandshake/:date', (req, res) => {
  // let date = req.params.date
  // let hsRef = db.collection('3rd_handshake').where('date', '==', new Date(date))

  // hsRef.get().then(snapshot => {
  //   let data = {}
  //   let count = 0
  //   snapshot.forEach(doc => {
  //     let memberRef = doc.data().member_ref
  //     memberRef.get().then(member => {
  //       data[member.data().nickname] = doc.data().rounds
  //       count++
  //       if (count == 53) {
  //         console.log('request GET /api/3rdhandshake/:date, DONE.')
  //         res.send(data)
  //       }
  //     })
  //   })
  // })
  // .catch(err => {
  //   console.log('Error getting documents', err);
  // })

  let date = req.params.date
  let hsRef = db.ref('3rd_handshake/').orderByChild('date').equalTo(new Date(date).toDateString())

  hsRef.once('value').then(snapshot => {
    let data = {}
    let count = 0
    snapshot.forEach(child => {
      let memberUrl = child.val().member_ref
      let memberRef = db.refFromURL(memberUrl)
      memberRef.once('value').then(member => {
        data[member.val().nickname] = child.val().rounds
        count++
        if (count == 53) {
          console.log('request GET /api/3rdhandshake/:date, DONE.')
          res.send(data)
        }
      })
    })
  })
  .catch(err => {
    console.log('Error getting documents', err);
  })
})

app.get('/api/4thhandshake/:date', (req, res) => {
  // let date = req.params.date
  // let hsRef = db.collection('3rd_handshake').where('date', '==', new Date(date))

  // hsRef.get().then(snapshot => {
  //   let data = {}
  //   let count = 0
  //   snapshot.forEach(doc => {
  //     let memberRef = doc.data().member_ref
  //     memberRef.get().then(member => {
  //       data[member.data().nickname] = doc.data().rounds
  //       count++
  //       if (count == 53) {
  //         console.log('request GET /api/3rdhandshake/:date, DONE.')
  //         res.send(data)
  //       }
  //     })
  //   })
  // })
  // .catch(err => {
  //   console.log('Error getting documents', err);
  // })

  let date = req.params.date
  let hsRef = db.ref('4th_handshake/').orderByChild('date').equalTo(new Date(date).toDateString())

  hsRef.once('value').then(snapshot => {
    let data = {}
    let count = 0
    snapshot.forEach(child => {
      let memberUrl = child.val().member_ref
      let memberRef = db.refFromURL(memberUrl)
      memberRef.once('value').then(member => {
        data[member.val().nickname] = child.val().rounds
        count++
        if (count == 53) {
          console.log('request GET /api/4thhandshake/:date, DONE.')
          res.send(data)
        }
      })
    })
  })
  .catch(err => {
    console.log('Error getting documents', err);
  })
})

const getMembers = (callback) => {
  let membersRef = db.collection('members')
  let memOrderBy = membersRef.orderBy('nickname')

  memOrderBy.get().then(snapshot => {
    let data = []
    snapshot.forEach(doc => {
      data.push(doc.data())
    })
    callback(data)
  })
  .catch(err => {
    console.log('Error getting documents', err);
  })
}

const getMembersFirebase = (callback) => {
  let memberRef = db.ref('/members').orderByChild('nickname')
  memberRef.once('value').then(snap => {
    let data = []
    snap.forEach(child => {
      // console.log("Key: ", child.key, " nickname: ", child.val().nickname)
      data.push(child.val())
    })
    callback(data)
  })
}

const getGen = (gen, callback) => {
  let membersRef = db.collection('members')
  let memGenOne = membersRef.where('gen', '==', gen)
  let memOrderBy = memGenOne.orderBy('nickname')

  memOrderBy.get().then(snapshot => {
    let data = []
    snapshot.forEach(doc => {
      data.push(doc.data())
    })
    callback(data)
  })
  .catch(err => {
    console.log('Error getting documents', err);
  })
}

app.get('/api/addhandshake', (req, res) => {

  // let noti = genOne()
  // console.log(noti)
  // noti = genTwo()
  // console.log(noti)

  // let noti = thirdHandshakeFirebase()
  // noti = thirdHandshakeFirebaseTwo()

  // let noti = fourthHandshakeFirebase()
  // noti = fourthHandshakeFirebaseTwo()

  res.send("request GET /api/addhandshake, DONE!!")
})

const addmembers = (nickname, firstname, lastname, dob, height, province, like, bloodgroup, hobby, gen) => {
  // let membersRef = db.collection('members');
  // membersRef.add({
  //   nickname: nickname,
  //   firstname: firstname,
  //   lastname: lastname,
  //   dob: dob,
  //   height: height,
  //   province: province,
  //   like: like,
  //   bloodgroup: bloodgroup,
  //   hobby: hobby,
  //   gen: gen
  // }).then(ref => {
  //   console.log('Added document with ID: ' + ref.id + ", member: " + nickname)
  // })
  let memberRef = db.ref('members/')
  memberRef.push().set({
    nickname: nickname,
    firstname: firstname,
    lastname: lastname,
    dob: dob.toDateString(),
    height: height,
    province: province,
    like: like,
    bloodgroup: bloodgroup,
    hobby: hobby,
    gen: gen
  }).then(ref => {
    console.log('Added element successfully.')
  })
}

const genOne = () => {
  addmembers('CAN', 'NAYIKA', 'SRINIAN', new Date('Nov 10, 1997'), 160, 'Bangkok', ['SW(CloneTrooper)', 'CD'], 'B', ["ฟังเพลง", "ดูหนัง", "เที่ยวนอกบ้าน"], 1)
  addmembers('CHERPRANG', 'CHERPRANG', 'AREEKUL', new Date('May 2, 1996'), 160, 'Bangkok', [], 'B', ["กิน", "นอน", "เล่นเกม", "ฟังเพลง", "Cosplay"], 1)
  addmembers('IZURINA', 'RINA', 'IZUTA', new Date('Nov 26, 1995'), 158, 'Saitama, Japan', ['Fashion'], 'A', ["เดินห้าง"], 1)
  addmembers('JAA', 'NAPAPHAT', 'WORRAPHUTTANON', new Date('Jan 20, 2003'), 160, 'Bangkok', ['แมว', 'ผ้าเน่า', 'หมอนข้าง'], 'B', ["ฟังเพลง", 'เล่นflute', 'ดูหนัง'], 1)
  addmembers('JANE', 'KUNJIRANUT', 'INTARASIN', new Date('Mar 23, 2000'), 159, 'Pathum Thani', ['บาร์บี้', 'หมา', 'แมว', 'แฮมสเตอร์', 'กระต่าย'], 'A', ["นอน", "กิน", "ดูอนิเมะ"], 1)
  addmembers('JENNIS', 'JENNIS', 'OPRASERT', new Date('Jul 4, 2000'), 161, 'Petchaburi', ['Kpop101', 'สะสมโมเดลอาวุธ', 'เครื่องสำอาง'], 'O', ["เล่นกีฬา", "ดูหนัง", "ฟังเพลง", "ดูอนิเมะ"], 1)
  addmembers('JIB', 'SUCHAYA', 'SAENKHOT', new Date('Jul 4, 2002'), 159, 'Lopburi', ['anime', 'guchi'], 'A', ["เล่นเกม", "วาดรูป", "ดูอนิเมะ", "ฟังเพลง"], 1)
  addmembers('KAEW', 'NATRUJA', 'CHUTIWANSOPON', new Date('Mar 31, 1994'), 156, 'Chonburi', ['เครื่องสำอาง', 'น้ำหอม'], 'B', ["เล่นเปียโน", "นอน", "เดินเล่น", "ฟังเพลง"], 1)
  addmembers('KAIMOOK', 'WARATTAYA', 'DEESOMLERT', new Date('Aug 27, 1997'), 153, 'Bangkok', ['แมว'], 'O', ["เข้าครัว", "เย็บผ้า"], 1)
  addmembers('KATE', 'KORAPAT', 'NILPRAPA', new Date('Jun 9, 2001'), 162, 'Phayao', ['gudetama', 'ตุ๊กตา'], 'B', ["ชิว"], 1)
  addmembers('KORN', 'VATHUSIRI', 'PHUWAPUNYASIRI', new Date('Jan 21, 1999'), 163, 'Bangkok', ['Kitty'], 'O', ["ดูหนังผี", "อ่านหนังสือผี"], 1)
  addmembers('MAYSA', 'MESA', 'CHINAVICHARANA', new Date('Apr 8, 1999'), 162, 'Bangkok', ['Sanrio', 'เครื่องสำอาง'], 'A', ["ถ่ายรูป"], 1)
  addmembers('MIND', 'PANISA', 'SRILALOENG', new Date('Sep 6, 2001'), 165, 'Nakhon Ratchasima', ['กระต่าย'], 'B', ["ฟังเพลงญี่ปุ่น(scandal)"], 1)
  addmembers('MIORI', 'MIORI', 'OHKUBO', new Date('Sep 30, 1998'), 153, 'Ibaraki, Japan', ['Sanrio', 'Disney', 'Morning', 'Musume'], 'O', ["ร้องเพลง"], 1)
  addmembers('MOBILE', 'PIMRAPAT', 'PHADUNGWATANACHOK', new Date('Jul 9, 2002'), 159, 'Bangkok', ['มูมิน', 'อนิเมะ', 'แต่งหน้า'], 'O', ["Cosplay"], 1)
  addmembers('MUSIC', 'PRAEWA', 'SUTHAMPHONG', new Date('Feb 24, 2001'), 158, 'Bangkok', ['อะไรก็ได้นิ่มๆ'], 'B', ["Cosplay", "Game"], 1)
  addmembers('NAMNEUNG', 'MILIN', 'DOKTHIAN', new Date('Nov 11, 1996'), 160, 'Sing Buri', ['เสื้อผ้า', 'เครื่องสำอาง', 'หนังสือการ์ตูน', 'นิยาย'], 'B', ["นอน", "อ่านนิยาย", "ฟังเพลง"], 1)
  addmembers('NAMSAI', 'PICHAYAPA', 'NATHA', new Date('Oct 26, 1999'), 170, 'Chiang Mai', ['อัลปาก้า', 'อวกาศ', 'กีฬาที่เป็นลูกบอล'], 'O', ["กิน"], 1)
  addmembers('NINK', 'MANANYA', 'KAOJU', new Date('Feb 3, 2000'), 163, 'Samut Sakorn', ['Suchi'], 'O', ["วาดรูป", "ดูอนิเมะ"], 1)
  addmembers('NOEY', 'KANTEERA', 'WADCHARATHADSANAKUL', new Date('Apr 9, 1997'), 163, 'Samut Prakan', ['เครื่องสำอาง', 'นาฬิกาข้อมือ', 'กระเป๋า'], 'AB', ["นอน"], 1)
  addmembers('ORN', 'PATCHANAN', 'JIAJIRACHOTE', new Date('Feb 3, 1997'), 164, 'Bangkok', ['แมว', 'แมวน้ำ', 'แฟชั่น', 'เครื่องสำอาง'], 'O', ["นอน", "อ่านหนังสือ", "เล่นกับแมว"], 1)
  addmembers('PIAM', 'RINRADA', 'INTHAISONG', new Date('Jun 4, 2003'), 159, 'Saraburi', ['corgy', 'gundam figure'], 'B', ["นอน", "กิน", "เล่นเกม"], 1)
  addmembers('PUN', 'PUNSIKORN', 'TIYAKORN', new Date('Nov 9, 2000'), 166, 'Bangkok', ['Fashion'], 'A', ["ฟังเพลง", "เล่นมือถือ"], 1)
  addmembers('PUPE', 'JIRADAPA', 'INTAJAK', new Date('Jan 18, 1998'), 160, 'Chiang Rai', ['ผ้มห่ม', 'สีชมพู', 'โดเรม่อน'], 'B', ["เล่นเกม", "ดูอนิเมะ", "ฟังเพลง", "นอน"], 1)
  addmembers('SATCHAN', 'SAWITCHAYA', 'KAJONRUNGSILP', new Date('Dec 13, 2003'), 150, 'Bangkok', ['my melody'], 'A', ["ฟังเพลง"], 1)
  addmembers('TARWAAN', 'ISARAPA', 'THAWATPAKDEE', new Date('Dec 18, 1996'), 156, 'Nakhon Pathom', [], 'O', ["ดูหนัง", "ฟังเพลง"], 1)

  return 'Add Members GEN 1 to Cloud Firestore successfully.'
}

const genTwo = () => {
  addmembers('AOM', 'PUNYAWEE', 'JUNGCHAROEN', new Date('Sep 20, 1995'), 157, 'Chiang Mai', ['คิตตี้', 'บิงซู'], 'B', ["ดูหนัง", "อ่านหนังสือ"], 2)
  addmembers('BAMBOO', 'JANISTA', 'TANSIRI', new Date('Sep 3, 2002'), 167, 'Samut Prakan', ['สุนัข', 'สีเหลือง', 'ขนมเฮลตี้', 'ต่างหู'], 'O', ["เล่นบาสเกตบอล", "วาดรูป", "ดูรายการตลก", "เต้นโคฟเวอร์", "ทำขนม"], 2)
  addmembers('CAKE', 'NAWAPORN', 'CHANSUK', new Date('Nov 18, 1996'), 162, 'Bangkok', ['มินเนี่ยน', 'กินไอติม', 'บิงซู', 'ดูหนังสืบสวน'], 'O', ["ร้องเพลง", "ดูหนัง", "เล่นบาสเกตบอล"], 2)
  addmembers('DEENEE', 'PIMNIPA', 'TUNGSAKUL', new Date('Nov 28, 2001'), 172, 'Bangkok', ['ขนมเค้ก', 'ออกเเบบบ้าน'], 'O', ["วาดรูป", "ร้องเพลง"], 2)
  addmembers('FAII', 'SUMITRA', 'DUANGKAEW', new Date('Jun 28, 1996'), 165, 'Lamphun', ['แมว', 'นารุโตะ'], 'B', ["ฟังเพลง", "ดูคลิปแมว"], 2)
  addmembers('FIFA', 'PAWEETHIDA', 'SAKUNPIPHAT', new Date('Nov 6, 2001'), 163, 'Bangkok', ['โดราเอม่อน', 'นิยาย', 'สีฟ้า', 'สีม่วง', 'สีชมพู'], 'B', ["อ่านหนังสือการ์ตูน", "ดูอนิเมะ", "ฟังเพลง", "เล่นเกม"], 2)
  addmembers('FOND', 'NATTICHA', 'CHANTARAVAREELEKHA', new Date('Dec 3, 2002'), 158, 'Prachuap Khiri Khan', ['อาหารเผ็ดๆ', 'เครื่องเขียนโทนพาสเทล', 'สุนัขพันธุ์คอร์กี้', 'หนังผี'], 'A', ["ร้องเพลง", "เต้น", "พากย์การ์ตูน", "ดูหนัง"], 2)
  addmembers('GYGEE', 'NUTTAKUL', 'PIMTONGCHAIKUL', new Date('Oct 4, 2001'), 162, 'Bangkok', ['ตุ๊กตายูนิคอร์น', 'แมวจี้'], 'O', ["อ่านการ์ตูน", "ดูซีรี่ย์", "แบดมินตัน", "ร้องเพลง"], 2)
  addmembers('JUNÉ', 'PLEARNPICHAYA', 'KOMALARAJUN', new Date('Jul 4, 2000'), 171, 'Bangkok', ['เฉาก๊วยนมสด', 'คอร์กี้'], 'A', ["วาดรูป", "ถ่ายรูป", "ฟังเพลง"], 2)
  addmembers('KHAMIN', 'MANIPA', 'ROOPANYA', new Date('Apr 23, 1999'), 158, 'Khon Kaen', ['สุนัข'], 'O', ["ฟังเพลง", "อ่านหนังสือ"], 2)
  addmembers('KHENG', 'JUTHAMAS', 'KHONTA', new Date('Mar 26, 2000'), 161, 'Samut Prakan', ['เพลงฮิปฮอป', 'เเรพเปอร์'], '-', ["ฟังเพลง"], 2)
  addmembers('MAIRA', 'MAIRA', 'KUYAMA', new Date('Feb 24, 1997'), 153, 'Bangkok', ['ของเล่น'], 'A', ["ระบายสี"], 2)
  addmembers('MEWNICH', 'NANNAPHAS', 'LOETNAMCHOETSAKUN', new Date('Mar 11, 2002'), 158, 'Samut Prakan', ['มิกกี้เมาส์', 'ตุ๊กตาเอเลี่ยนสามตา', 'เจ้าหญิง'], 'B', ["ทำอาหาร", "ขนม", "ดูซีรีย์"], 2)
  addmembers('MINMIN', 'RACHAYA', 'TUPKUNANON', new Date('Mar 20, 1997'), 161, 'Bangkok', ['ส้มตำปูปลาร้า'], 'B', ["ดูหนัง", "ฟังเพลง", "เล่นเกม"], 2)
  addmembers('MYYU', 'KHAWISARA', 'SINGPLOD', new Date('Oct 28, 1999'), 167, 'Bangkok', ['กินไก่ทอด', 'ของหวานทุกประเภท'], 'O', ["แกะท่าเต้นจากยูทูป", "ดูคลิปเต้น", "ดูคลิปทำอหาร"], 2)
  addmembers('NATHERINE', 'DUSITA', 'KITISARAKULCHAI', new Date('Nov 11, 1999'), 163, 'Bangkok', ['เค้กส้ม', 'บัวลอย', 'คิตตี้'], 'O', ["เล่นเกม", "ดูบอล"], 2)
  addmembers('NEW', 'CHANYAPUK', 'NUMPRASOP', new Date('Jan 2, 2003'), 157, 'Bangkok', ['สุนัข'], 'B', ["ฟังเพลง", "เล่นกีตาร์", "เล่นเปียโน"], 2)
  addmembers('NIKY', 'WARINRAT', 'YOLPRASONG', new Date('Jan 26, 2005'), 159, 'Chiang Mai', ['ต่างหู', 'สีbabypink', 'มะขามเทศ'], 'O', ["ฟังเพลง", "ออกกำลังกาย"], 2)
  addmembers('NINE', 'PHATTHARANARIN', 'MUEANARIT', new Date('Nov 11, 2000'), 162, 'Nakhon Sawan', ['หมีคุมะ'], 'B', ["เล่นกีตาร์", "อ่านหนังสือการ์ตูน"], 2)
  addmembers('OOM', 'NATCHA', 'KRISDHASIMA', new Date('Sep 29, 2002'), 163, 'Bangkok', ['ไอศครีม'], 'O', ["อ่านหนังสือ", "ทำสวน"], 2)
  addmembers('PAKWAN', 'PAKWAN', 'NOIJAIBOON', new Date('Feb 18, 2000'), 160, 'Sakon Nakhon', ['สัตว์น่ารักยกเว้นสัตว์เลื้อยคลานทุกประเภท', 'ไอศครีม', 'สีชมพู ', 'ถ่ายรูป', 'ตุ๊กตา', 'แต่งตัว', 'ชอบสงสัย'], 'B', ["ร้อง/ฟัง/แต่งเพลง", "เล่นดนตรี(ไวโอลีน ขิม อูคู กีต้าร์ คีย์บอร์ด ปล.เล่นไม่เก่งแต่เล่นหมดนะคะ555)", "เล่นกีฬา(บาส โยคะ มวย พาน้องหมาไปวิ่ง)", "จัดบ้าน", "เก็บของทำความสะอาด", "วาดรูป", "ทำสวนเพราะชอบปลูกผัก แต่ชอบเลี้ยงกระบองเพชรเป็นกรณียกเว้น"], 2)
  addmembers('PANDA', 'JIDARPHA', 'CHAMCHOOY', new Date('Oct 10, 1997'), 159, 'Nakhon Pathom', ['ร้องเพลง', 'ช็อกโกแลต', 'หนูDumbo ', 'Rat'], 'A', ["อ่านการ์ตูน", "ดูหนัง", "วาดรูป"], 2)
  addmembers('PHUKKHOM', 'SIRIKARN', 'SHINNAWATSUWAN', new Date('Feb 28, 1998'), 165, 'Samut Prakan', ['ตุ๊กตาญี่ปุ่น', 'เรื่องผี', 'เจ้าหญิง'], 'B', ["วาดรูป", "ดูหนัง", "ร้องเพลง", "D.I.Y."], 2)
  addmembers('RATAH', 'RATAH', 'CHINKRAJANGKIT', new Date('Mar 27, 2002'), 156, 'Chiang Mai', ['สีเหลือง', 'เเมว', 'อาหารที่กินได้'], 'A', ["เเต่งนิยาย", "เต้นcover"], 2)
  addmembers('STANG', 'TARISA', 'PREECHATANGKIT', new Date('Oct 22, 2003'), 164, 'Bangkok', ['ไข่เจียว'], 'O', ["เล่นกีตาร์"], 2)
  addmembers('VIEW', 'KAMONTHIDA', 'ROTTHAWINITHI', new Date('May 28, 2004'), 165, 'Nonthaburi', ['ก๋วยเตี๋ยวต้มยำ'], 'B', ["อ่านการ์ตูน", "ฟังเพลง"], 2)
  addmembers('WEE', 'WEERAYA', 'ZHANG', new Date('Oct 23, 2001'), 167, 'Chonburi', ['สลัด', 'ชอบกินผัก', 'แต่ไม่ชอบขึ้นฉ่าย'], 'O', ["ดูหนัง", "ว่ายน้ำ", "เล่นเกม"], 2)

  return 'Add Members GEN 2 to Cloud Firestore successfully.'
}

const addHandshake = (member_ref, date, rounds) => {
  let hsRef = db.collection('3rd_handshake');
  hsRef.add({
    member_ref: member_ref,
    date: date,
    rounds: rounds
  }).then(ref => {
    console.log('Added document with ID: ' + ref.id)
  })
}

const addHandshakeFirebase = (member_ref, date, rounds) => {
  let hsRef = db.ref('4th_handshake/')
  hsRef.push().set({
    member_ref: member_ref,
    date: date.toDateString(),
    rounds: rounds
  }).then(ref => {
    console.log('Added element 3rd handshake successfully.')
  })
}

const thirdHandshake = () => {
  addHandshake('-LIaR0DFccwVdjIB3-jJ', new Date('Aug 18, 2018'), [false, true, false, true, false, true, true]) //CAN
  addHandshake(db.collection('members').doc('fjiwjXQR9JlPsD1Q7D8Z'), new Date('Aug 18, 2018'), [false, true, true, false, true, true, false]) //CHERPRANG
  addHandshake(db.collection('members').doc('6g8HST7OpPrKofvo80Zo'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //IZURINA
  addHandshake(db.collection('members').doc('I7cRNbEGHwmkiFz1PHGw'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //JAA
  addHandshake(db.collection('members').doc('BvVkb7FJJL1GXm4qYJTm'), new Date('Aug 18, 2018'), [true, false, true, false, true, false, true]) //JANE
  addHandshake(db.collection('members').doc('RTXef8ThOuNlpKqWPX9s'), new Date('Aug 18, 2018'), [true, true, false, true, true, false, false]) //JENNIS
  addHandshake(db.collection('members').doc('sp22RUq41rkalGNoqf7W'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //JIB
  addHandshake(db.collection('members').doc('zFM5nVqvuV27X24iiCzN'), new Date('Aug 18, 2018'), [false, true, true, false, true, true, false]) //KAEW
  addHandshake(db.collection('members').doc('PUodklqRw43cteiWj1my'), new Date('Aug 18, 2018'), [true, false, true, false, true, false, true]) //KAIMOOK
  addHandshake(db.collection('members').doc('GXrbhAWEXBJm5D1Bjpdt'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //KATE
  addHandshake(db.collection('members').doc('tXk3nM03jSEO092UTzCq'), new Date('Aug 18, 2018'), [false, true, false, true, false, true, false]) //KORN
  addHandshake(db.collection('members').doc('9Ec1dmKubUiGdMxfboJW'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //MAYSA
  addHandshake(db.collection('members').doc('IuVpI7lAzvXp5k08pMxh'), new Date('Aug 18, 2018'), [true, false, true, false, true, false, false]) //MIND
  addHandshake(db.collection('members').doc('WQ99bu8tJ3t9Zh5bYlFp'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //MIORI
  addHandshake(db.collection('members').doc('VjxhO0kd5z01BDFAR6EL'), new Date('Aug 18, 2018'), [false, true, true, false, true, true, true]) //MOBILE
  addHandshake(db.collection('members').doc('T5AYyPn20nJOZqhfKHsy'), new Date('Aug 18, 2018'), [true, true, false, true, true, false, true]) //MUSIC
  addHandshake(db.collection('members').doc('qmaMb7uhqVEHbVE5ZhTm'), new Date('Aug 18, 2018'), [true, false, true, false, true, false, false]) //NAMNEUNG
  addHandshake(db.collection('members').doc('vfgHfJ8eYJunQqjxHQZK'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //NAMSAI
  addHandshake(db.collection('members').doc('dxOZWyyCFWOTFfbAAopF'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //NINK
  addHandshake(db.collection('members').doc('bs5JxpNlO8oC5nHDnbDA'), new Date('Aug 18, 2018'), [true, false, true, true, false, true, true]) //NOEY
  addHandshake(db.collection('members').doc('IdlhiH0dTy7pNEV4JUyS'), new Date('Aug 18, 2018'), [true, true, false, true, true, false, false]) //ORN
  addHandshake(db.collection('members').doc('c0pspj9G8n8K3zpPxiRE'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //PIAM
  addHandshake(db.collection('members').doc('872LwXrlh7QANO6gOEyE'), new Date('Aug 18, 2018'), [true, false, true, true, false, true, true]) //PUN
  addHandshake(db.collection('members').doc('ouLnrt21D5sXugATFbQs'), new Date('Aug 18, 2018'), [false, true, false, true, false, true, false]) //PUPE
  addHandshake(db.collection('members').doc('SLrApC9TvyP9NH5L8Bb2'), new Date('Aug 18, 2018'), [false, true, false, true, false, true, false]) //SATCHAN
  addHandshake(db.collection('members').doc('zLrVyusk3RwME7mnDnNG'), new Date('Aug 18, 2018'), [true, false, true, true, false, true, true]) //TARWAAN

  addHandshake(db.collection('members').doc('DrG1PybCBY9GiAHer2sp'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //AOM
  addHandshake(db.collection('members').doc('2lnsZ9dUnLjyT1MEImYU'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //BAMBOO
  addHandshake(db.collection('members').doc('5F5s89bQAEtnOHQJZINU'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //CAKE
  addHandshake(db.collection('members').doc('U6REYR8tKRiYvMMVOnPZ'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //DEENEE
  addHandshake(db.collection('members').doc('hXytQw6NoyvmejOBSyb7'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //FAII
  addHandshake(db.collection('members').doc('7uFR4kaiGuYMWWodsaJH'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //FIFA
  addHandshake(db.collection('members').doc('edIFzTkyEFIuoAySwVRa'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //FOND
  addHandshake(db.collection('members').doc('nR5Nx9jutTSQEwt3O4TR'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //GYGEE
  addHandshake(db.collection('members').doc('JbNNrgd0bVKcwRQkAmRX'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //JUNÉ
  addHandshake(db.collection('members').doc('hyp5cZ8Hk1xj8zmA40af'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //KHAMIN
  addHandshake(db.collection('members').doc('rGDCpS3TEUWBtAjrwLEb'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //KHENG
  addHandshake(db.collection('members').doc('sZo74I2omq6Ctxuj1OZF'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //MAIRA
  addHandshake(db.collection('members').doc('lo91fKYJr8kRWBUMQn2H'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //MEWNICH
  addHandshake(db.collection('members').doc('9CAoFwNYiDftaqoDc3Eb'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //MINMIN
  addHandshake(db.collection('members').doc('L9Bjhoodh25d6K9kCtTS'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //MYYU
  addHandshake(db.collection('members').doc('mkElPzXbFYubjTFmvfsu'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //NATHERINE
  addHandshake(db.collection('members').doc('eJjdH4Ed8R9FP3UMA4bK'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //NEW
  addHandshake(db.collection('members').doc('XICRXQHc8cHYgQhMemah'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //NIKY
  addHandshake(db.collection('members').doc('eXGeutQn6N4B3Cj0JbLF'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //NINE
  addHandshake(db.collection('members').doc('PYT8m7YpA8E72cKtuqjt'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //OOM
  addHandshake(db.collection('members').doc('8j9DKpr2oefZxVTKAm2i'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //PAKWAN
  addHandshake(db.collection('members').doc('mA9E1NbYDVMRxUs5QAVP'), new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //PANDA
  addHandshake(db.collection('members').doc('xT6W2RNumZOSzmzaaL3e'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //PHUKKHOM
  addHandshake(db.collection('members').doc('mhPNWQFBY5JAe2ra8nKi'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //RATAH
  addHandshake(db.collection('members').doc('JNRvajiHfgyont4WFglN'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //STANG
  addHandshake(db.collection('members').doc('k4mOcKm0JqGgn0CrIPI6'), new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //VIEW
  addHandshake(db.collection('members').doc('7GX2TZRA4NOsmaPoWTrv'), new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //WEE

  return 'Add handshake schedule successfully.'
}

const thirdHandshakeFirebase = () => {
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1K6cquhzOIq0-1', new Date('Aug 18, 2018'), [false, true, false, true, false, true, true]) //CAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1P_g703HbpHI79', new Date('Aug 18, 2018'), [false, true, true, false, true, true, false]) //CHERPRANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__y', new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //IZURINA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__z', new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //JAA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y_a-', new Date('Aug 18, 2018'), [true, false, true, false, true, false, true]) //JANE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm7', new Date('Aug 18, 2018'), [true, true, false, true, true, false, false]) //JENNIS
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm8', new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //JIB
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkW', new Date('Aug 18, 2018'), [false, true, true, false, true, true, false]) //KAEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkX', new Date('Aug 18, 2018'), [true, false, true, false, true, false, true]) //KAIMOOK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkY', new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //KATE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehl', new Date('Aug 18, 2018'), [false, true, false, true, false, true, false]) //KORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehm', new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //MAYSA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehn', new Date('Aug 18, 2018'), [true, false, true, false, true, false, false]) //MIND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5geho', new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //MIORI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGw_', new Date('Aug 18, 2018'), [false, true, true, false, true, true, true]) //MOBILE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwa', new Date('Aug 18, 2018'), [true, true, false, true, true, false, true]) //MUSIC
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwb', new Date('Aug 18, 2018'), [true, false, true, false, true, false, false]) //NAMNEUNG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAQ', new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //NAMSAI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAR', new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //NINK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAS', new Date('Aug 18, 2018'), [true, false, true, true, false, true, true]) //NOEY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVN', new Date('Aug 18, 2018'), [true, true, false, true, true, false, false]) //ORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVO', new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //PIAM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0M_', new Date('Aug 18, 2018'), [true, false, true, true, false, true, true]) //PUN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Ma', new Date('Aug 18, 2018'), [false, true, false, true, false, true, false]) //PUPE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Mb', new Date('Aug 18, 2018'), [false, true, false, true, false, true, false]) //SATCHAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Y30uJE4eSwWKP', new Date('Aug 18, 2018'), [true, false, true, true, false, true, true]) //TARWAAN

  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVf', new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //AOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVg', new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //BAMBOO
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__P', new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //CAKE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__Q', new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //DEENEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZA', new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //FAII
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZB', new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //FIFA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZC', new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //FOND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjR', new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //GYGEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjS', new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //JUNÉ
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndt', new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //KHAMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndu', new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //KHENG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndv', new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //MAIRA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKy', new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //MEWNICH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKz', new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //MINMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbL-', new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //MYYU
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOc', new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //NATHERINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOd', new Date('Aug 18, 2018'), [false, true, false, false, true, false, true]) //NEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO7', new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //NIKY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO8', new Date('Aug 18, 2018'), [false, false, true, false, false, true, true]) //NINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO9', new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //OOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpif', new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //PAKWAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpig', new Date('Aug 18, 2018'), [false, true, false, false, true, false, false]) //PANDA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpih', new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //PHUKKHOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfl', new Date('Aug 18, 2018'), [true, false, false, true, false, false, true]) //RATAH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfm', new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //STANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfn', new Date('Aug 18, 2018'), [false, false, true, false, false, true, false]) //VIEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1jwsiJ_CizMfLf', new Date('Aug 18, 2018'), [true, false, false, true, false, false, false]) //WEE

  return 'Add handshake schedule successfully.'
}

const thirdHandshakeFirebaseTwo = () => {
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1K6cquhzOIq0-1', new Date('Aug 19, 2018'), [false, true, false, true, false, true, false]) //CAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1P_g703HbpHI79', new Date('Aug 19, 2018'), [false, true, true, false, true, true, true]) //CHERPRANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__y', new Date('Aug 19, 2018'), [true, false, false, true, false, false, true]) //IZURINA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__z', new Date('Aug 19, 2018'), [false, false, true, false, false, true, false]) //JAA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y_a-', new Date('Aug 19, 2018'), [true, false, true, false, true, false, false]) //JANE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm7', new Date('Aug 19, 2018'), [true, true, false, true, true, false, true]) //JENNIS
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm8', new Date('Aug 19, 2018'), [false, true, false, false, true, false, false]) //JIB
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkW', new Date('Aug 19, 2018'), [false, true, true, false, true, true, true]) //KAEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkX', new Date('Aug 19, 2018'), [true, false, true, false, true, false, false]) //KAIMOOK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkY', new Date('Aug 19, 2018'), [false, false, true, false, false, true, false]) //KATE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehl', new Date('Aug 19, 2018'), [false, true, false, true, false, true, true]) //KORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehm', new Date('Aug 19, 2018'), [false, false, true, false, false, true, false]) //MAYSA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehn', new Date('Aug 19, 2018'), [true, false, true, false, true, false, true]) //MIND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5geho', new Date('Aug 19, 2018'), [false, true, false, false, true, false, true]) //MIORI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGw_', new Date('Aug 19, 2018'), [false, true, true, false, true, true, false]) //MOBILE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwa', new Date('Aug 19, 2018'), [true, true, false, true, true, false, false]) //MUSIC
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwb', new Date('Aug 19, 2018'), [true, false, true, false, true, false, true]) //NAMNEUNG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAQ', new Date('Aug 19, 2018'), [true, false, false, true, false, false, true]) //NAMSAI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAR', new Date('Aug 19, 2018'), [false, true, false, false, true, false, true]) //NINK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAS', new Date('Aug 19, 2018'), [true, false, true, true, false, true, false]) //NOEY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVN', new Date('Aug 19, 2018'), [true, true, false, true, true, false, true]) //ORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVO', new Date('Aug 19, 2018'), [true, false, false, true, false, false, false]) //PIAM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0M_', new Date('Aug 19, 2018'), [true, false, true, true, false, true, false]) //PUN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Ma', new Date('Aug 19, 2018'), [false, true, false, true, false, true, true]) //PUPE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Mb', new Date('Aug 19, 2018'), [false, true, false, true, false, true, true]) //SATCHAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Y30uJE4eSwWKP', new Date('Aug 19, 2018'), [true, false, true, true, false, true, false]) //TARWAAN

  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVf', new Date('Aug 19, 2018'), [false, false, true, false, false, true, true]) //AOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVg', new Date('Aug 19, 2018'), [false, true, false, false, true, false, false]) //BAMBOO
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__P', new Date('Aug 19, 2018'), [false, false, true, false, false, true, true]) //CAKE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__Q', new Date('Aug 19, 2018'), [true, false, false, true, false, false, false]) //DEENEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZA', new Date('Aug 19, 2018'), [true, false, false, true, false, false, true]) //FAII
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZB', new Date('Aug 19, 2018'), [false, true, false, false, true, false, false]) //FIFA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZC', new Date('Aug 19, 2018'), [false, true, false, false, true, false, false]) //FOND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjR', new Date('Aug 19, 2018'), [false, true, false, false, true, false, true]) //GYGEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjS', new Date('Aug 19, 2018'), [false, false, true, false, false, true, true]) //JUNÉ
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndt', new Date('Aug 19, 2018'), [true, false, false, true, false, false, false]) //KHAMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndu', new Date('Aug 19, 2018'), [false, true, false, false, true, false, false]) //KHENG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndv', new Date('Aug 19, 2018'), [false, false, true, false, false, true, false]) //MAIRA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKy', new Date('Aug 19, 2018'), [true, false, false, true, false, false, true]) //MEWNICH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKz', new Date('Aug 19, 2018'), [false, false, true, false, false, true, true]) //MINMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbL-', new Date('Aug 19, 2018'), [true, false, false, true, false, false, false]) //MYYU
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOc', new Date('Aug 19, 2018'), [false, true, false, false, true, false, false]) //NATHERINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOd', new Date('Aug 19, 2018'), [false, true, false, false, true, false, false]) //NEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO7', new Date('Aug 19, 2018'), [false, true, false, false, true, false, true]) //NIKY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO8', new Date('Aug 19, 2018'), [false, false, true, false, false, true, false]) //NINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO9', new Date('Aug 19, 2018'), [false, false, true, false, false, true, true]) //OOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpif', new Date('Aug 19, 2018'), [true, false, false, true, false, false, false]) //PAKWAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpig', new Date('Aug 19, 2018'), [false, true, false, false, true, false, true]) //PANDA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpih', new Date('Aug 19, 2018'), [false, false, true, false, false, true, true]) //PHUKKHOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfl', new Date('Aug 19, 2018'), [true, false, false, true, false, false, false]) //RATAH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfm', new Date('Aug 19, 2018'), [true, false, false, true, false, false, true]) //STANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfn', new Date('Aug 19, 2018'), [false, false, true, false, false, true, true]) //VIEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1jwsiJ_CizMfLf', new Date('Aug 19, 2018'), [true, false, false, true, false, false, true]) //WEE

  return 'Add handshake schedule successfully.'
}

const fourthHandshakeFirebase = () => {
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1K6cquhzOIq0-1', new Date('Nov 3, 2018'), [false, true, false, true, false, true, true]) //CAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1P_g703HbpHI79', new Date('Nov 3, 2018'), [false, true, true, false, true, true, false]) //CHERPRANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__y', new Date('Nov 3, 2018'), [true, false, false, true, false, false, false]) //IZURINA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__z', new Date('Nov 3, 2018'), [false, false, true, false, false, true, true]) //JAA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y_a-', new Date('Nov 3, 2018'), [true, false, true, false, true, false, true]) //JANE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm7', new Date('Nov 3, 2018'), [true, true, false, true, true, false, false]) //JENNIS
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm8', new Date('Nov 3, 2018'), [false, true, false, false, true, false, true]) //JIB
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkW', new Date('Nov 3, 2018'), [false, true, true, false, true, true, false]) //KAEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkX', new Date('Nov 3, 2018'), [true, false, true, false, true, false, true]) //KAIMOOK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkY', new Date('Nov 3, 2018'), [false, false, true, false, false, true, true]) //KATE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehl', new Date('Nov 3, 2018'), [false, true, false, true, false, true, false]) //KORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehm', new Date('Nov 3, 2018'), [false, false, true, false, false, true, true]) //MAYSA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehn', new Date('Nov 3, 2018'), [true, false, true, false, true, false, false]) //MIND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5geho', new Date('Nov 3, 2018'), [false, true, false, false, true, false, false]) //MIORI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGw_', new Date('Nov 3, 2018'), [false, true, true, false, true, true, true]) //MOBILE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwa', new Date('Nov 3, 2018'), [true, true, false, true, true, false, true]) //MUSIC
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwb', new Date('Nov 3, 2018'), [true, false, true, false, true, false, false]) //NAMNEUNG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAQ', new Date('Nov 3, 2018'), [true, false, false, true, false, false, false]) //NAMSAI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAR', new Date('Nov 3, 2018'), [false, true, false, false, true, false, false]) //NINK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAS', new Date('Nov 3, 2018'), [true, false, true, true, false, true, true]) //NOEY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVN', new Date('Nov 3, 2018'), [true, true, false, true, true, false, false]) //ORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVO', new Date('Nov 3, 2018'), [true, false, false, true, false, false, true]) //PIAM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0M_', new Date('Nov 3, 2018'), [true, false, true, true, false, true, true]) //PUN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Ma', new Date('Nov 3, 2018'), [false, true, false, true, false, true, false]) //PUPE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Mb', new Date('Nov 3, 2018'), [false, true, false, true, false, true, false]) //SATCHAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Y30uJE4eSwWKP', new Date('Nov 3, 2018'), [true, false, true, true, false, true, true]) //TARWAAN

  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVf', new Date('Nov 3, 2018'), [false, false, true, false, false, true, false]) //AOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVg', new Date('Nov 3, 2018'), [false, true, false, false, true, false, true]) //BAMBOO
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__P', new Date('Nov 3, 2018'), [false, false, true, false, false, true, false]) //CAKE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__Q', new Date('Nov 3, 2018'), [true, false, false, true, false, false, true]) //DEENEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZA', new Date('Nov 3, 2018'), [true, false, false, true, false, false, false]) //FAII
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZB', new Date('Nov 3, 2018'), [false, true, false, false, true, false, true]) //FIFA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZC', new Date('Nov 3, 2018'), [false, true, false, false, true, false, true]) //FOND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjR', new Date('Nov 3, 2018'), [false, true, false, false, true, false, false]) //GYGEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjS', new Date('Nov 3, 2018'), [false, false, true, false, false, true, false]) //JUNÉ
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndt', new Date('Nov 3, 2018'), [true, false, false, true, false, false, true]) //KHAMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndu', new Date('Nov 3, 2018'), [false, true, false, false, true, false, true]) //KHENG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndv', new Date('Nov 3, 2018'), [false, false, true, false, false, true, true]) //MAIRA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKy', new Date('Nov 3, 2018'), [true, false, false, true, false, false, false]) //MEWNICH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKz', new Date('Nov 3, 2018'), [false, false, true, false, false, true, false]) //MINMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbL-', new Date('Nov 3, 2018'), [true, false, false, true, false, false, true]) //MYYU
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOc', new Date('Nov 3, 2018'), [false, true, false, false, true, false, true]) //NATHERINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOd', new Date('Nov 3, 2018'), [false, true, false, false, true, false, true]) //NEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO7', new Date('Nov 3, 2018'), [false, true, false, false, true, false, false]) //NIKY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO8', new Date('Nov 3, 2018'), [false, false, true, false, false, true, true]) //NINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO9', new Date('Nov 3, 2018'), [false, false, true, false, false, true, false]) //OOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpif', new Date('Nov 3, 2018'), [true, false, false, true, false, false, true]) //PAKWAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpig', new Date('Nov 3, 2018'), [false, true, false, false, true, false, false]) //PANDA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpih', new Date('Nov 3, 2018'), [false, false, true, false, false, true, false]) //PHUKKHOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfl', new Date('Nov 3, 2018'), [true, false, false, true, false, false, true]) //RATAH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfm', new Date('Nov 3, 2018'), [true, false, false, true, false, false, false]) //STANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfn', new Date('Nov 3, 2018'), [false, false, true, false, false, true, false]) //VIEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1jwsiJ_CizMfLf', new Date('Nov 3, 2018'), [true, false, false, true, false, false, false]) //WEE

  return 'Add handshake schedule successfully.'
}

const fourthHandshakeFirebaseTwo = () => {
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1K6cquhzOIq0-1', new Date('Nov 4, 2018'), [false, true, false, true, false, true, false]) //CAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1P_g703HbpHI79', new Date('Nov 4, 2018'), [false, true, true, false, true, true, true]) //CHERPRANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__y', new Date('Nov 4, 2018'), [true, false, false, true, false, false, true]) //IZURINA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y__z', new Date('Nov 4, 2018'), [false, false, true, false, false, true, false]) //JAA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Q5SXsev57y_a-', new Date('Nov 4, 2018'), [true, false, true, false, true, false, false]) //JANE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm7', new Date('Nov 4, 2018'), [true, true, false, true, true, false, true]) //JENNIS
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1RDH3k9NkwHXm8', new Date('Nov 4, 2018'), [false, true, false, false, true, false, false]) //JIB
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkW', new Date('Nov 4, 2018'), [false, true, true, false, true, true, true]) //KAEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkX', new Date('Nov 4, 2018'), [true, false, true, false, true, false, false]) //KAIMOOK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1SFEQO2ZwNqZkY', new Date('Nov 4, 2018'), [false, false, true, false, false, true, false]) //KATE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehl', new Date('Nov 4, 2018'), [false, true, false, true, false, true, true]) //KORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehm', new Date('Nov 4, 2018'), [false, false, true, false, false, true, false]) //MAYSA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5gehn', new Date('Nov 4, 2018'), [true, false, true, false, true, false, true]) //MIND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1T9bIeupp5geho', new Date('Nov 4, 2018'), [false, true, false, false, true, false, true]) //MIORI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGw_', new Date('Nov 4, 2018'), [false, true, true, false, true, true, false]) //MOBILE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwa', new Date('Nov 4, 2018'), [true, true, false, true, true, false, false]) //MUSIC
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1U5-wInv6xQGwb', new Date('Nov 4, 2018'), [true, false, true, false, true, false, true]) //NAMNEUNG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAQ', new Date('Nov 4, 2018'), [true, false, false, true, false, false, true]) //NAMSAI
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAR', new Date('Nov 4, 2018'), [false, true, false, false, true, false, true]) //NINK
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1VDymuFqqMWTAS', new Date('Nov 4, 2018'), [true, false, true, true, false, true, false]) //NOEY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVN', new Date('Nov 4, 2018'), [true, true, false, true, true, false, true]) //ORN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1WgS--RWfp_oVO', new Date('Nov 4, 2018'), [true, false, false, true, false, false, false]) //PIAM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0M_', new Date('Nov 4, 2018'), [true, false, true, true, false, true, false]) //PUN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Ma', new Date('Nov 4, 2018'), [false, true, false, true, false, true, true]) //PUPE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1X6AsFylMEz0Mb', new Date('Nov 4, 2018'), [false, true, false, true, false, true, true]) //SATCHAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1Y30uJE4eSwWKP', new Date('Nov 4, 2018'), [true, false, true, true, false, true, false]) //TARWAAN

  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVf', new Date('Nov 4, 2018'), [false, false, true, false, false, true, true]) //AOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1_5xEHseXliCVg', new Date('Nov 4, 2018'), [false, true, false, false, true, false, false]) //BAMBOO
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__P', new Date('Nov 4, 2018'), [false, false, true, false, false, true, true]) //CAKE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1aqh4JA6ERd__Q', new Date('Nov 4, 2018'), [true, false, false, true, false, false, false]) //DEENEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZA', new Date('Nov 4, 2018'), [true, false, false, true, false, false, true]) //FAII
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZB', new Date('Nov 4, 2018'), [false, true, false, false, true, false, false]) //FIFA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1bsQN58a9AamZC', new Date('Nov 4, 2018'), [false, true, false, false, true, false, false]) //FOND
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjR', new Date('Nov 4, 2018'), [false, true, false, false, true, false, true]) //GYGEE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1c6ohtPDsEjGjS', new Date('Nov 4, 2018'), [false, false, true, false, false, true, true]) //JUNÉ
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndt', new Date('Nov 4, 2018'), [true, false, false, true, false, false, false]) //KHAMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndu', new Date('Nov 4, 2018'), [false, true, false, false, true, false, false]) //KHENG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1d-II6As7imndv', new Date('Nov 4, 2018'), [false, false, true, false, false, true, false]) //MAIRA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKy', new Date('Nov 4, 2018'), [true, false, false, true, false, false, true]) //MEWNICH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbKz', new Date('Nov 4, 2018'), [false, false, true, false, false, true, true]) //MINMIN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1excPe-tHVXbL-', new Date('Nov 4, 2018'), [true, false, false, true, false, false, false]) //MYYU
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOc', new Date('Nov 4, 2018'), [false, true, false, false, true, false, false]) //NATHERINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1fr11BJgdQnWOd', new Date('Nov 4, 2018'), [false, true, false, false, true, false, false]) //NEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO7', new Date('Nov 4, 2018'), [false, true, false, false, true, false, true]) //NIKY
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO8', new Date('Nov 4, 2018'), [false, false, true, false, false, true, false]) //NINE
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1gIk-BUvn6DeO9', new Date('Nov 4, 2018'), [false, false, true, false, false, true, true]) //OOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpif', new Date('Nov 4, 2018'), [true, false, false, true, false, false, false]) //PAKWAN
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpig', new Date('Nov 4, 2018'), [false, true, false, false, true, false, true]) //PANDA
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1haVGlTkildpih', new Date('Nov 4, 2018'), [false, false, true, false, false, true, true]) //PHUKKHOM
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfl', new Date('Nov 4, 2018'), [true, false, false, true, false, false, false]) //RATAH
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfm', new Date('Nov 4, 2018'), [true, false, false, true, false, false, true]) //STANG
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1ipKKH1Hhk6Kfn', new Date('Nov 4, 2018'), [false, false, true, false, false, true, true]) //VIEW
  addHandshakeFirebase('https://react-bnk.firebaseio.com/members/-LIcxj1jwsiJ_CizMfLf', new Date('Nov 4, 2018'), [true, false, false, true, false, false, true]) //WEE

  return 'Add handshake schedule successfully.'
}

app.listen(port, () => console.log(`Listening on port ${port}`))