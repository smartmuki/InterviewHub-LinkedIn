// JavaScript source code
var questionResponse;
var timeRemaining;
var aadharVerified = false;
var photoCaptured = false;

function getOtp() {
    $("#aadharDiv").hide();
    $("#otpDiv").show();
}

function aadharSuccess() {
    $("#aadhar1").hide();
    $("#aadharverified").show();

    aadharVerified = true;
    showMainDiv();
}

function showMainDiv() {
    if (aadharVerified && photoCaptured) {
        $("#firstPage").hide();
        $("#photoCaptureDiv").hide();
        $("#mainPageCode").show();
        $("#mainPageCode").css("display", "table");
    }
}

function captureSnapshot() {
    var canv = document.getElementById("imageCanvas");
    var ctx = canv.getContext("2d");
    ctx.drawImage(video, 0, 0);
    var url = canv.toDataURL('image/webp');

    var param = {
        Extension: ".png",
        Content: url
    }
    var paramsJson = JSON.stringify(param);
    postData("http://recruit-linkedin-be.cloudapp.net/api/UploadFiles", paramsJson, afterVideoUpload, "application/json");
}

function beginTimer(timerId) {
    // Set the date we're counting down to
    var countDownDate = new Date();
    countDownDate.setMinutes(countDownDate.getMinutes() + 150);
    
    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now an the count down date
        var distance = countDownDate - now;
        timeRemaining = distance;

        // Time calculations for days, hours, minutes and seconds
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        document.getElementById(timerId).innerHTML = hours + "h "
        + minutes + "m " + seconds + "s ";

        // If the count down is over, write some text 
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("demo").innerHTML = "EXPIRED";
        }
    }, 1000);
}

function handleQuestionCallBack(resp) {
    
}

function submitQuestionCallback(fileId) {
    var resp = questionResponse[0];
    if(resp.Answer != null) {
        resp.Answer.AnswerLink = fileId;
    } else {
            resp.Answer = {
                AnswerLink: fileId
        }
    }

    var params = JSON.stringify(resp);
    putData("http://recruit-linkedin-be.cloudapp.net/api/InterviewRounds/d57863cd-ee8a-4ebf-8f7a-1a477fc64565/QuestionAnswers/" + resp.Id, params, handleQuestionCallBack);
}

function handleSubmitResponse(response) {
    var res = JSON.parse(response);
    $("#message").css("display", "inline");
    if (res.IsSuccess == true) {        
        $("#messageText").css("color", "green");
        document.getElementById("messageText").innerHTML = "Program submitted successfully.";
        if (timeRemaining > 0) {
            document.getElementById("codeArea").value = '';
            getQuestion(true);
        }
        //submitQuestionCallback(res.FileId);
    } else {
        $("#messageText").css("color", "red");
        document.getElementById("messageText").innerHTML = "There was an error. Please try again.";
    }
}

function handleQuestionResponse(response) {
    questionResponse = JSON.parse(response);
    if (questionResponse.length > 0) {
        var questionText = questionResponse[0].Question.BlobText;
    }
    document.getElementById("question").innerHTML = questionText;
}

function getQuestion(isNext) {
    getData("http://recruit-linkedin-be.cloudapp.net/api/InterviewRounds/d57863cd-ee8a-4ebf-8f7a-1a477fc64565/QuestionAnswers?Next=" + isNext, handleQuestionResponse);
}

function submitProgram() {
    var sourceCode = $("#codeArea").val();
    var param = {
        Extension: ".txt",
        Content: sourceCode
    }
    var paramsJson = JSON.stringify(param);
    //var param = "Extension=.txt&Content=" + sourceCode;
    postData("http://recruit-linkedin-be.cloudapp.net/api/UploadFiles", paramsJson, handleSubmitResponse, "application/json");
}

function handleCompileResponse(response) {
    var res = JSON.parse(response);
    var resText = "";
    if (res.result.message != null && res.result.message.length > 0) {
        for (i = 0; i < res.result.message.length; i++) {
            resText += res.result.message[i] + "\n";
        }
        $("#messageText").css("color", "green");
    } else {
        resText = res.result.compilemessage;
        $("#messageText").css("color", "red");
    }

    $("#message").css("display", "inline");
    document.getElementById("messageText").innerHTML = resText;
}

function getLanguageCode(lang) {
    switch(lang) {
        case "C": return 1;
        case "C++": return 2;
        case "Java": return 3;
        case "Python": return 5;
    }
    return 9;
}

function compileProgram() {
    var langDropDown = document.getElementById("globalfooter-select_language");
    var lang = langDropDown.options[langDropDown.selectedIndex].value;

    var sourceCode = $("#codeArea").val();
    var langCode = getLanguageCode(lang);
    var params = "source=" + sourceCode + "&lang=" + langCode + "&testcases=[\"1\"]&api_key=hackerrank|157661-1635|427f50c06fe4fcb0a2872f12545771f250bdfc31&callback=?";
    postData("http://api.hackerrank.com/checker/submission.json", params, handleCompileResponse, "application/x-www-form-urlencoded");
    
}

function getData(url, callbackFunc) {
    var http = new XMLHttpRequest();
    //var url = "get_data.php";
    //var params = "lorem=ipsum&name=binny";
    http.open("GET", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            callbackFunc(http.responseText);
        }
    }

    http.send();
}

function postData(url, params, callbackFunc, contentType) {
    var http = new XMLHttpRequest();
    //var url = "get_data.php";
    //var params = "lorem=ipsum&name=binny";
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", contentType);

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            callbackFunc(http.responseText);
        }
    }

    http.send(params);
}

function afterVideoUpload(res) {
    photoCaptured = true;
    showMainDiv();
    console.log('video uploaded');
}

function putData(url, params, callbackFunc) {
    var http = new XMLHttpRequest();
    //var url = "get_data.php";
    //var params = "lorem=ipsum&name=binny";
    http.open("PUT", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            callbackFunc(http.responseText);
        }
    }

    http.send(params);
}

function sendVideoXHR() {
    var xhr = new XMLHttpRequest();
    var video = $("#videoElement");
    xhr.open('GET', video.src, true);
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
        if (this.status == 200) {
            // Note: .response instead of .responseText
            var blob = new Blob([this.response], { type: 'video/webm' });
            var param = {
                Extension: ".webm",
                Content: blob
            }
            postData("http://recruit-linkedin-be.cloudapp.net/api/UploadFiles", JSON.stringify(param), afterVideoUpload, "application/json");
        }
    };
    xhr.send();
}

