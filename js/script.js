// Use this URL to fetch NASA APOD JSON data.
const apodData = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Get references to DOM elements
const gallery = document.getElementById('gallery');
const getImageBtn = document.getElementById('getImageBtn');

// Helper Method: extract Youtube video ID from URL
function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

// 1. Create a gallery and display each card
function createGalleryCard(item) {
  // Create the card container
  const card = document.createElement('div');
  card.className = 'gallery-card';

  const ytId = getYouTubeId(item.url);

  let img;

  if (ytId) {
    // If it's a YouTube video, use the thumbnail
    img = document.createElement('img');
    const isValidThumb = item.thumbnail_url && item.thumbnail_url.startsWith('https://img.youtube.com/vi/');
    img.src = isValidThumb ? item.thumbnail_url : `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    img.alt = `${item.title || 'Video'} (video thumbnail)`;
    img.loading = 'lazy';

    // Clicking the thumbnail opens a modal with the video, title, date, and explanation
    img.addEventListener('click', () => {
      openModal({
        type: 'video',
        videoUrl: `https://www.youtube.com/embed/${ytId}`,
        title: item.title,
        date: item.date,
        explanation: item.explanation
      });
    });

    card.appendChild(img);
  } else {
    // Otherwise, use the image
    img = document.createElement('img');
    img.src = item.url || '';
    img.alt = item.title || 'Space Image';
    img.loading = 'lazy';

    // Clicking the image opens a modal with the full-size image, title, date, and explanation
    img.addEventListener('click', () => {
      openModal({
        type: 'image',
        imageUrl: item.hdurl || item.url,
        title: item.title,
        date: item.date,
        explanation: item.explanation
      });
    });

    card.appendChild(img);
  }

  // Create the card content
  const content = document.createElement('div');
  content.className = 'card-content';

  const titleEl = document.createElement('h3');
  titleEl.className = 'card-title';
  titleEl.innerText = item.title || "Untitled";

  const dateEl = document.createElement('p');
  dateEl.className = 'card-date';
  dateEl.innerText = item.date || "";

  card.appendChild(content);
  content.appendChild(titleEl);
  content.appendChild(dateEl);

  return card;
}

// Helper Method: Render gallery cards, sorted by date ascending
function renderCard(items) {
  gallery.innerHTML = '';

  if (!items || items.length === 0) {
    gallery.innerHTML = '<p class="error">No images available at this time.</p>';
    return;
  }

  // Sort items by date ascending (oldest first)
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  const toShow = sorted.slice(0, 10);

  // Create and append cards
  toShow.forEach(item => {
    const card = createGalleryCard(item);
    gallery.appendChild(card);
  });
}

// 2. Build a Modal view for each card
function openModal({ type, imageUrl, videoUrl, title, date, explanation }) {
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalBox = document.createElement('div');
  modalBox.className = 'modal-box';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerText = '×';

  closeBtn.addEventListener('click', () => document.body.removeChild(modal));
  modalBox.appendChild(closeBtn);

  const titleEl = document.createElement('h2');
  titleEl.innerText = title || '';
  modalBox.appendChild(titleEl);

  const dateEl = document.createElement('p');
  dateEl.innerText = date || '';
  dateEl.style.color = '#666';
  modalBox.appendChild(dateEl);

  // Image or video
  if (type === 'image' && imageUrl) {
    const imgEl = document.createElement('img');
    imgEl.src = imageUrl;
    imgEl.alt = title || '';
    modalBox.appendChild(imgEl);
  } else if (type === 'video' && videoUrl) {
    const videoFrame = document.createElement('iframe');
    videoFrame.src = videoUrl;
    videoFrame.width = '100%';
    videoFrame.height = '340';
    videoFrame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    videoFrame.allowFullscreen = true;
    videoFrame.style.border = 'none';
    modalBox.appendChild(videoFrame);
  }

  const explEl = document.createElement('p');
  explEl.className = 'modal-explanation';
  explEl.innerHTML = "<span>Description: </span>" + (explanation || '');
  modalBox.appendChild(explEl);

  modal.appendChild(modalBox);
  document.body.appendChild(modal);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Fetch data and render cards when button is clicked, if image does not load, text a fallback image
if (getImageBtn) {
  getImageBtn.addEventListener('click', () => {
    getImageBtn.disabled = true;
    getImageBtn.textContent = 'Loading...';
    gallery.innerHTML = '<p style="font-size:1.2rem;text-align:center;">🔄 Loading space photos…</p>';

    fetch(apodData)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        renderCard(data);
      })
      .catch(e => {
        console.error('There has been a problem with your fetch operation:', e);
        gallery.innerHTML = '<p class="error">Failed to load images. Please try again later.</p>';
      })
      .finally(() => {
        getImageBtn.disabled = false;
        getImageBtn.textContent = 'Get Space Images';
      });
  });
} else {
  fetch(apodData)
    .then(r => r.json())
    .then(data => renderCard(data))
    .catch(err => console.error(err));
}