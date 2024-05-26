let popup = document.getElementsByClassName("form_container");
let edit = document.getElementsByClassName("edit");

for (let i = 0; i < edit.length; i++) {
    edit[i].addEventListener("click", () => {
        popup[i].style.display = "flex";
    });
}

window.onclick = function(e) {
    for(let i = 0; i < edit.length; i++) {
        if(e.target == popup[i]) {
            popup[i].style.display = "none";
        }
    }
}
