let jobTypesData = {};
let selectedSkills = new Set();
let currentJobType = '';
let allSkills = [];
let allJobResults = [];
let filteredJobResults = [];

const jobTypeSelect = document.getElementById('jobTypeSelect');
const skillComboInput = document.getElementById('skillComboInput');
const clearComboInput = document.getElementById('clearComboInput');
const dropdownToggle = document.getElementById('dropdownToggle');
const skillsDropdownContainer = document.getElementById('skillsDropdownContainer');
const skillsDropdownList = document.getElementById('skillsDropdownList');
const selectedSkillsContainer = document.getElementById('selectedSkillsContainer');
const clearAllBtn = document.getElementById('clearAllBtn');
const submitBtn = document.getElementById('submitBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultsSection = document.getElementById('resultsSection');
const clearResultsBtn = document.getElementById('clearResultsBtn');
const countryFilter = document.getElementById('countryFilter');
const jobTypeFilter = document.getElementById('jobTypeFilter');
const remoteFilter = document.getElementById('remoteFilter');
const resultsCount = document.getElementById('resultsCount');
const jobResults = document.getElementById('jobResults');

async function init() {
    try {
        await loadJobTypesData();
        setupEventListeners();
        populateJobTypes();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load job types data. Please refresh the page.');
    }
}

async function loadJobTypesData() {
    const response = await fetch('back-end/data/job_types_skills.json');
    if (!response.ok) {
        throw new Error('Failed to load job types data');
    }
    jobTypesData = await response.json();
}

function setupEventListeners() {
    jobTypeSelect.addEventListener('change', handleJobTypeChange);
    skillComboInput.addEventListener('click', handleComboInputClick);
    skillComboInput.addEventListener('input', handleComboInputSearch);
    skillComboInput.addEventListener('focus', handleComboInputFocus);
    clearComboInput.addEventListener('click', clearComboInputHandler);
    dropdownToggle.addEventListener('click', toggleDropdown);
    clearAllBtn.addEventListener('click', clearAllSkills);
    submitBtn.addEventListener('click', submitSkills);
    clearResultsBtn.addEventListener('click', clearResults);
    countryFilter.addEventListener('change', applyFilters);
    jobTypeFilter.addEventListener('change', applyFilters);
    remoteFilter.addEventListener('change', applyFilters);
    
    document.addEventListener('click', handleOutsideClick);
}

function populateJobTypes() {
    jobTypeSelect.innerHTML = '<option value="">Choose a job type...</option>';
    
    for (const [key, skills] of Object.entries(jobTypesData)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = formatJobTypeName(key);
        jobTypeSelect.appendChild(option);
    }
}

function formatJobTypeName(jobType) {
    return jobType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function handleJobTypeChange() {
    const selectedJobType = jobTypeSelect.value;
    
    if (selectedJobType) {
        currentJobType = selectedJobType;
        allSkills = jobTypesData[selectedJobType];
        enableSkillsSelection();
    } else {
        currentJobType = '';
        allSkills = [];
        disableSkillsSelection();
    }
}

function enableSkillsSelection() {
    skillComboInput.disabled = false;
    skillComboInput.readOnly = false;
    clearComboInput.disabled = false;
    dropdownToggle.disabled = false;
    skillComboInput.placeholder = "Click to browse or type to search skills...";
}

function disableSkillsSelection() {
    skillComboInput.disabled = true;
    skillComboInput.readOnly = true;
    clearComboInput.disabled = true;
    dropdownToggle.disabled = true;
    skillComboInput.value = '';
    skillComboInput.placeholder = "Select a job type first...";
    hideDropdown();
}

function handleComboInputClick() {
    if (!skillComboInput.disabled && allSkills.length > 0) {
        showAllSkills();
    }
}

function handleComboInputFocus() {
    if (!skillComboInput.disabled && allSkills.length > 0) {
        showAllSkills();
    }
}

function handleComboInputSearch() {
    const searchTerm = skillComboInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        showAllSkills();
        return;
    }

    const filteredSkills = allSkills.filter(skill => 
        skill.toLowerCase().includes(searchTerm) && !selectedSkills.has(skill)
    );

    displaySkillsInDropdown(filteredSkills);
}

function showAllSkills() {
    const availableSkills = allSkills.filter(skill => !selectedSkills.has(skill));
    displaySkillsInDropdown(availableSkills);
}

function displaySkillsInDropdown(skills) {
    skillsDropdownList.innerHTML = '';
    
    if (skills.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No matching skills found';
        li.className = 'no-results';
        skillsDropdownList.appendChild(li);
    } else {
        skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            li.className = 'skill-item';
            li.addEventListener('click', () => {
                addSkill(skill);
                hideDropdown();
                skillComboInput.value = '';
            });
            skillsDropdownList.appendChild(li);
        });
    }
    
    skillsDropdownContainer.style.display = 'block';
}

function hideDropdown() {
    skillsDropdownContainer.style.display = 'none';
}

function toggleDropdown() {
    if (skillsDropdownContainer.style.display === 'block') {
        hideDropdown();
    } else {
        showAllSkills();
    }
}

function clearComboInputHandler() {
    skillComboInput.value = '';
    hideDropdown();
}

function handleOutsideClick(event) {
    if (!skillComboInput.contains(event.target) && 
        !skillsDropdownContainer.contains(event.target) &&
        !dropdownToggle.contains(event.target)) {
        hideDropdown();
    }
}

function addSkill(skill) {
    if (!selectedSkills.has(skill)) {
        selectedSkills.add(skill);
        updateSelectedSkillsDisplay();
        
        clearAllBtn.disabled = false;
        submitBtn.disabled = false;
    }
}

function updateSelectedSkillsDisplay() {
    selectedSkillsContainer.innerHTML = '';
    
    if (selectedSkills.size === 0) {
        const message = document.createElement('p');
        message.textContent = 'No skills selected yet';
        message.className = 'no-skills-message';
        selectedSkillsContainer.appendChild(message);
        clearAllBtn.disabled = true;
        submitBtn.disabled = true;
        return;
    }

    selectedSkills.forEach(skill => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
            <span>${skill}</span>
            <button class="remove-skill-btn" onclick="removeSkill('${skill}')">×</button>
        `;
        selectedSkillsContainer.appendChild(skillTag);
    });
}

function removeSkill(skill) {
    selectedSkills.delete(skill);
    updateSelectedSkillsDisplay();
}

function clearAllSkills() {
    selectedSkills.clear();
    updateSelectedSkillsDisplay();
}

async function submitSkills() {
    if (selectedSkills.size === 0) {
        showError('Please select at least one skill');
        return;
    }

    const data = {
        job_type: currentJobType,
        skills: Array.from(selectedSkills)
    };

    try {
        loadingIndicator.style.display = 'block';
        submitBtn.disabled = true;

        const response = await fetch('http://localhost:8000/recommend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to get recommendations');
        }

        const result = await response.json();
        
        if (result.status === 'success') {
            allJobResults = result.recommendations;
            filteredJobResults = [...allJobResults];
            showResults();
            populateFilterOptions();
            applyFilters();
        } else {
            showError(result.message || 'Failed to get recommendations');
        }
        
    } catch (error) {
        console.error('Error submitting skills:', error);
        showError('Failed to get recommendations. Please try again.');
    } finally {
        loadingIndicator.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function showError(message) {
    alert('Error: ' + message);
}

function showSuccess(message) {
    alert('Success: ' + message);
}

function showResults() {
    // Hide selection sections
    document.querySelector('main').style.display = 'none';
    
    // Show results section
    resultsSection.style.display = 'block';
}

function clearResults() {
    allJobResults = [];
    filteredJobResults = [];

    resultsSection.style.display = 'none';

    document.querySelector('main').style.display = 'block';

    jobResults.innerHTML = '';

    countryFilter.innerHTML = '<option value="">All Countries</option>';
    jobTypeFilter.innerHTML = '<option value="">All Job Types</option>';
    remoteFilter.value = '';
}

function populateFilterOptions() {
    const countries = [...new Set(allJobResults.map(job => job.job_country))].sort();
    countryFilter.innerHTML = '<option value="">All Countries</option>';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });

    const jobTypes = [...new Set(allJobResults.map(job => job.job_title_short))].sort();
    jobTypeFilter.innerHTML = '<option value="">All Job Types</option>';
    jobTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        jobTypeFilter.appendChild(option);
    });
}

function applyFilters() {
    const selectedCountry = countryFilter.value;
    const selectedJobType = jobTypeFilter.value;
    const selectedRemote = remoteFilter.value;
    
    filteredJobResults = allJobResults.filter(job => {
        const matchesCountry = !selectedCountry || job.job_country === selectedCountry;
        const matchesJobType = !selectedJobType || job.job_title_short === selectedJobType;
        const matchesRemote = !selectedRemote || job.job_work_from_home === selectedRemote;
        
        return matchesCountry && matchesJobType && matchesRemote;
    });
    
    displayJobResults();
}

function displayJobResults() {
    resultsCount.textContent = `Showing ${filteredJobResults.length} jobs`;
    
    if (filteredJobResults.length === 0) {
        jobResults.innerHTML = '<div class="no-results">No jobs found matching your criteria.</div>';
        return;
    }
    
    jobResults.innerHTML = '';
    
    filteredJobResults.forEach((job, index) => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        
        const skillsText = Array.isArray(job.job_skills) ? job.job_skills.join(', ') : job.job_skills;
        
        jobCard.innerHTML = `
            <div class="job-header">
                <h3 class="job-title">${job.job_title}</h3>
                <span class="job-type-badge">${job.job_title_short}</span>
            </div>
            <div class="job-details">
                <div class="job-company">
                    <strong>Company:</strong> ${job.company_name}
                </div>
                <div class="job-location">
                    <strong>Country:</strong> ${job.job_country}
                </div>
                <div class="job-remote">
                    <strong>Remote Work:</strong> ${job.job_work_from_home}
                </div>
                <div class="job-posted">
                    <strong>Posted:</strong> ${job.job_posted_date}
                </div>
                <div class="job-health">
                    <strong>Health Insurance:</strong> ${job.job_health_insurance}
                </div>
                <div class="job-skills">
                    <strong>Required Skills:</strong> ${skillsText}
                </div>
            </div>
        `;
        
        jobResults.appendChild(jobCard);
    });
}

document.addEventListener('DOMContentLoaded', init);
