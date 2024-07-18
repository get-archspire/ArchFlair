document.addEventListener('DOMContentLoaded', () => {
  loadJobs();

  const searchBar = document.getElementById('searchBar');
  searchBar.addEventListener('input', filterJobs);
});

let allJobs = [];
let fuse;

async function loadJobs() {
  try {
    const response = await fetch('jobs.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jobs = await response.json();
    allJobs = jobs;

    fuse = new Fuse(allJobs, {
      keys: ['title', 'company', 'type', 'location'],
      threshold: 0.3,
    });

    renderJobs(jobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
  }
}

function renderJobs(jobs) {
  const jobList = document.getElementById('jobList');
  jobList.innerHTML = '';

  jobs.forEach((job, index) => {
    const jobRow = document.createElement('tr');
    jobRow.innerHTML = `
      <td>${job.title}</td>
      <td>${job.company}</td>
      <td>${job.type}</td>
      <td>${job.location}<a href="${job.externalLink || `mailto:${job.email}`}" class="apply-link" target="_blank">Apply</a></td>
    `;
    jobRow.addEventListener('mouseover', () => toggleApplyButton(jobRow, true));
    jobRow.addEventListener('mouseout', () => toggleApplyButton(jobRow, false));
    jobRow.addEventListener('click', () => showJobDetailPopup(job, index));
    jobList.appendChild(jobRow);
  });
}

function toggleApplyButton(element, show) {
  const applyLink = element.querySelector('.apply-link');
  if (show) {
    applyLink.style.opacity = 1;
    applyLink.style.transform = 'translateY(-50%) scale(1)';
  } else {
    applyLink.style.opacity = 0;
    applyLink.style.transform = 'translateY(-50%) scale(0.8)';
  }
}

function showJobDetailPopup(job, index) {
  const jobDetailPopup = document.getElementById('jobDetailPopup');
  jobDetailPopup.style.display = 'flex';

  document.getElementById('jobTitle').textContent = `${job.title} at ${job.company}`;
  document.getElementById('jobType').textContent = job.type;
  document.getElementById('jobLocation').textContent = job.location;
  document.getElementById('jobDescription').textContent = job.description;
  document.getElementById('jobWebsite').textContent = job.website;
  document.getElementById('jobWebsite').href = job.website;
  document.getElementById('jobEmail').textContent = job.email;
  document.getElementById('jobEmail').href = `mailto:${job.email}`;
  document.getElementById('jobSalary').textContent = job.salary;

  // Update the apply button href and target
  const applyButton = document.getElementById('jobApply');
  applyButton.href = job.externalLink || `mailto:${job.email}`;
  applyButton.target = job.externalLink ? '_blank' : '';
}

function toggleJobDetailPopup() {
  const jobDetailPopup = document.getElementById('jobDetailPopup');
  jobDetailPopup.style.display = 'none';
}

function filterJobs(event) {
  const searchTerm = event.target.value.trim();

  if (searchTerm === '') {
    renderJobs(allJobs);
    return;
  }

  const results = fuse.search(searchTerm);
  const filteredJobs = results.map(result => result.item);
  renderJobs(filteredJobs);
}