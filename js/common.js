// 페이지 로드 시 Google API 초기화
function initGoogleAPI() {
    if (typeof gapi !== "undefined") {
        gapi.load("client:auth2", () => {
            gapi.client.init({
                apiKey: "AIzaSyDsrXQm1ch1H3OIQJWUjUnDMfF_yVboKtQ",
                client_id: "396207225030-154qdg1rqog8s809t5ud19clqfq1o6gn.apps.googleusercontent.com",
                discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
                scope: "https://www.googleapis.com/auth/spreadsheets"
            }).then(() => {
                console.log("Google API 초기화 완료");
            }).catch(error => {
                console.error("Google API 초기화 오류:", error);
            });
        });
    } else {
        console.error("Google API (gapi) is not loaded.");
    }
}

// 문서 로드 완료 시 실행
document.addEventListener("DOMContentLoaded", () => {
    // Google API 스크립트가 로드되었는지 확인
    if (typeof gapi !== "undefined") {
        initGoogleAPI()
    } else {
        console.warn("Google API not available on DOMContentLoaded")
    }
})
