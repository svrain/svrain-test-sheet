// 관리자 스프레드시트 ID
const SPREADSHEET_ID = "1fBMM2ad-_Ufp64ug6z8BiJhctR6xmE0w0Mq8VE9S9vE"

// Google Drive에 새 스프레드시트 생성
async function createSpreadsheet(name, email, phone, address) {
  return new Promise((resolve, reject) => {
    // Google API 로드 확인
    if (!gapi.client || !gapi.client.sheets) {
      reject(new Error("Google API가 로드되지 않습니다. 페이지를 새로고침하고 다시 시도하세요."))
      return
    }

    // 스프레드시트 생성
    gapi.client.sheets.spreadsheets
      .create({
        properties: {
          title: `회원 정보 - ${name}`,
        },
        sheets: [
          {
            properties: {
              title: "회원정보",
            },
          },
        ],
      })
      .then((response) => {
        const spreadsheetId = response.result.spreadsheetId

        // 헤더 추가
        return gapi.client.sheets.spreadsheets.values
          .update({
            spreadsheetId: spreadsheetId,
            range: "회원정보!A1:D1",
            valueInputOption: "RAW",
            resource: {
              values: [["이름", "이메일", "전화번호", "주소"]],
            },
          })
          .then(() => {
            // 사용자 데이터 추가
            return gapi.client.sheets.spreadsheets.values.update({
              spreadsheetId: spreadsheetId,
              range: "회원정보!A2:D2",
              valueInputOption: "RAW",
              resource: {
                values: [[name, email, phone, address]],
              },
            })
          })
          .then(() => {
            // 스프레드시트 서식 지정
            return gapi.client.sheets.spreadsheets.batchUpdate({
              spreadsheetId: spreadsheetId,
              resource: {
                requests: [
                  {
                    repeatCell: {
                      range: {
                        sheetId: 0,
                        startRowIndex: 0,
                        endRowIndex: 1,
                      },
                      cell: {
                        userEnteredFormat: {
                          backgroundColor: {
                            red: 0.8,
                            green: 0.8,
                            blue: 0.8,
                          },
                          horizontalAlignment: "CENTER",
                          textFormat: {
                            bold: true,
                          },
                        },
                      },
                      fields: "userEnteredFormat(backgroundColor, textFormat, horizontalAlignment)",
                    },
                  },
                ],
              },
            })
          })
          .then(() => {
            // 성공 응답
            resolve({
              spreadsheetId: spreadsheetId,
              spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
            })
          })
      })
      .catch((error) => {
        console.error("스프레드시트 생성 오류:", error)
        reject(error)
      })
  })
}

// Fix the addUserToSpreadsheet function to ensure it works with the specified spreadsheet ID
async function addUserToSpreadsheet(name, email, phone, address) {
  return new Promise((resolve, reject) => {
    // Google API 로드 확인
    if (!gapi.client || !gapi.client.sheets) {
      reject(new Error("Google API가 로드되지 않습니다. 페이지를 새로고침하고 다시 시도하세요."))
      return
    }

    console.log("Adding user to spreadsheet:", name, email, phone, address)
    console.log("Using spreadsheet ID:", SPREADSHEET_ID)

    // 사용자 데이터 추가
    gapi.client.sheets.spreadsheets.values
      .append({
        spreadsheetId: SPREADSHEET_ID,
        range: "회원정보!A:D",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [[name, email, phone, address]],
        },
      })
      .then((response) => {
        console.log("Spreadsheet append response:", response)
        resolve({
          result: response.result,
          spreadsheetId: SPREADSHEET_ID,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`,
        })
      })
      .catch((error) => {
        console.error("스프레드시트 데이터 추가 오류:", error)
        reject(error)
      })
  })
}

// 스프레드시트에서 모든 사용자 데이터 가져오기
async function getAllUsers() {
  return new Promise((resolve, reject) => {
    // Google API 로드 확인
    if (!gapi.client || !gapi.client.sheets) {
      reject(new Error("Google API가 로드되지 않습니다. 페이지를 새로고침하고 다시 시도하세요."))
      return
    }

    // 스프레드시트 ID 확인
    if (
      !SPREADSHEET_ID ||
      SPREADSHEET_ID === "396207225030-154qdg1rqog8s809t5ud19clqfq1o6gn.apps.googleusercontent.com"
    ) {
      reject(new Error("스프레드시트 ID가 설정되지 않았습니다. drive.js 파일에서 SPREADSHEET_ID를 설정하세요."))
      return
    }

    // 데이터 가져오기
    gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: SPREADSHEET_ID,
        range: "회원정보!A:D",
      })
      .then((response) => {
        const values = response.result.values || []

        // 헤더 행이 있는 경우 제외
        const headers = values.length > 0 ? values[0] : ["이름", "이메일", "전화번호", "주소"]
        const users = values.slice(1).map((row) => {
          const user = {}
          headers.forEach((header, index) => {
            user[header] = row[index] || ""
          })
          return user
        })

        resolve(users)
      })
      .catch((error) => {
        console.error("사용자 데이터 가져오기 오류:", error)
        reject(error)
      })
  })
}

// Google API 초기화 및 스프레드시트 API 로드
let gapi // gapi 변수 선언

function initSheetsAPI() {
  return new Promise((resolve, reject) => {
    if (typeof gapi === "undefined") {
      reject(new Error("Google API가 로드되지 않았습니다."))
      return
    }

    gapi.load("client", () => {
      gapi.client
        .init({
          apiKey: "AIzaSyDsrXQm1ch1H3OIQJWUjUnDMfF_yVboKtQ", // Google API 키 입력
          discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
          clientId: "396207225030-154qdg1rqog8s809t5ud19clqfq1o6gn.apps.googleusercontent.com", // 클라이언트 ID 입력
          scope: "https://www.googleapis.com/auth/spreadsheets",
        })
        .then(() => {
          console.log("Google Sheets API 초기화 완료")
          resolve()
        })
        .catch((error) => {
          console.error("Google Sheets API 초기화 오류:", error)
          reject(error)
        })
    })
  })
}

// Update the registerUserToSpreadsheet function to properly handle the spreadsheet ID
async function registerUserToSpreadsheet(userData) {
  try {
    console.log("Registering user to spreadsheet:", userData)
    // Always use the existing spreadsheet ID
    return await addUserToSpreadsheet(userData.name, userData.email, userData.phone, userData.address)
  } catch (error) {
    console.error("사용자 등록 오류:", error)
    throw error
  }
}
