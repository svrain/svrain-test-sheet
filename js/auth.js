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

// 로그인 상태 확인
function isLoggedIn() {
    return sessionStorage.getItem("isLoggedIn") === "true"
}

// 로그인 상태 체크 및 UI 업데이트
function checkLoginStatus() {
    if (isLoggedIn()) {
        // 로그인 상태 UI 표시
        const loggedOutElement = document.getElementById("logged-out")
        const loggedInElement = document.getElementById("logged-in")

        if (loggedOutElement) loggedOutElement.style.display = "none"
        if (loggedInElement) loggedInElement.style.display = "block"

        // 사용자 정보 가져오기
        const userData = JSON.parse(localStorage.getItem("userData"))
        if (userData) {
            // 사용자 정보 표시
            const userNameElement = document.getElementById("user-name")
            const userEmailElement = document.getElementById("user-email")
            const userPhoneElement = document.getElementById("user-phone")
            const userAddressElement = document.getElementById("user-address")

            if (userNameElement) userNameElement.textContent = userData.name
            if (userEmailElement) userEmailElement.textContent = userData.email
            if (userPhoneElement) userPhoneElement.textContent = userData.phone
            if (userAddressElement) userAddressElement.textContent = userData.address
        }
    } else {
        // 로그아웃 상태 UI 표시
        const loggedOutElement = document.getElementById("logged-out")
        const loggedInElement = document.getElementById("logged-in")

        if (loggedOutElement) loggedOutElement.style.display = "block"
        if (loggedInElement) loggedInElement.style.display = "none"
    }
}

// 로그아웃
function logout() {
    // Google 로그아웃
    if (typeof gapi !== "undefined" && gapi) {
        const auth2 = gapi.auth2.getAuthInstance()
        if (auth2) {
            auth2.signOut().then(() => {
                console.log("User signed out.")
                // 세션 스토리지 초기화
                sessionStorage.removeItem("isLoggedIn")
                sessionStorage.removeItem("googleUserId")
                sessionStorage.removeItem("googleUserEmail")
                sessionStorage.removeItem("googleUserName")
                sessionStorage.removeItem("googleUserToken")

                // 페이지 리디렉션 또는 UI 업데이트
                window.location.href = "/" // 예시: 홈페이지로 리디렉션
            })
        }
    } else {
        // gapi가 정의되지 않은 경우에 대한 처리
        console.error("gapi is not defined. Ensure Google API is loaded.")
        // 필요한 경우 오류 처리 또는 대체 로직 실행
    }
}

// Google 로그아웃
function signOut() {
    if (typeof gapi !== "undefined" && gapi) {
        const auth2 = gapi.auth2.getAuthInstance()
        if (auth2) {
            auth2.signOut().then(() => {
                console.log("User signed out.")
            })
        }
    }
}
