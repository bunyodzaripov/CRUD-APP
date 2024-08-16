const tbody = document.getElementById("tbody");
const btn = document.getElementById("btn");
const modal = document.getElementById("modal");
const form = document.getElementById("form");
const mainUrl = "http://localhost:3000/users";
const pageSpan = document.getElementById("page-span");
const page = new Proxy(
   { value: 1, max: Number.MAX_SAFE_INTEGER },
   {
      set: (target, key, value) => {
         if (key === "value") {
            if (value < 1 || value > target.max) return;
            target[key] = value;
            pageSpan.innerText = value;
            getData();
         } else target[key] = value;
      },
      get: (target, key) => target[key],
   }
);

document.addEventListener("DOMContentLoaded", () => {
   getData();
});
window.addEventListener(
   "click",
   (e) => e.target.id === "modal" && toggleModal()
);
btn.addEventListener("click", () => toggleModal());
form.onsubmit = (event) => saveData(event);
function toggleModal() {
   modal.classList.toggle("d-block");
}

async function saveData(event) {
   event.preventDefault();
   event.stopPropagation();
   const formData = new FormData(event.target);
   const formProps = Object.fromEntries(formData);
   if (!formProps.id) formProps.id = undefined;
   try {
      const data = await fetch(
         `${mainUrl}${formProps.id ? "/" + formProps.id : ""}`,
         {
            method: formProps.id ? "PUT" : "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(formProps),
         }
      ).then((res) => res.json());
      displayData(data);
      toggleModal();
   } catch (error) {
      console.log(error);
   }
}
async function getData() {
   try {
      const data = await fetch(
         `${mainUrl}?_page=${page.value}&_per_page=2`
      ).then((res) => res.json());
      if (data?.pages) page.max = data.pages;
      displayData(data);
   } catch (error) {
      console.log(error);
   }
}
function displayData(data) {
   if (!Array.isArray(data) && Array.isArray(data?.data)) data = data.data;
   if (!data?.length) return;
   tbody.innerHTML = "";

   data.forEach((item, index) => {
      const tr = document.createElement("tr");
      const itemId = item.id;
      delete item.id;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-danger btn-sm";
      deleteBtn.innerText = "Delete";
      deleteBtn.type = "button";
      deleteBtn.onclick = (e) => {
         deleteData(itemId);
      };

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-primary btn-sm";
      editBtn.innerText = "Edit";
      editBtn.type = "button";
      editBtn.onclick = (e) => {
         editData({ ...item, id: itemId });
      };

      const children = [
         index + (page.value * 2 - 1),
         ...Object.values(item),
         deleteBtn,
         editBtn,
      ];
      for (let child of children) {
         if (!(child instanceof Object)) child = document.createTextNode(child);
         const td = document.createElement("td");
         td.appendChild(child);
         tr.appendChild(td);
      }

      tbody.appendChild(tr);
   });
}
async function deleteData(id) {
   try {
      await fetch(`${mainUrl}/${id}`, {
         method: "DELETE",
      });
   } catch (error) {
      console.log(error);
   }
}
async function editData(data) {
   form.reset();
   const children = Array.from(form.children);
   for (const child of children) {
      child.value = data[child.name];
   }
   toggleModal();
}
