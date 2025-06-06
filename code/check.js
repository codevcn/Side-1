/*
   Kiểm tra các email trong file data.txt có tồn tại trong logNhan.txt hay không.
   - data.txt: chứa danh sách email làm chuẩn kiểm tra.
   - logNhan.txt: chứa các log đã nhận, trong đó có email để kiểm tra.
*/

import { readFileSync } from "fs";

// Đọc nội dung 2 file
const dataLines = readFileSync("code/data.txt", "utf-8")
   .split("\n")
   .map((line) => line.trim())
   .filter((line) => line.length > 0);

const logNhanLines = readFileSync("code/logNhan.txt", "utf-8")
   .split("\n")
   .map((line) => line.trim())
   .filter((line) => line.length > 0);

// 1. Lấy danh sách email từ data.txt
const dataEmails = new Set();
for (const line of dataLines) {
   const [email] = line.split(/\s+/); // lấy email đầu tiên
   dataEmails.add(email);
}

// 2. Lấy tất cả email "cần check" từ logNhan.txt
const checkedEmailsInLog = new Set();
for (const line of logNhanLines) {
   const parts = line.trim().split(/\s+/); // tách bằng nhiều khoảng trắng
   if (parts.length >= 4) {
      const email1 = parts[1]; // email thứ 2 trong dòng
      const email2 = parts[3]; // email thứ 4 trong dòng
      checkedEmailsInLog.add(email1);
      checkedEmailsInLog.add(email2);
   }
}

// 3. Tìm các email có trong data.txt mà không có trong logNhan
const notInLog = [...dataEmails].filter(
   (email) => !checkedEmailsInLog.has(email)
);

// 4. In kết quả
if (notInLog.length === 0) {
   console.log(">>> Tất cả email trong data.txt đều có trong logNhan.txt");
} else {
   console.log(
      `>>> Có ${notInLog.length} email trong data.txt không có trong logNhan.txt:\n`
   );
}
notInLog.forEach((email) => console.log(email));
