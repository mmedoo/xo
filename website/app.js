let player = 0;
let stop = 1;
let turn = 1;
let sync = 0;
let here = 1;
const contain = document.querySelector('.container2');
const head = document.querySelector('.header');
const reset = document.querySelector('.reset');
contain.style.filter = "grayscale(1)";
const webSkts = [];
function go() {
  head.style.color = "green";
  head.innerText = "Your turn, go ahead!";
}
function hold() {
  head.style.color = "red";
  head.innerText = "Hold on! your opponent's turn";
}
function checkTurn(t) {
    if (player == 1) {
        if (t == 1) {
            stop = 0;
            let here = 1;
            go();
            contain.style.filter = "none";
        } else {
            stop = 1;
            let here = 0;
            hold();
            contain.style.filter = "grayscale(1)";
        }
    } else if (player == 2) {
        if (t == 1) {
            stop = 1;
            let here = 0;
            hold();
            contain.style.filter = "grayscale(1)";
        } else {
            stop = 0;
            let here = 1;
            go();
            contain.style.filter = "none";
        }
    } else if (player > 2) {
        head.innerText = "Enjoy the game, you're a viewer"
        contain.style.filter = "none";
        stop = 1;
        reset.style.display = "none";
    } else {
        stop = 1;
    }
}
const getEnd = async (url = '',data = {})=>{
      const response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json',},
      body: JSON.stringify(data),
    });
      try {
        const endPoint = await response.json();
        if (!endPoint) {
          if (url === "/join") {
            head.innerText = "fuck you no room with such a name! ";
          } else {
            head.innerText = "This room name is taken";
          }
          return;
        }
        console.log(endPoint);
        let myNum = endPoint.porto;
        console.log(myNum);
        player = myNum[myNum.length-1];
        let link = location.origin.replace(/^http/,'ws');
        //const ws = new WebSocket(link);
        const ws = new WebSocket(link+":"+porto);
        webSkts[0] = ws;
        ws.addEventListener("open",()=>{
          if (!sync) checkTurn(turn);
          if (endPoint.moves) {
            console.log(endPoint.moves);
            sync = 1;
            stop = 0;
            for (let i = 0; i < endPoint.moves.length; i++) {
              boxes[endPoint.moves[i]].click();
            }
            sync = 0;
            stop = 1;
          }
          console.log("WebSocket Connected");
        });
        ws.addEventListener("message",(event)=>{
          let press = JSON.parse(event.data)[0];
          if (press == 99) {
            resetGame();
          } else {
            stop = 0;
            boxes[press].click();
          }
        });
        console.log(`player ${player}`);
      }
      catch (error) {
      console.error(error);
      }
}
function create() {
    if (input.value != '') {
      let room = input.value;
      getEnd('/create',{room});
    }
}
function join() {
    if (input.value != '') {
          let room = input.value;
          getEnd('/join',{room});
    }
}
const input = document.querySelector('input');
const boxes = document.querySelectorAll('.inner2');
const c1 = document.querySelectorAll(".c1");
const c2 = document.querySelectorAll(".c2");
const c3 = document.querySelectorAll(".c3");
const r1 = document.querySelectorAll(".r1");
const r2 = document.querySelectorAll(".r2");
const r3 = document.querySelectorAll(".r3");
const xltr = document.querySelectorAll(".xltr");
const xrtl = document.querySelectorAll(".xrtl");
const rows = [c1,c2,c3,r1,r2,r3,xrtl,xltr];
function prevent() {
    for (let index of boxes) {
          index.classList.remove('hoverX','hoverO');
          index.classList.add('end');
    }
    stop = 1;
    contain.style.filter = "none";
}
function checkEnd(array){
    let innerT = "";
    for (let i = 0; i < 3; i++)  innerT += array[i].innerText;
    if (innerT === "XXX") {
      prevent();
      for (let piece of array){
          piece.classList.add('winnerX');
          piece.classList.remove('end','playX');
      }
      return 1;
  } else if (innerT === "OOO") {
      prevent();
      for (let piece of array){
          piece.classList.add('winnerO');
          piece.classList.remove('end','playO');
      }
      return 1;
  }
}
reset.addEventListener('click',()=>{
  resetGame();
  webSkts[0].send(JSON.stringify({0:99}));
})
function resetGame() {
  for (let box of boxes) {
    box.innerText = '';
    box.classList.add('hoverX');
    box.classList.remove('winnerX','winnerO','playX','playO','end','hoverO');
    box.id = '';
    turn = 1;
    checkTurn(turn);
  }
}
for (let box of boxes){
    box.addEventListener('click',function(){
          if (stop) return 0;
          if (box.id == '') {
                if (turn) {
                    box.innerText = 'X';
                    box.classList.add('playX');
                    for (let boix of boxes) {
                        if (boix.id != 'pressed')  boix.classList.add('hoverO');
                    }
                } else {
                    box.innerText = 'O';
                    box.classList.add('playO');
                    for (let boix of boxes) {
                        boix.classList.remove('hoverO');
                    }
                }
                box.classList.remove('hoverX','hoverO');
                let arra = Array.from(boxes);
                if (here) webSkts[0].send(JSON.stringify({0:arra.indexOf(box)}));
          } else  turn = !turn;
          turn = !turn;
          if (!sync) checkTurn(turn);
          box.id = 'pressed';
          for (let row of rows)  if (checkEnd(row))  return 0;
          let pressure = document.querySelectorAll("#pressed");
          if (pressure.length == 9)  prevent();
    })
}
