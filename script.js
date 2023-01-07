import { dataStrArr, dataObjArr, updateDatabase, deleteDoc, nullifyField } from "./firebase.js";

let arr = []; // null array
let lastItemIndex = -1;
let x = 0;
let allDone = null;
let intervals;
let checked = 0;


// setting value of checked and updating the progress bar accordingly
dataObjArr?.forEach(item => { 
    if (item?.taskDone) {
        let _checkboxID = 'cb' + item.elementID.slice(5);
        let checkbox = document.getElementById(_checkboxID);
        checkbox.checked = true; 
        checked++; 
}});
document.getElementById('progressBar').value = checked;


// setProgressMax(progressEle) sets the max value of the progress element progressEle 
//  whenever called
const setProgressMax = (progressEle) => {
    progressEle.max = arr.filter( (val) => { 
        if (val !== null) return val 
    }, null ).length;
};


// setting array and lastItemIndex
if (dataStrArr.length) {
    arr = [...dataStrArr];
    lastItemIndex += dataStrArr.length;
    const progressEle = document.getElementById("progressBar");
    setProgressMax(progressEle);
} 

console.log(arr, lastItemIndex);


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
export const toTick = (element, id_no) => {
    x++;
    let content = element.children[2];       // document.getElementsByClassName('todo-text')[0];
    let myCheck = element.children[1];       // document.getElementsByClassName('tickmark')[0];
    let tickbox = element.children[0];
    let element_li = element.parentElement;
    let editButton = element_li.children[1];
    let progressEle = document.getElementById("progressBar");
    let taskDone = null;
    console.log("tickbox checked? ", tickbox.checked);
    console.log("tickbox: ", tickbox);
    
    if (tickbox.checked && content.style.textDecoration !== "line-through") { 
        content.style.textDecoration = "line-through";
        myCheck.style.backgroundColor = "#2196F3";
        element_li.style.opacity = "65%";
        element_li.children[2].style.border = "3px dotted red";  // here we select remove button
        editButton.disabled = true;
        checked++;
        taskDone = true;    
    } else {
        content.style.textDecoration = "none";
        myCheck.style.backgroundColor = "#eee";
        element_li.children[2].style.border = "none";
        element_li.style.opacity = "100";
        editButton.disabled = false;
        checked--;
        taskDone = false;
    }

    let str = 'todo_' + String(id_no);
    updateDatabase(element_li.outerHTML, str, taskDone);  // updating the Firestore

    progressEle.value = checked;  // updating the progress bar
    //console.log(tickbox.checked);
    console.log(progressEle, "checked-val:", checked, "progressMax:", progressEle.max,
                "progressVal:", progressEle.value);
    console.log(content, tickbox, "this~", element_li, x);
}

// unfocus takes an activeElement and blurs it (unfocuses it)
const unfocus = (activeEle) => {
    activeEle.blur();
    activeEle.contentEditable = false;
    let _elementLi = activeEle.parentElement.parentElement;
    let _completed = (activeEle.parentElement.children[0].checked) ? true : false; 
    updateDatabase(_elementLi.outerHTML, "todo_" + _elementLi.id, _completed);
    console.log(typeof _elementLi.id);
};

// edit edits the todo list data and updates the information in the array as well
export const edit = (doc) => {
    let element_span = doc.children[0].children[2];

    // if (element_span.style.textDecoration === 'line-through') return undefined;

    element_span.setAttribute("contenteditable", "true");
    element_span.focus();
    window.getSelection().selectAllChildren(element_span);

    // element_span.setAttribute("onkeypress", "enter(unfocus, this)");
    element_span.addEventListener("keypress", () => void ( enter(unfocus, element_span) ));
    element_span.addEventListener("blur", () => void ( unfocus(element_span) ));

    //element_span.addEventListener("change", () => document.getElementsByClassName('text')[0].setAttribute('contenteditable', 'false'));
    // setAttribute("onchange", "() => { document.getElementsByClassName('text')[0].setAttribute('contenteditable', 'false'); }");
    console.log(element_span.innerHTML);
};

// remove simply removes the parent element of the passed element
export const remove = (element_li) => {
    let progressEle = document.getElementById("progressBar");
    let tickbox = element_li.children[0].children[0];

    console.log("checked: ", checked, "progressMax:", progressEle.max, 
                "progressValue:", progressEle.value);
    console.log(tickbox, lastItemIndex);
    
    arr.splice(element_li.id, 1, null); // begin from the specified id and delete only 1 element
    element_li.remove();
    console.log("element_li", element_li);
    // remove from the database as well
    let _index = "todo_" + element_li.id; 
    const deleteProcess = nullifyField(_index) // deleteDoc(_index);
    deleteProcess
    .then((msg) => console.log(msg))
    .catch((err) => console.log(err));
    console.log(_index);
    
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
export const addEntry = (optional) => {
    const progressEle = document.getElementById("progressBar");
    
    if (document.getElementById("inputBox").value == "") return undefined;
    
    if (arr.filter( (val) => { if (val !== null) return val }, null ).length === 0) {
        // deleting all docs from the database as well
        for (let i = 0; i < arr.length; i++) {
            const _index = "todo_" + String(i);
            const deleteProcess = deleteDoc(_index);
            deleteProcess
            .then((msg) => console.log(msg))
            .catch((err) => console.log(err));
            console.log(_index);
        }

        // re-initializing to initial value
        arr.splice(0, arr.length);    // same as doing arr = [] but to a constant identifier;
        lastItemIndex = -1;

    }
    
    let data = document.getElementById("inputBox").value; // data is a string
    let index = lastItemIndex + 1;
    let markup = ` <li id="${index}">`.concat(
        ` <label class="border">`,
            ` <input type="checkbox" onchange="toTick(this.parentNode, ${index})"
            class="border" name="cb${index}" id="cb${index}" />`,
            ` <span class="tickmark border"></span>`,
        ` <span class="todo-text border">${data}</span> </label>`,
        ` <button type="button" title="edit" id="editBtn${index}" onclick="edit(this.parentElement)" >
            <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        </button>`, 
        ` <button type="button" title="remove" id="remvBtn${index}" onclick="remove(this.parentElement)" >  
            <i class="fa fa-times" aria-hidden="true"></i>
        </button>`, 
        `</li>`);
    arr.push(markup);
    
    // updating the database as soon as the entry is added
    updateDatabase(markup);

    
    lastItemIndex++;
    document.getElementById("listOfItems").innerHTML += arr[lastItemIndex];

    /**
    // getting elements:
    let _checkbox = document.getElementById('cb' + index);
    let _editButton = document.getElementById('editBtn' + index);
    let _removeButton = document.getElementById('remvBtn' + index);

    console.log(index, _checkbox, _editButton, _removeButton);

    // setting events 
    _checkbox.addEventListener("change", () => void ( toTick(_checkbox.parentNode, index) ));    // this.parentNode
    _editButton.addEventListener("click", () => void ( edit(_editButton.parentElement) ));    // this.parentElement
    _removeButton.addEventListener("click", () => void ( remove(_removeButton.parentElement) )); // this.parentElement
    */

    document.getElementById("inputBox").value = "";
    console.table(arr);   // Array logged
    
    if (intervals === null) accomplishAlert();
    
    console.log("initial Max:", progressEle.max);

    // setting the max value of progress Element
    setProgressMax(progressEle);
    console.log("after...", progressEle);
};

accomplishAlert();


// // setting events:
// inputBox.addEventListener("keypress", () => enter(addEntry));
// submitBtn.addEventListener('click', () => addEntry());

/**
// setting event listeners if there is data in the database
if (dataObjArr[0]?.elementID) {
    dataObjArr.forEach(objItem => {
        let indx = objItem.elementID.slice(5);
        // getting elements:
        let checkbox = document.getElementById('cb' + indx);
        let editButton = document.getElementById('editBtn' + indx);
        let removeButton = document.getElementById('remvBtn' + indx);
        console.log(indx, checkbox, editButton, removeButton);
        // setting events 
        checkbox?.addEventListener("change", () => void ( toTick(this.parentNode, indx) ));    // this.parentNode
        editButton?.addEventListener("click", () => void ( edit(this.parentElement) ));    // this.parentElement
        removeButton?.addEventListener("click", () => void ( remove(this.parentElement) )); // this.parentElement

    }); 
}
*/

// Problems:
// 1.  The above eventListeners stop working when the addEntry() is called at the time of ToDo creation!
// 2.  After edit button clicked, contentEditable stays true unless entered is pressed. sol.: onunfocus
// 3.  The progress bar is also making some problems  => sol.: just update arr with the fetched data
// 4.  Somehow, the new element added to the database after deleting an older element begins from todo_1
//      and not from todo_0 when the database got empty.