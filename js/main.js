const modal = document.getElementById('modal');
const formFields = document.getElementById('form-fields');

let instanceGlobal = '';
let idGlobal = '';

function render(instance, data) {
    const renderList = document.getElementById('render-list');
    renderList.innerHTML = '';
    data.forEach(item => {
        let res = '';
        Object.values(item).forEach(i => res += `<span>${i}</span>`)
        res += `<button type="button" data-action="edit" data-instance="${instance}" data-id="${item['id']}">Edit</button>`;
        res += `<button type="button" data-action="delete" data-instance="${instance}" data-id="${item['id']}">Delete</button>`;
        const li = document.createElement('li');
        li.innerHTML = res;
        renderList.appendChild(li);
    });
}

function getData(instance, close) {
    fetch(`http://localhost:3000/${instance}`)
        .then(response => response.json())
        .then(data => {
            render(instance, data);
            if (close) {
                closeModal();
            }
        })
        .catch(error => console.error('Error getting data:', error));
}

function deleteItem(instance, id) {
    fetch(`http://localhost:3000/${instance}/${id}`, {
        method: 'DELETE'
    })
    .then(() => getData(instance))
    .catch(error => console.error('Error in deleting:', error));
}

function createItem(instance) {
    instanceGlobal = instance;
    idGlobal = '';
    switch (instance) {
        case 'tasks':
            formFields.innerHTML = `
                <div class="field">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name">
                </div>
                <div class="field">
                    <label for="content">Content</label>
                    <input type="text" id="content" name="content">
                </div>
            `;
            break;

        case 'posts':
            formFields.innerHTML = `
                <div class="field">
                    <label for="title">Title</label>
                    <input type="text" id="title" name="title">
                </div>
                <div class="field">
                    <label for="views">Views</label>
                    <input type="text" id="views" name="views">
                </div>
            `;
            break;

        default:
            formFields.innerHTML = `
                <div class="field">
                    <label for="text">Text</label>
                    <input type="text" id="text" name="text">
                </div>
            `;
    }

    modal.classList.add('show');
}

function editItem(instance, id) {
    instanceGlobal = instance;
    idGlobal = id;
    fetch(`http://localhost:3000/${instance}/${id}`)
        .then(response => response.json())
        .then(data => {
            switch (instance) {
                case 'tasks':
                    const { name, content } = data;
                    formFields.innerHTML = `
                        <div class="field">
                            <label for="name">Name</label>
                            <input type="text" id="name" name="name" value="${name}">
                        </div>
                        <div class="field">
                            <label for="content">Content</label>
                            <input type="text" id="content" name="content" value="${content}">
                        </div>
                    `;
                    break;
        
                case 'posts':
                    const { title, views } = data;
                    formFields.innerHTML = `
                        <div class="field">
                            <label for="title">Title</label>
                            <input type="text" id="title" name="title" value="${title}">
                        </div>
                        <div class="field">
                            <label for="views">Views</label>
                            <input type="text" id="views" name="views" value="${views}">
                        </div>
                    `;
                    break;
        
                default:
                    const { text } = data;
                    formFields.innerHTML = `
                        <div class="field">
                            <label for="text">Text</label>
                            <input type="text" id="text" name="text" value="${text}">
                        </div>
                    `;
            }
        
            modal.classList.add('show');
        })
        .catch(error => console.error(`Error getting data by id ${id}:`, error));
}

function closeModal() {
    instanceGlobal = '';
    idGlobal = '';
    modal.classList.remove('show');
}

function saveChanges() {
    const data = {};
    let path = '';
    let method = '';

    document.querySelectorAll('#modal input')
        .forEach(field => data[field.getAttribute('name')] = field.value);

    if (idGlobal) {
        path = `http://localhost:3000/${instanceGlobal}/${idGlobal}`;
        method = 'PUT';
        data.id = idGlobal;
    } else {
        path = `http://localhost:3000/${instanceGlobal}`;
        method = 'POST';
    }

    fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(() => getData(instanceGlobal, true))
    .catch(error => console.error('Error create/update item:', error));
}

document.querySelectorAll('*').forEach(btn =>
    btn.addEventListener('click', e => {
        e.stopPropagation();

        const { action, instance, id } = e.target.dataset;

        switch (action) {
            case 'get':
                getData(instance);
                break;

            case 'delete':
                deleteItem(instance, id);
                break;

            case 'create':
                createItem(instance);
                break;

            case 'edit':
                editItem(instance, id);
                break;

            case 'close':
                closeModal();
                break;
            
            case 'save':
                saveChanges();
                break;

            default: '';
        }
    }));

