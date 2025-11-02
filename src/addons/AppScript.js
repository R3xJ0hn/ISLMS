function doGet(e) {
  const action = e.parameter.action || "getData";

  if (action === "login") {
    return handleLogin(e);
  }

  if (action === "getData") {
    return handleGetData(e);
  }

  return sendJSON({ error: "Invalid action" });
}

//=== LOGIN HANDLER ===
function handleLogin(e) {
  const email = e.parameter.email?.trim();
  const password = e.parameter.password?.trim();

  if (!email || !password)
    return sendJSON({ success: false, message: "Email and password required" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const credSheet = ss.getSheetByName("Credentials");
  if (!credSheet)
    return sendJSON({ success: false, message: "Missing 'Credentials' sheet" });

  const data = credSheet.getDataRange().getDisplayValues();
  const headers = data[0].map((h) => h.trim().toLowerCase());
  const emailCol = headers.indexOf("email address");
  const passCol = headers.indexOf("password");
  const studentNoCol = headers.indexOf("student number");
  const stdntLNCol =  headers.indexOf("last name");
  const stdntFNCol =  headers.indexOf("first name");

  if (emailCol === -1 || passCol === -1)
    return sendJSON({ success: false, message: "Missing 'Email Address' or 'Password' column" });

  const user = data.find(
    (row, i) =>
      i > 0 &&
      row[emailCol].trim().toLowerCase() === email.toLowerCase() &&
      row[passCol].trim() === password
  );

  if (!user)
    return sendJSON({ success: false, message: "Invalid credentials" });

  const token = Utilities.getUuid();
  const studentNo = studentNoCol !== -1 ? String(user[studentNoCol]).trim() : "";

  if (!studentNo)
    return sendJSON({ success: false, message: "Missing Student No for this user" });

  // Store token
  let tokenSheet = ss.getSheetByName("TokenStore");
  if (!tokenSheet) {
    tokenSheet = ss.insertSheet("TokenStore");
    tokenSheet.hideSheet();
    tokenSheet.appendRow(["Token", "StudentNo", "Timestamp"]);
  }

  tokenSheet.appendRow([token, studentNo, new Date().toISOString()]);

  return sendJSON({
    success: true,
    message: "Login successful",
    token,
    user: {
      name: user[stdntLNCol] + ", " + user[stdntFNCol],
      email: user[emailCol],
      studentNo,
    },
  });
}

//=== DATA RETRIEVAL HANDLER ===
function handleGetData(e) {
  const token = e.parameter.token;
  if (!token) return sendJSON({ error: "Missing token" });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tokenSheet = ss.getSheetByName("TokenStore");
  if (!tokenSheet) return sendJSON({ error: "Token store not found" });

  const tokenData = tokenSheet.getDataRange().getValues();
  const tokenRow = tokenData.find((r) => r[0] === token);

  if (!tokenRow) return sendJSON({ error: "Invalid or expired token" });

  const studentNo = String(tokenRow[1]).trim();
  if (!studentNo) return sendJSON({ error: "Invalid student linked to token" });

  const sheetName = e.parameter.sheet || "2-2526";
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return sendJSON({ error: `Sheet '${sheetName}' not found` });

  const data = sheet.getDataRange().getDisplayValues();
  if (data.length < 4) return sendJSON({ error: "Not enough data rows" });

  const headers = data[2];
  const subjectNames = data[2].slice(2);
  const subjectLabels = data[3].slice(2);
  const rows = data.slice(4);

  const studentNoCol = headers.indexOf("STDNT NO");
  const nameCol = headers.indexOf("STUDENT NAME");

  if (studentNoCol === -1) return sendJSON({ error: "Missing 'STDNT NO' column" });

  const foundRow = rows.find(
    (r) => String(r[studentNoCol]).trim().toLowerCase() === studentNo.toLowerCase()
  );

  if (!foundRow) return sendJSON({ error: `Student '${studentNo}' not found` });

  const student = buildStudentObject(foundRow, headers, nameCol, subjectNames, subjectLabels);
  return sendJSON(student);
}


// Build student object with grades
function buildStudentObject(row, headers, nameCol, subjectNames, subjectLabels) {
  const student = {
    StudentNo: String(row[headers.indexOf("STDNT NO")]).trim(),
    Name: nameCol >= 0 ? String(row[nameCol]).trim() : "",
    Grades: [],
  };

  let currentSubject = null;
  let currentGrades = [];

  for (let col = nameCol + 1; col < headers.length; col++) {
    const subject = subjectNames[col - 2]?.trim();
    const label = subjectLabels[col - 2]?.trim();
    const value = row[col];

    if (subject && subject !== currentSubject) {
      if (currentSubject) {
        student.Grades.push({ Subject: currentSubject, Grades: currentGrades });
      }
      currentSubject = subject;
      currentGrades = [];
    }

    currentGrades.push({ Label: label, Value: value });
  }

  if (currentSubject) {
    student.Grades.push({ Subject: currentSubject, Grades: currentGrades });
  }

  return student;
}

// Utility: Return JSON response
function sendJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
