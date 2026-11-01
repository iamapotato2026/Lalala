let date = document.getElementById("date")
let time = document.getElementById("time")

function setTime(){
    let now = new Date()

    let hours = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()

    let day = now.getDay()
    let month = now.getMonth() + 1
    let year = now.getFullYear()

    let ampm = hours >= 12 ? "PM" : "AM"

    if(hours < 10) {
        hours="0" + hours
    }

    if(minutes < 10) {
        minutes="0" + minutes
    }

    if(seconds < 10) {
        seconds="0" + seconds
    }

    if(day < 10) {
        day="0" + day
    }

    if(month < 10) {
        month="0" + month
    }

    let currentTime = hours + ":" + minutes + ":" + seconds + " " + ampm
    let currentDate = day + "/" + month + "/" + year

    time.textContent = currentTime
    date.textContent = currentDate
}

setInterval(setTime,1000)
setTime()
