let popup = document.getElementsByClassName("form_container");
let save = document.getElementsByClassName("save")
let edit = document.getElementsByClassName("edit")


edit[0].addEventListener("click", () => {
    popup[0].style.display = "flex";
});
edit[1].addEventListener("click", () => {
    popup[1].style.display = "flex";
});
edit[2].addEventListener("click", () => {
    popup[2].style.display = "flex";
});
edit[3].addEventListener("click", () => {
    popup[3].style.display = "flex";
});

window.onclick = function(e) {
    for(let i = 0; i < 4; i++) {
        if(e.target == popup[i]) {
            popup[0].style.display = "none";
            popup[1].style.display = "none";
            popup[2].style.display = "none";
            popup[3].style.display = "none";
        }
    }
}
