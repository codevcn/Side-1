const generateCccd = require("./gen")
const express = require("express")
const app = express()
const cors = require("cors")
const axios = require('axios');
const e = require("express");

const fs = require('fs').promises;
app.use(cors())
app.listen(3000)
dataSaving = null
let isSaving = true
let emailRandom = null
let mailIsGetLink = true
app.get("/random-email", async (req, res) => {
  if (mailIsGetLink && !isSaving) {
    return res.json({ error: "Hãy lưu email trước khi bắt đầu" });
  }

  // Lấy thời gian hiện tại và định dạng hh:mm dd/mm/yyyy
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const MM = String(now.getMonth() + 1).padStart(2, '0'); // Tháng từ 0-11 nên +1
  const yyyy = now.getFullYear();

  const timestamp = `${hh}:${mm} ${dd}/${MM}/${yyyy}`;

  let dataRandom = generateCccd();
  emailRandom = dataRandom.email;
  mailIsGetLink = false;
  isSaving = false;

  const logLine = `${timestamp} | ${emailRandom}\n`;

  try {
    await fs.appendFile('./temp/logEmail.txt', logLine);

    res.json({ email: emailRandom });
  } catch (err) {
    console.error('Lỗi ghi log:', err);
    res.status(500).json({ error: 'Lỗi ghi log' });
  }
});
app.get("/get-random", (req, res) => {
  dataRandom = generateCccd()
  dataRandom.password = "Phongbk!"
  dataRandom.emailNhan = "anhphongbkdn123@gmail.com"
  dataRandom.email = emailRandom
  console.log(dataRandom.email)
  if (results.length < 2) {
    return res.json({ error: "No more links available" });
  }
  dataSaving = dataRandom
  res.json(dataRandom)
})
const myProxy = [
   {
      linkChange:
         "https://api.enode.vn/getip/7c70658209207f6466bf92b1f75085fe282d8df3",
      proxy: "http://116.97.200.204:10941",
   },
   {
      linkChange:
         "https://api.enode.vn/getip/5305a5672059d88777ad06a92dddebc651550a30",
      proxy: "http://116.97.200.204:22497",
   },
]; // 1 rảnh, 0 bận

let currentIndex = 0;
app.get("/get", (req, res) => {
  proxy = myProxy[currentIndex].proxy
  linkChange = myProxy[currentIndex].linkChange
  if (dataSaving) {
    dataSaving.proxy = proxy
    dataSaving.linkChange = linkChange
  }
  res.json(dataSaving || { proxy, linkChange })
})



app.get("/getProxy", async (req, res) => {
  const currentProxy = myProxy[currentIndex];
  currentIndex++;
  currentIndex = currentIndex % myProxy.length; // tăng chỉ số lên 1 và quay lại đầu nếu vượt quá độ dài
  const nextProxy = myProxy[currentIndex]; // lấy proxy tiếp theo
  res.json({
    currentProxy,
    nextProxy
  });
});




let results = []

async function readData() {
  const rawData = await fs.readFile('./data.txt', 'utf-8');
  // Tách từng dòng
  const lines = rawData
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line !== '');
  results = lines.map(line => {
    const [email, times, amount, link] = line.split('\t');
    return {
      email,
      times: parseInt(times),
      amount,
      link,
      emailNhan: null,
    };
  });
}
readData()

// Chuyển từng dòng thành object

let temp = null
let firstLink = null
let secondLink = null
app.get("/getLink", async (req, res) => {
  try {
    if (isSaving) {
      return res.json({ error: "Đã lưu mail" });
    }
    if (!emailRandom) {
      return res.json({ error: "Chưa có email" });
    }

    if (mailIsGetLink) {
      return res.json(temp);
    }

    if (results.length < 2) {
      return res.json({ error: "No more links available" });
    }

    // Lấy 2 phần tử đầu tiên
    firstLink = results.shift();
    secondLink = results.shift();

    // Gán email nhận
    firstLink.emailNhan = emailRandom;
    secondLink.emailNhan = emailRandom;

    const data = {
      firstLink: { link: firstLink.link, amount: firstLink.amount, email: firstLink.email },
      secondLink: { link: secondLink.link, amount: secondLink.amount, email: secondLink.email }
    };

    // Dòng ghi log: emailRandom, email và amount của 2 link, cách nhau tab
    const line = `${emailRandom}\t${firstLink.email}\t${firstLink.amount}\t\t\t${secondLink.email}\t${secondLink.amount}\n`;
    const isGet = `${firstLink.email}\n${secondLink.email}\n`
    // Append file bằng promise (await cho chắc chắn ghi xong)
    await fs.appendFile('./temp/logIsGet.txt', isGet);
    await fs.appendFile('./temp/logNhan.txt', line);

    mailIsGetLink = true;
    temp = data;

    res.json(data);

  } catch (err) {
    console.error("Lỗi trong /getLink:", err);
    res.json({ error: "Server error" });
  }
});



app.get("/getLink_NonEx", async (req, res) => {
  try {
    if (mailIsGetLink) {
      return res.json(temp);
    } else {  
      return res.json({ error: "Chưa có link" });
    }

  } catch (err) {
    console.error("Lỗi trong /getLink:", err);
    res.json({ error: "Server error" });
  }
});
const myError = {}
app.get("/getError/:email", async (req, res) => {
  const { email } = req.params
  if (!email) {
    return res.json({ error: "Không đủ thông tin" });
  }
  let amount;
  if (email == firstLink.email) {
    amount = firstLink.amount
  } else if (email == secondLink.email) {
    amount = secondLink.amount
  } else {
    amount = null
  }
  const textError = myError[email] || ""
  res.json({ amount, textError });
})
app.get("/undoLink", async (req, res) => {
  if (isSaving) {
    return res.json({ error: "Đã lưu mail rồi" });
  }
  if (!emailRandom) {
    return res.json({ error: "Chưa có email" });
  }
  if (!mailIsGetLink) {
    return res.json({ error: "Chưa có link" });
  }
  results.unshift(secondLink)
  results.unshift(firstLink)
  firstLink = null
  secondLink = null
  mailIsGetLink = false
  emailRandom = null

  res.json({ success: "Hủy link thành công, vui lòng random lại email (Đăng kí acc mới) để tiếp tục lấy link" });
})
app.get("/setError/:email/:error", async (req, res) => {
  try {
    const { email, error } = req.params
    if (!email || !error) {
      return res.json({ error: "Báo lỗi phải có thông tin lỗi..." });
    }
    if (email != firstLink.email && email != secondLink.email) {
      return res.json({ error: "Email không phải là email của link" });
    }
    if (!emailRandom) {
      return res.json({ error: "Chưa có email" });
    }
    myError[email] = error
    let amount;
    if (email == firstLink.email) {
      amount = firstLink.amount
    } else if (email == secondLink.email) {
      amount = secondLink.amount
    } else {
      amount = null
    }
    if (myError[emailRandom] == error) {
      return res.json({ error: "Email đã báo lỗi" });
    }
    const line = `${emailRandom}\t\t${email}\t\t${amount}\t\t${error}\n`;

    // Append file bằng promise (await cho chắc chắn ghi xong)
    await fs.appendFile('./temp/logError.txt', line);

    res.json({ success: `Gửi lỗi cho link ${amount} thành công` });
  } catch (err) {
    res.json({ error: "Server error" });
  }
});

app.get("/saveMail", async (req, res) => {
  try {
    if (isSaving) {
      return res.json({ error: "Đã lưu mail rồi" });
    }
    if (!emailRandom) {
      return res.json({ error: "Chưa có email" });
    }
    if (!mailIsGetLink) {
      return res.json({ error: "Chưa có link" });
    }
    const isGet = `${emailRandom}\n`
    await fs.appendFile('saveEmail.txt', isGet);
    isSaving = true;
    res.json({ success: "Lưu mail thành công" });
  } catch (err) {
    res.json({ error: "Server error" });
  }
});

const path = require('path');
app.get('/showEmail', async (req, res) => {
  const filePath = path.join(__dirname, 'saveEmail.txt');
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const htmlFormatted = data.replace(/\n/g, '<br>'); // Chuyển \n thành <br>
    res.send(`<div style="font-family: monospace;">${htmlFormatted}</div>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi đọc file');
  }
});