(function () {
  "use strict";

  // 1. Ορισμός Ήχων (Αντικατάστησε τα ονόματα με τα δικά σου αρχεία)
  const spinSound = new Audio("spin.mp3");
  const winSound = new Audio("win.mp3");

  const items = ["7️⃣", "🔔", "🍒", "🍓", "🍋", "🍊", "🍑", "🍇", "🍉"];
  document.querySelector(".info").textContent = items.join(" ");

  const doors = document.querySelectorAll(".door");
  document.querySelector("#spinner").addEventListener("click", spin);

  async function spin() {
    const btn = document.querySelector("#spinner");
    const infoText = document.querySelector(".info");
    
    // Αναπαραγωγή ήχου spin
    spinSound.currentTime = 0;
    spinSound.play();

    btn.style.pointerEvents = "none";
    infoText.textContent = items.join(" "); 
    infoText.style.color = "white";

    init(false, 1, 2);

    // Καθυστέρηση για ομαλό animation σε όλες τις πόρτες
    await new Promise((resolve) => setTimeout(resolve, 50));

    const spins = Array.from(doors).map((door) => {
      return new Promise((resolve) => {
        const boxes = door.querySelector(".boxes");
        const duration = parseFloat(boxes.style.transitionDuration);
        boxes.style.transform = "translateY(0)";
        setTimeout(resolve, duration * 1000);
      });
    });

    await Promise.all(spins);
    
    checkResult();
    btn.style.pointerEvents = "auto";
  }

  function init(firstInit = true, groups = 1, duration = 1) {
    for (const door of doors) {
      if (firstInit) {
        door.dataset.spinned = "0";
      }

      const boxes = door.querySelector(".boxes");
      const boxesClone = boxes.cloneNode(false);
      const pool = [];

      if (firstInit) {
        pool.push("❓");
      } else {
        const lastEmoji = boxes.querySelector(".box").textContent;
        pool.push(lastEmoji);

        const arr = [];
        for (let n = 0; n < (groups > 0 ? groups : 1); n++) {
          arr.push(...items);
        }
        pool.push(...shuffle(arr));

        boxesClone.addEventListener(
          "transitionstart",
          function () {
            door.dataset.spinned = "1";
            this.querySelectorAll(".box").forEach((box) => {
              box.style.filter = "blur(1px)";
            });
          },
          { once: true }
        );

        boxesClone.addEventListener(
          "transitionend",
          function () {
            this.querySelectorAll(".box").forEach((box, index) => {
              box.style.filter = "blur(0)";
              if (index > 0) this.removeChild(box);
            });
          },
          { once: true }
        );
      }

      for (let i = pool.length - 1; i >= 0; i--) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.style.width = door.clientWidth + "px";
        box.style.height = door.clientHeight + "px";
        box.textContent = pool[i];
        boxesClone.appendChild(box);
      }

      boxesClone.style.transitionDuration = `${duration}s`;
      boxesClone.style.transform = `translateY(-${
        door.clientHeight * (pool.length - 1)
      }px)`;
      
      door.replaceChild(boxesClone, boxes);
    }
  }

  function checkResult() {
    const results = Array.from(doors).map(door => door.querySelector(".box").textContent);
    const infoText = document.querySelector(".info");

    if (results[0] === results[1] && results[1] === results[2]) {
      // Αναπαραγωγή ήχου νίκης
      winSound.play();
      
      infoText.textContent = `WINNER! 🎉 ${results[0]} ${results[1]} ${results[2]}`;
      infoText.style.color = "#6bff8b"; // Πράσινο χρώμα από το κουμπί σου
      infoText.style.fontSize = "1.5rem";
      infoText.style.fontWeight = "bold";
    } else {
      infoText.textContent = "Try again!";
    }
  }

  function shuffle([...arr]) {
    let m = arr.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [arr[m], arr[i]] = [arr[i], arr[m]];
    }
    return arr;
  }

  init();
})();