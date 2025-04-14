// Google API 초기화 (window.onload 또는 적절한 시점에 호출)
function initGapi() {
    return new Promise((resolve, reject) => {
        if (typeof gapi === "undefined") {
            console.error("Google API가 로드되지 않았습니다.")
            reject(new Error("Google API가 로드되지 않았습니다."))
            return
        }

        // auth2가 이미 초기화되었는지 확인
        if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
            console.log("Google Auth API already initialized")
            resolve(gapi.auth2.getAuthInstance())
            return
        }

        gapi.load("auth2", () => {
            try {
                gapi.auth2
                    .init({
                        client_id: "396207225030-154qdg1rqog8s809t5ud19clqfq1o6gn.apps.googleusercontent.com",
                        scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive",
                        ux_mode: "popup",
                        redirect_uri: "https://svrain.github.io/svrain-test-sheet/callback.html",
                    })
                    .then(
                        (authInstance) => {
                            console.log("Google Auth API initialized successfully")
                            resolve(authInstance)
                        },
                        (error) => {
                            console.error("Error initializing Google Auth API:", error)
                            reject(error)
                        },
                    )
            } catch (error) {
                console.error("Exception during gapi.auth2.init:", error)
                reject(error)
            }
        })
    })
}

// 로그인 상태 확인 함수 수정
function isLoggedIn() {
    try {
        return sessionStorage.getItem("isLoggedIn") === "true"
    } catch (error) {
        console.error("sessionStorage 접근 오류:", error)
        return false
    }
}

// 로그인 상태 체크 및 UI 업데이트 함수 수정
function checkLoginStatus() {
    try {
        if (isLoggedIn()) {
            // 로그인 상태 UI
            const loggedOutElement = document.getElementById("logged-out")
            const loggedInElement = document.getElementById("logged-in")

            if (loggedOutElement) loggedOutElement.style.display = "none"
            if (loggedInElement) loggedInElement.style.display = "block"

            // 사용자 정보 가져오기
            const userData = JSON.parse(localStorage.getItem("userData") || "{}")
            if (userData) {
                // 사용자 이름만 표시
                const userNameElement = document.getElementById("user-name")
                if (userNameElement) userNameElement.textContent = userData.name || ""
            }
        } else {
            // 로그아웃 상태 UI 표시
            const loggedOutElement = document.getElementById("logged-out")
            const loggedInElement = document.getElementById("logged-in")

            if (loggedOutElement) loggedOutElement.style.display = "block"
            if (loggedInElement) loggedInElement.style.display = "none"
        }
    } catch (error) {
        console.error("UI 업데이트 오류:", error)
    }
}

// 로그아웃
function logout() {
    // 세션 스토리지 초기화
    sessionStorage.removeItem("isLoggedIn")
    sessionStorage.removeItem("googleUserId")
    sessionStorage.removeItem("googleUserEmail")
    sessionStorage.removeItem("googleUserName")
    sessionStorage.removeItem("googleUserToken")
    sessionStorage.removeItem("googleAccessToken")
    // Google 로그아웃
    if (typeof gapi !== "undefined" && gapi.auth2) {
        const auth2 = gapi.auth2.getAuthInstance()
        if (auth2) {
            auth2.signOut().then(() => {
                console.log("User signed out.")
                // 페이지 리디렉션 또는 UI 업데이트
                window.location.href = "index.html" // 홈페이지로 리디렉션
            })
        }
    } else {
        // gapi가 정의되지 않은 경우에 대한 처리
        console.error("gapi is not defined. Ensure Google API is loaded.")
        window.location.href = "index.html" // 홈페이지로 리디렉션
    }
}
