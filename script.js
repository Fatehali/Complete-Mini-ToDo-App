const arr = []; // null array
let lastItemIndex = -1;
let x = 0;
let allDone = null;
let intervals;
let checked = 0;

// accomplishAlert is a simple function which applies sweet alert when all tasks are done
const accomplishAlert = () => {
    intervals = setInterval(() => {
        let collection = document.getElementsByClassName('todo-text');
        let length = collection.length;
        if (length > 0) {
            for (let i = 0; i < length; i++) {
                if (collection[i].style.textDecoration !== "line-through") {
                    allDone = false;
                    break;
                } else {
                    allDone = true;
                }
            }
        }
        if (allDone) {
            document.getElementById("progressBar").value = document.getElementById("progressBar").max; 
            swal("Congratulations!", "You have accomplished all your goals for today!", "success");
            allDone = null;
            clearInterval(intervals);
            intervals = null;
        }
        console.log(collection.length, intervals);
    }, 1000);
    
    // setTimeout(() => {
        //     clearInterval(intervals);
        // }, 15000);
};

const addToCSS = null;

// toTick looks for the checkmark and styles accordingly  
const toTick = (element, id_no) => {
    x++;
    let content = element.children[2];       // document.getElementsByClassName('todo-text')[0];
    let myCheck = element.children[1];       // document.getElementsByClassName('tickmark')[0];
    let tickbox = element.children[0];
    let element_li = element.parentElement;
    let editButton = element_li.children[1];
    let progressEle = document.getElementById("progressBar");
    
    if (tickbox.checked) { 
        content.style.textDecoration = "line-through";
        myCheck.style.backgroundColor = "#2196F3";
        element_li.style.opacity = "65%";
        element_li.children[2].style.border = "3px dotted red";  // here we select remove button
        editButton.disabled = true;
        checked++;    
    } else {
        content.style.textDecoration = "none";
        myCheck.style.backgroundColor = "#eee";
        element_li.children[2].style.border = "none";
        element_li.style.opacity = "100";
        editButton.disabled = false;
        checked--;
    }

    progressEle.value = checked;  // updating the progress bar
    console.log(tickbox.checked);
    console.log(progressEle, "checked-val:", checked, "progressMax:", progressEle.max,
                "progressVal:", progressEle.value);
    console.log(content, tickbox, element_li, x);
}

// unfocus takes an activeElement and blurs it (unfocuses it)
const unfocus = (activeEle) => {
    activeEle.blur();
    activeEle.contentEditable = false;
    console.log(activeEle);
};

// edit edits the todo list data and updates the information in the array as well
const edit = (doc) => {
    let element_span = doc.children[0].children[2];

    // if (element_span.style.textDecoration === 'line-through') return undefined;

    element_span.setAttribute("contenteditable", "true");
    element_span.focus();
    window.getSelection().selectAllChildren(element_span);

    element_span.setAttribute("onkeypress", "enter(unfocus, this)");
    //element_span.addEventListener("change", () => document.getElementsByClassName('text')[0].setAttribute('contenteditable', 'false'));
    // setAttribute("onchange", "() => { document.getElementsByClassName('text')[0].setAttribute('contenteditable', 'false'); }");
    console.log(element_span.innerHTML);
};

// remove simply removes the parent element of the passed element
const remove = (element_li) => {
    let progressEle = document.getElementById("progressBar");
    let tickbox = element_li.children[0].children[0];

    console.log("checked: ", checked, "progressMax:", progressEle.max, 
                "progressValue:", progressEle.value);
    console.log(tickbox, lastItemIndex);
    
    arr.splice(element_li.id, 1, null); // begin from the specified id and delete only 1 element
    element_li.remove();
    
    // updating the progress bar as soon as the items are removed
    if (checked > 0 && tickbox.checked) {
        --checked;
        progressEle.value = checked;
    }
    progressEle.max -= 1;
    
    console.table(arr);
    console.log("checked: ", checked, "progressMax:", progressEle.max, 
                "progressValue:", progressEle.value);
};

// addEntry adds a todo item in the todo list (both in the display section and array)
const addEntry = (optional) => {
    const progressEle = document.getElementById("progressBar");
    
    if (document.getElementById("inputBox").value == "") return undefined;
    
    if (arr.filter( (val) => { if (val !== null) return val }, null ).length === 0) {
        // re-initializing to initial value
        arr.splice(0, arr.length);    // same as doing arr = [] but to a constant identifier;
        lastItemIndex = -1;
    }
    
    let data = document.getElementById("inputBox").value; // data is a string
    let index = lastItemIndex + 1;
    let markup = ` <li id="${index}">`.concat(
        ` <label class="border">`,
            ` <input type="checkbox" class="border" onchange="toTick(this.parentNode, ${index})" name="cb${index}" id="cb${index}" />`,
            ` <span class="tickmark border"></span>`,
        ` <span class="todo-text border">${data}</span> </label>`,
        ` <button type="button" title="edit" onclick="edit(this.parentElement)">
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        </button>`, 
        ` <button type="button" title="remove" onclick="remove(this.parentElement)">  
            <i class="fa fa-times" aria-hidden="true"></i>
        </button>`, 
        `</li>`);
    arr.push(markup);
    lastItemIndex++;
    
    document.getElementById("listOfItems").innerHTML += arr[lastItemIndex];
    document.getElementById("inputBox").value = "";
    console.table(arr);   // Array logged
    
    if (intervals === null) accomplishAlert();
    
    console.log("initial Max:", progressEle.max);

    // setting the max value of progress Element
    progressEle.max = arr.filter( (val) => { if (val !== null) return val }, null ).length;
    console.log("after...", progressEle);
};

accomplishAlert();