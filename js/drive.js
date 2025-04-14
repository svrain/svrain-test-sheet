// Google API 클라이언트 라이브러리 로드
// gapi is implicitly loaded by the google platform script in index.html

// 관리자 스프레드시트 ID
const SPREADSHEET_ID = "1fBMM2ad-_Ufp64ug6z8BiJhctR6xmE0w0Mq8VE9S9vE"

// Google Drive에 새 스프레드시트 생성
async function createSpreadsheet(name, email) {
  return new Promise((resolve, reject) => {
    // Google API 로드 확인
    if (typeof gapi === "undefined") {
      reject(new Error("Google API가 로드되지 않습니다. 페이지를 새로고침하고 다시 시도하세요."))
      return
    }

    if (!gapi.client || !gapi.client.sheets) {
      reject(new Error("Google Sheets API가 초기화되지 않았습니다."))
      return
    }

    // 액세스 토큰 확인 및 설정
    const accessToken = sessionStorage.getItem("googleAccessToken")
    if (accessToken) {
      gapi.client.setToken({
        access_token: accessToken,
      })
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
            range: "회원정보!A1:B1",
            valueInputOption: "RAW",
            resource: {
              values: [["이름", "이메일"]],
            },
          })
          .then(() => {
            // 사용자 데이터 추가
            return gapi.client.sheets.spreadsheets.values.update({
              spreadsheetId: spreadsheetId,
              range: "회원정보!A2:B2",
              valueInputOption: "RAW",
              resource: {
                values: [[name, email]],
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

// 관리자 스프레드시트에 사용자 정보 추가 (주소, 전화번호 제거)
async function addUserToSpreadsheet(name, email) {
  return new Promise((resolve, reject) => {
    console.log("스프레드시트에 사용자 추가 시작:", name, email)

    // Google API 로드 확인
    if (typeof gapi === "undefined") {
      console.error("Google API(gapi)가 정의되지 않았습니다.")
      reject(new Error("Google API가 로드되지 않았습니다."))
      return
    }

    if (!gapi.client) {
      console.error("gapi.client가 정의되지 않았습니다.")
      reject(new Error("Google API 클라이언트가 초기화되지 않았습니다."))
      return
    }

    if (!gapi.client.sheets) {
      console.error("gapi.client.sheets가 정의되지 않았습니다.")
      reject(new Error("Google Sheets API가 로드되지 않았습니다."))
      return
    }

    // 액세스 토큰 확인 및 설정
    const accessToken = sessionStorage.getItem("googleAccessToken")
    if (accessToken) {
      gapi.client.setToken({
        access_token: accessToken,
      })
    }

    console.log("스프레드시트 ID:", SPREADSHEET_ID)

    // 먼저 현재 데이터를 가져와서 마지막 행 확인
    gapi.client.sheets.spreadsheets.values
      .get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Sheet1!A:B", // A열과 B열만 가져옴
      })
      .then((response) => {
        console.log("스프레드시트 데이터 가져오기 성공:", response)
        const values = response.result.values || []
        const nextRow = values.length + 1 // 다음 행 번호 계산

        console.log("다음 행 번호:", nextRow)

        // 사용자 데이터 추가 (이메일과 이름만)
        return gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Sheet1!A${nextRow}:B${nextRow}`,
          valueInputOption: "RAW",
          resource: {
            values: [[email, name]], // A열에 이메일, B열에 이름
          },
        })
      })
      .then((updateResponse) => {
        console.log("스프레드시트 업데이트 성공:", updateResponse)
        resolve({
          result: updateResponse.result,
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

// Google API 초기화 및 스프레드시트 API 로드
function initSheetsAPI() {
  return new Promise((resolve, reject) => {
    console.log("Google Sheets API 초기화 시작")

    if (typeof gapi === "undefined") {
      console.error("gapi가 정의되지 않았습니다.")
      reject(new Error("Google API가 로드되지 않았습니다."))
      return
    }

    // gapi.client가 이미 초기화되었는지 확인
    if (gapi.client && gapi.client.sheets) {
      console.log("Google Sheets API가 이미 초기화되어 있습니다.")

      // 액세스 토큰 확인 및 설정
      const accessToken = sessionStorage.getItem("googleAccessToken")
      if (accessToken) {
        gapi.client.setToken({
          access_token: accessToken,
        })
      }

      resolve()
      return
    }

    gapi.load("client:auth2", () => {
      console.log("gapi.client 로드 완료")

      gapi.client
        .init({
          apiKey: "AIzaSyDsrXQm1ch1H3OIQJWUjUnDMfF_yVboKtQ", // Google API 키 입력
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4",
            "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
          ],
          clientId: "396207225030-154qdg1rqog8s809t5ud19clqfq1o6gn.apps.googleusercontent.com", // 클라이언트 ID 입력
          scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
        })
        .then(() => {
          console.log("Google Sheets API 초기화 완료")

          // 액세스 토큰 확인 및 설정
          const accessToken = sessionStorage.getItem("googleAccessToken")
          if (accessToken) {
            gapi.client.setToken({
              access_token: accessToken,
            })
            resolve()
            return
          }

          // 사용자 인증 확인
          if (gapi.auth2) {
            const authInstance = gapi.auth2.getAuthInstance()
            if (authInstance) {
              const isSignedIn = authInstance.isSignedIn.get()
              if (!isSignedIn) {
                console.log("사용자가 로그인되어 있지 않습니다. 로그인 시도...")
                return authInstance
                  .signIn({
                    prompt: "consent", // 항상 동의 화면 표시
                    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
                  })
                  .then(() => {
                    console.log("사용자 로그인 성공")

                    // 액세스 토큰 저장
                    const googleUser = authInstance.currentUser.get()
                    const authResponse = googleUser.getAuthResponse(true)
                    if (authResponse && authResponse.access_token) {
                      sessionStorage.setItem("googleAccessToken", authResponse.access_token)
                      gapi.client.setToken({
                        access_token: authResponse.access_token,
                      })
                    }

                    resolve()
                  })
                  .catch((error) => {
                    console.error("사용자 로그인 실패:", error)
                    reject(error)
                  })
              } else {
                // 이미 로그인된 경우 액세스 토큰 저장
                const googleUser = authInstance.currentUser.get()
                const authResponse = googleUser.getAuthResponse(true)
                if (authResponse && authResponse.access_token) {
                  sessionStorage.setItem("googleAccessToken", authResponse.access_token)
                  gapi.client.setToken({
                    access_token: authResponse.access_token,
                  })
                }
              }
            }
          }

          resolve()
        })
        .catch((error) => {
          console.error("Google Sheets API 초기화 오류:", error)
          reject(error)
        })
    })
  })
}

// 사용자 등록 및 스프레드시트에 정보 저장 (주소, 전화번호 제거)
async function registerUserToSpreadsheet(userData) {
  try {
    console.log("스프레드시트에 사용자 등록 시작:", userData)

    if (!userData || !userData.name || !userData.email) {
      throw new Error("사용자 정보가 올바르지 않습니다.")
    }

    // 1. 사용자 계정에 스프레드시트 생성
    const userSpreadsheet = await createSpreadsheet(userData.name, userData.email)
    console.log("사용자 스프레드시트 생성 완료:", userSpreadsheet)

    // 2. 관리자 스프레드시트에 사용자 정보 추가
    const adminResult = await addUserToSpreadsheet(userData.name, userData.email)
    console.log("관리자 스프레드시트 업데이트 완료:", adminResult)

    return {
      userSpreadsheet,
      adminResult,
    }
  } catch (error) {
    console.error("사용자 등록 오류:", error)
    throw error
  }
}