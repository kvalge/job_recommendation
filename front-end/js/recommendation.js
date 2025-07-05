let jobTypesData = {};
let selectedSkills = new Set();
let currentJobType = '';
let allSkills = [];

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

        const response = await fetch('/recommend', {
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
        showSuccess('Recommendations received successfully!');
        console.log('Recommendations:', result);
        
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

document.addEventListener('DOMContentLoaded', init);
