let currentPage = 1;
const itemsPerPage = 10;
let currentData = [];
let currentSource = 'topuniversities'; // Initialize currentSource

const subjectMap = {
    "qs-general": '3897789',
    "qs-engineering-technologies": '3948167',
    "qs-arts-humanities": '3948166',
    "qs-life-sciences-medicine": '3948168',
    "qs-natural-sciences": '3948169',
    "qs-social-sciences-management": '3948170',
    "qs-linguistics": '3948214',
    "qs-music": '3948226',
    "qs-theology-divinity-religious": '3948201',
    "qs-archaeology": '3948175',
    "qs-architecture-built-environment": '3948176',
    "qs-art-design": '3948177',
    "qs-classics-ancient-history": '3948181',
    "qs-english-language-literature": '3948194',
    "qs-history": '3948202',
    "qs-history-of-art": '3948220',
    "qs-modern-languages": '3948219',
    "qs-performing-arts": '3948215',
    "qs-philosophy": '3948211',
    "the-general": 'general' // Example for Times Higher Education
};

async function fetchWithProxy(url) {
    const proxies = [
        'https://api.allorigins.win/get?url=',
        'https://api.codetabs.com/v1/proxy/?quest=',
        'https://cors-anywhere.herokuapp.com/',
        'https://cors-proxy.htmldriven.com/?url='
    ];

    for (const proxy of proxies) {
        try {
            const response = await fetch(proxy + encodeURIComponent(url));
            if (response.ok) {
                const data = await response.json();
                return data.contents ? JSON.parse(data.contents) : data;
            }
        } catch (error) {
            console.error(`Proxy ${proxy} failed:`, error);
        }
    }

    throw new Error('All proxies failed.');
}

async function getAllEntriesTopUniversities(subject) {
    const subjectId = subjectMap[subject];
    let allEntries = [];
    let page = 0;
    const itemsPerPage = 10;
    let morePages = true;

    while (morePages) {
        const url = `https://www.topuniversities.com/rankings/endpoint?nid=${subjectId}&page=${page}&items_per_page=${itemsPerPage}&tab=&region=&countries=&cities=&search=&star=&sort_by=&order_by=&program_type=&loggedincache=`;

        try {
            const data = await fetchWithProxy(url);

            if (!data.score_nodes || data.score_nodes.length === 0) {
                morePages = false;
            } else {
                allEntries = allEntries.concat(data.score_nodes.map(entry => ({
                    rank: entry.rank_display,
                    name: entry.title,
                    overall_score: entry.overall_score
                })));
                page++;
                if (page > data.total_pages) {
                    morePages = false;
                }
            }
        } catch (error) {
            console.error('Error fetching Top Universities data:', error);
            morePages = false;
        }
    }

    return allEntries;
}

async function getEntriesTimesHigherEducation() {
    const url = 'https://www.timeshighereducation.com/sites/default/files/the_data_rankings/world_university_rankings_2024_0__91239a4509dc50911f1949984e3fb8c5.json';

    try {
        const data = await fetchWithProxy(url);

        if (!data.data) throw new Error("Missing 'data' in JSON response");

        return data.data.map(entry => ({
            rank: entry.rank,
            name: entry.name,
            overall_score: entry.scores_overall
        }));
    } catch (error) {
        console.error('Error fetching Times Higher Education data:', error);
        throw error;
    }
}

function displayEntries(element) {
    const subject = element.getAttribute('data-subject');
    const subjectName = element.textContent; // Get the text content for the subject name

    // Create or update the alert
    const alertDiv = document.getElementById('chosenFilter');
    const alertContent = document.getElementById('alertContent');

    if (alertDiv) {
        // Update the existing alert
        if (alertContent) {
            alertContent.textContent = `Ranking: ${currentSource === 'topuniversities' ? 'QS' : 'THE'}\nSubject Filter: ${subjectName}`;
        } else {
            console.error('Error: alertContent element not found');
        }
    } else {

        const alertPlace = document.getElementById('alertPlace')
        // Create the alert if it doesn't exist
        const newAlertDiv = document.createElement('div');
        newAlertDiv.id = 'chosenFilter';
        newAlertDiv.className = 'alert alert-dark alert-dismissible fade show text-center';
        newAlertDiv.role = 'alert';

        const newAlertContent = document.createElement('span');
        newAlertContent.id = 'alertContent';
        newAlertContent.textContent = `Ranking: ${currentSource === 'topuniversities' ? 'QS' : 'THE'}\nSubject Filter: ${subjectName}`;
        newAlertDiv.appendChild(newAlertContent);

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'close';
        closeButton.setAttribute('data-dismiss', 'alert');
        closeButton.setAttribute('aria-label', 'Close');

        const closeButtonIcon = document.createElement('span');
        closeButtonIcon.setAttribute('aria-hidden', 'true');
        closeButtonIcon.innerHTML = '&times;'; // This is the close icon

        closeButton.appendChild(closeButtonIcon);
        newAlertDiv.appendChild(closeButton);

        alertPlace.appendChild(newAlertDiv); // Or append it to a specific container
    }

    // Clear previous entries
    const tbody = document.querySelector('#unisTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
    } else {
        console.error('Error: tbody element not found');
        return;
    }

    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    if (currentSource === 'topuniversities') {
        getAllEntriesTopUniversities(subject).then(entries => {
            currentData = entries;
            displayPage(1);
            // Hide loading spinner after data is loaded
            document.getElementById('loadingSpinner').style.display = 'none';
            // Hide the modal
            $('#modal-topuniversities').modal('hide');
        }).catch(error => {
            console.error('Error fetching data:', error);
            // Hide loading spinner in case of an error
            document.getElementById('loadingSpinner').style.display = 'none';
            // Hide the modal in case of an error
            $('#modal-topuniversities').modal('hide');
        });
    } else if (currentSource === 'timeshighereducation') {
        getEntriesTimesHigherEducation().then(entries => {
            currentData = entries;
            displayPage(1);
            // Hide loading spinner after data is loaded
            document.getElementById('loadingSpinner').style.display = 'none';
            // Hide the modal
            $('#modal-timeshighereducation').modal('hide');
        }).catch(error => {
            console.error('Error fetching data:', error);
            // Hide loading spinner in case of an error
            document.getElementById('loadingSpinner').style.display = 'none';
            // Hide the modal in case of an error
            $('#modal-timeshighereducation').modal('hide');
        });
    }
}

function displayPage(page) {
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = currentData.slice(start, end);

    // Get tbody element
    const tbody = document.querySelector('#unisTable tbody');
    
    if (!tbody) {
        console.error('Error: tbody element not found');
        return;
    }

    tbody.innerHTML = ''; // Clear previous rows
    paginatedData.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.rank}</td>
            <td>${entry.name}</td>
            <td>${entry.overall_score}</td>
        `;
        tbody.appendChild(row);
    });

    setupPagination();
}

function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(currentData.length / itemsPerPage);

    if (totalPages <= 1) {
        return; // No pagination needed if there's only one page
    }

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Page navigation example');

    const ul = document.createElement('ul');
    ul.className = 'pagination';

    // Previous button
    const prevButton = document.createElement('li');
    prevButton.className = 'page-item';
    if (currentPage === 1) {
        prevButton.classList.add('disabled');
    }
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.textContent = 'Previous';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            displayPage(currentPage - 1);
        }
    });
    prevButton.appendChild(prevLink);
    ul.appendChild(prevButton);

    // Helper function to create page buttons
    function createPageButton(pageNum, isActive = false) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        if (isActive) {
            pageItem.classList.add('active');
        }
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = pageNum;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            displayPage(pageNum);
        });
        pageItem.appendChild(pageLink);
        return pageItem;
    }

    // Create page buttons with ellipsis
    const maxVisiblePages = 5; // Maximum number of page buttons to show before ellipsis
    const ellipsis = document.createElement('li');
    ellipsis.className = 'page-item disabled';
    ellipsis.innerHTML = '<span class="page-link">...</span>';

    if (totalPages <= maxVisiblePages) {
        // If total pages are fewer or equal to the maximum visible pages, show all
        for (let i = 1; i <= totalPages; i++) {
            ul.appendChild(createPageButton(i, i === currentPage));
        }
    } else {
        // Show first pages, ellipsis, and last pages
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            ul.appendChild(createPageButton(i, i === currentPage));
        }

        if (endPage < totalPages) {
            ul.appendChild(ellipsis);
            ul.appendChild(createPageButton(totalPages));
        }
    }

    // Next button
    const nextButton = document.createElement('li');
    nextButton.className = 'page-item';
    if (currentPage === totalPages) {
        nextButton.classList.add('disabled');
    }
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.textContent = 'Next';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            displayPage(currentPage + 1);
        }
    });
    nextButton.appendChild(nextLink);
    ul.appendChild(nextButton);

    nav.appendChild(ul);
    paginationContainer.appendChild(nav);
}


document.addEventListener('DOMContentLoaded', () => {
    displayEntries(document.querySelector('[data-subject="qs-general"]'));
});

function switchSource(source) {
    currentSource = source;
    
    // Set the default subject filter based on the source
    const defaultSubject = source === 'topuniversities' ? 'qs-general' : 'the-general';
    
    // Show the corresponding modal
    if (source === 'topuniversities') {
        $('#modal-topuniversities').modal('show');
    } else if (source === 'timeshighereducation') {
        $('#modal-timeshighereducation').modal('show');
    }
    
    // Clear previous filter information
    document.getElementById('chosenFilter').textContent = `Ranking: ${source === 'topuniversities' ? 'QS' : 'THE'}\nSubject Filter: None`;
    
    // Ensure that currentData is not set until a subject is selected
    currentData = [];
}
