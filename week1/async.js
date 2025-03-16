
var async = function () {
    setTimeout(function () { log("I am coming out later") }, 2000)
}

var adder = function (first, second) {
    var sum = first + second
    return sum
}

var log = function (msg) {
    console.log("[Log] : ", msg)
}

log("The sum is: " + adder(5, 7))
async();
log("This is going to come out before")
