const searchInput = document.querySelector('.search-input')

function renderCard(name, owner, stars) {
    const resultContainer = document.querySelector('.result-container')

    const container = document.createElement('li')
    container.classList.add('result-container__item')

    const textContainer = document.createElement('div')
    textContainer.classList.add('card__text-container')

    const delButton = document.createElement('button')
    delButton.classList.add('delete-button')

    delButton.addEventListener('click', () => {
        container.remove()
    })

    const nameDiv = document.createElement('div')
    nameDiv.classList.add('card__text')
    const ownerDiv = document.createElement('div')
    ownerDiv.classList.add('card__text')
    const starsDiv = document.createElement('div')
    starsDiv.classList.add('card__text')

    nameDiv.textContent = `Name: ${name}`
    ownerDiv.textContent = `Owner: ${owner}`
    starsDiv.textContent = `Stars: ${stars}`

    resultContainer.append(container)
    container.append(textContainer, delButton)
    textContainer.append(nameDiv, ownerDiv, starsDiv)
}

async function fetchGitHubRepositories(query) {
    if (!query) {
        const autocompleteResults = document.querySelector('.autocomplete')
        autocompleteResults.style.display = 'none';
        return [];
    }
    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`)
        const data = await response.json();
        return data.items
    } catch (e) {
        console.log(e)
        return []
    }
}

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

const renderAutocomplete = (repositories) => {
    const autocompleteResults = document.querySelector('.autocomplete')
    autocompleteResults.innerHTML = '';

    if (Array.isArray(repositories)) {
        repositories.forEach(repository => {
            const li = document.createElement('li');
            li.className = 'autocomplete-item';
            li.textContent = repository.name;
            li.addEventListener('click', () => {
                renderCard(repository.name, repository.owner.login, repository.stargazers_count);
                searchInput.value = '';
                autocompleteResults.style.display = 'none';
            });
            autocompleteResults.appendChild(li);
        });
    }
    else {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.textContent = repositories.name;
        div.addEventListener('click', () => {
            renderCard(repositories.name, repositories.owner.login, repositories.stargazers_count);
            searchInput.value = '';
            autocompleteResults.style.display = 'none';
        });
        autocompleteResults.appendChild(div);
    }

    autocompleteResults.style.display = repositories.length ? 'block' : 'none';
};

const handleInput = debounce(async (event) => {
    const query = event.target.value.trim();
    const repositories = await fetchGitHubRepositories(query);

    const noReposWarning = document.querySelector('.warning')

    if (repositories.length === 0 && query) {
        noReposWarning.classList.remove('hidden')
    }
    else {
        noReposWarning.classList.add('hidden')
    }

    renderAutocomplete(repositories);
}, 400);

searchInput.addEventListener('input', handleInput)
