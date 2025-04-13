// 페이지 로드 시 Google API 초기화
function initGoogleAPI() {
    return new Promise((resolve, reject) => {
      if (typeof gapi === "undefined") {
        console.warn("Google API not available yet, waiting for load")
        // gapi가 로드될 때까지 기다림
        const checkGAPI = setInterval(() => {
          if (typeof gapi !== "undefined") {
            clearInterval(checkGAPI)
            initGAPIClient().then(resolve).catch(reject)
          }
        }, 100)
  
        // 10초 후에도 로드되지 않으면 타임아웃
        setTimeout(() => {
          clearInterval(checkGAPI)
          reject(new Error("Google API 로드 타임아웃"))
        }, 10000)
      } else {
        initGAPIClient().then(resolve).catch(reject)
      }
    })
  }
  
  // gapi 클라이언트 초기화
  function initGAPIClient() {
    return new Promise((resolve, reject) => {
      gapi.load("client:auth2", () => {
        gapi.client
          .init({
            apiKey: "AIzaSyDsrXQm1ch1H3OIQJWUjUnDMfF_yVboKtQ",
            clientId: "396207225030-154qdg1rqog8s809t5ud19clqfq1o6gn.apps.googleusercontent.com",
            discoveryDocs: [
              "https://sheets.googleapis.com/$discovery/rest?version=v4",
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
            ],
            scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
            prompt: "consent", // 항상 동의 화면 표시
          })
          .then(() => {
            console.log("Google API 초기화 완료")
  
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
                    })
                    .then(() => {
                      console.log("사용자 로그인 성공")
                      resolve()
                    })
                    .catch((error) => {
                      console.error("사용자 로그인 실패:", error)
                      reject(error)
                    })
                }
              }
            }
  
            resolve()
          })
          .catch((error) => {
            console.error("Google API 초기화 오류:", error)
            reject(error)
          })
      })
    })
  }
  
  // 문서 로드 완료 시 실행
  document.addEventListener("DOMContentLoaded", () => {
    // Google API 스크립트가 로드되었는지 확인
    if (typeof gapi !== "undefined") {
      initGoogleAPI().catch((error) => {
        console.warn("Google API 초기화 실패:", error)
      })
    } else {
      console.warn("Google API not available on DOMContentLoaded")
      // 스크립트 로드 완료 후 초기화 시도
      window.addEventListener("load", () => {
        if (typeof gapi !== "undefined") {
          initGoogleAPI().catch((error) => {
            console.warn("Google API 초기화 실패:", error)
          })
        }
      })
    }
  })
  