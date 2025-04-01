import { getAllStories } from '../../data/api.js';
import { initMap, addMarker, clearMarkers } from '../../utils/map-utils.js';
import { showElementError, clearElementError, showErrorMessage } from '../../utils/ui-utils.js';

export default class HomePage {
  #map = null;
  #stories = [];
  #storiesListElement = null;
  #mapContainerElement = null;
  #mapFeedbackElement = null;
  #observer = null;
  #loadMoreButton = null;
  #loadMoreContainer = null;
  #skeletonContainer = null;

  #currentPage = 1;
  #storiesPerPage = 9;
  #isLoadingMore = false;
  #allStoriesLoaded = false;

  constructor() {
    this.title = 'Beranda - Dicoding Story App';
    console.log("HomePage constructor");
  }

  async render() {
    console.log("HomePage rendering...");
    return `
      <section class="container home-page" aria-labelledby="page-heading">
        <h1 id="page-heading" tabindex="0">Cerita Terbaru</h1>
        <div class="stories-container">
            <div id="stories-list" class="stories-list" aria-live="polite" aria-busy="true">
            </div>
            <div id="load-more-container" class="load-more-container" style="display: none;">
                <button id="load-more-button" class="button button--primary">Muat Lebih Banyak</button>
            </div>
            <aside class="map-container" id="map-container-element" aria-labelledby="map-heading">
                <h2 id="map-heading">Peta Lokasi Cerita</h2>
                <div id="story-map" role="application" aria-label="Peta lokasi cerita">
                 <div class="content-loading-indicator" role="status">
                     <p>Memuat peta...</p>
                 </div>
                </div>
                <p id="map-feedback" style="margin-top: 10px;"><small>Peta akan dimuat...</small></p>
            </aside>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log("HomePage afterRender started");
    this.#cacheDOMElements();
    if (!this.#storiesListElement || !this.#mapContainerElement || !this.#mapFeedbackElement || !this.#loadMoreContainer || !this.#loadMoreButton) {
        console.error("Required elements for HomePage not found in DOM after render.");
        return;
    }
    this.#renderSkeletonLoaders();
    this.#mapFeedbackElement.innerHTML = '<small>Memuat data peta...</small>';
    const mapDiv = document.getElementById('story-map');
    if (mapDiv) { this._setContentBusy(mapDiv, true, 'Memuat peta...'); }
    this._setupMapObserver('story-map');
    await this._fetchInitialStories();
    this._attachEventListeners();
    console.log("HomePage afterRender finished");
  }

  #cacheDOMElements() {
    this.#storiesListElement = document.getElementById('stories-list');
    this.#mapContainerElement = document.getElementById('map-container-element');
    this.#mapFeedbackElement = document.getElementById('map-feedback');
    this.#loadMoreContainer = document.getElementById('load-more-container');
    this.#loadMoreButton = document.getElementById('load-more-button');
  }

  #renderSkeletonLoaders() {
    if (!this.#storiesListElement) return;
    this.#storiesListElement.innerHTML = '';
    this.#storiesListElement.removeAttribute('aria-busy');

    this.#skeletonContainer = document.createElement('div');
    this.#skeletonContainer.className = 'skeleton-container';
    this.#storiesListElement.appendChild(this.#skeletonContainer);

    const skeletonCount = this.#storiesPerPage;
    for (let i = 0; i < skeletonCount; i++) {
      const skeletonItem = document.createElement('div');
      skeletonItem.className = 'skeleton-item';
      skeletonItem.innerHTML = `
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton skeleton-line skeleton-line--title"></div>
          <div class="skeleton skeleton-line skeleton-line--small"></div>
          <div class="skeleton skeleton-line skeleton-line--text"></div>
          <div class="skeleton skeleton-line skeleton-line--text"></div>
        </div>
      `;
      this.#skeletonContainer.appendChild(skeletonItem);
    }
    this.#storiesListElement.setAttribute('aria-busy', 'true');
  }

  #removeSkeletonLoaders() {
     if (this.#skeletonContainer && this.#storiesListElement) {
        try {
            this.#storiesListElement.removeChild(this.#skeletonContainer);
        } catch(e) {}
        this.#skeletonContainer = null;
        this.#storiesListElement.removeAttribute('aria-busy');
     }
  }

  _setupMapObserver(mapElementId) {
    if (this.#observer) {
        this.#observer.disconnect();
        this.#observer = null;
        console.log("[Observer] Previous observer disconnected.");
    }
    this._removeMapInstance();
    this.#observer = new IntersectionObserver(this.#handleIntersection, { rootMargin: '200px', threshold: 0.01 });
    if(this.#mapContainerElement) {
        this.#observer.observe(this.#mapContainerElement);
        console.log("[Observer] Observing map container.");
    } else {
       console.warn("[Observer] Map container element not found.");
    }
  }

  #handleIntersection = async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
          console.log("[Observer] Map container is visible, initializing map...");
          if(this.#observer) this.#observer.disconnect();
          const mapElementId = 'story-map';
           try {
               const mapDiv = document.getElementById(mapElementId);
               if (mapDiv) this._setContentBusy(mapDiv, false);
               this.#map = initMap(mapElementId);
               if(this.#map) {
                 if (this.#stories?.length > 0) { this._populateMapMarkers(); }
                 else { if(this.#mapFeedbackElement) this.#mapFeedbackElement.innerHTML = '<small>Peta siap.</small>'; }
               } else {
                 if(this.#mapFeedbackElement) showElementError(this.#mapFeedbackElement, 'Gagal memuat peta.');
               }
           } catch (mapError){
               console.error("[Observer] Error initializing map:", mapError);
               if(this.#mapFeedbackElement) showElementError(this.#mapFeedbackElement, 'Gagal memuat peta.');
           }
      }
  }

  async _fetchInitialStories() {
    try {
      console.log("[Home Page] Fetching initial stories...");
      const result = await getAllStories({ page: 1, size: this.#storiesPerPage, location: 0 });
      this.#stories = result.listStory || [];
      console.log(`[Home Page] Fetched ${this.#stories.length} initial stories.`);

      this.#removeSkeletonLoaders();

      if (this.#stories.length === 0) {
         this.#storiesListElement.innerHTML = '<p style="text-align: center; padding: 20px; color: #555;">Belum ada cerita untuk ditampilkan.</p>';
         this.#loadMoreContainer.style.display = 'none';
         this.#allStoriesLoaded = true;
      } else {
         this._renderStoryItems(this.#stories);
         if (this.#stories.length < this.#storiesPerPage) {
             this.#allStoriesLoaded = true;
             this.#loadMoreContainer.style.display = 'none';
         } else {
             this.#allStoriesLoaded = false;
             this.#loadMoreContainer.style.display = 'block';
         }
      }

      if (this.#map) { this._populateMapMarkers(); }
      else { console.log("[Home Page] Initial stories fetched, map not ready yet."); }

    } catch (error) {
      console.error('[Home Page] Error fetching initial stories:', error);
      this.#removeSkeletonLoaders();
       if(this.#storiesListElement) {
           this.#storiesListElement.innerHTML = '';
            const errorContainer = document.createElement('div');
            errorContainer.style.padding = '20px';
            errorContainer.id = 'story-list-error';
            showElementError(errorContainer, `Gagal memuat cerita: ${error.message}.`);
            this.#storiesListElement.appendChild(errorContainer);
            errorContainer.focus();
       }
       if(this.#mapFeedbackElement) { showElementError(this.#mapFeedbackElement, 'Gagal memuat data cerita.'); }
       if(this.#observer && this.#mapContainerElement) { this.#observer.unobserve(this.#mapContainerElement); }
       this.#loadMoreContainer.style.display = 'none';
    }
  }

  async _fetchMoreStories() {
      if (this.#isLoadingMore || this.#allStoriesLoaded) return;

      this.#isLoadingMore = true;
      this.#currentPage += 1;
      this.#loadMoreButton.disabled = true;
      this.#loadMoreButton.innerHTML = '<span class="spinner spinner--small"></span> Memuat...';
      console.log(`[Home Page] Fetching page ${this.#currentPage}...`);

      try {
          const result = await getAllStories({ page: this.#currentPage, size: this.#storiesPerPage, location: 0 });
          const newStories = result.listStory || [];
          console.log(`[Home Page] Fetched ${newStories.length} more stories.`);

          if (newStories.length > 0) {
              this.#stories = [...this.#stories, ...newStories];
              this._renderStoryItems(newStories, true);
              if (this.#map) { this._populateMapMarkers(); }
          }

          if (newStories.length < this.#storiesPerPage) {
              this.#allStoriesLoaded = true;
              this.#loadMoreContainer.style.display = 'none';
              console.log("[Home Page] All stories loaded.");
          }

      } catch (error) {
          console.error(`[Home Page] Error fetching page ${this.#currentPage}:`, error);
          showErrorMessage(`Gagal memuat lebih banyak cerita: ${error.message}`);
          this.#currentPage -= 1;
      } finally {
          this.#isLoadingMore = false;
          this.#loadMoreButton.disabled = false;
          this.#loadMoreButton.innerHTML = 'Muat Lebih Banyak';
          if(this.#allStoriesLoaded) {
              this.#loadMoreContainer.style.display = 'none';
          }
      }
  }

  _renderStoryItems(storiesToRender, append = false) {
    if (!this.#storiesListElement) return;
    if (!append) {
        this.#storiesListElement.innerHTML = '';
    }

    const fragment = document.createDocumentFragment();
    storiesToRender.forEach(story => {
      try {
        const storyItemElement = document.createElement('story-item');
        storyItemElement.story = story;
        fragment.appendChild(storyItemElement);
      }
      catch (elementError) {
        console.error("Error creating story-item:", elementError, story);
        const errorItem = document.createElement('div');
        errorItem.textContent = 'Gagal memuat cerita.';
        errorItem.className = 'error-message';
        errorItem.style.border = '1px dashed red';
        errorItem.style.padding = '10px';
        fragment.appendChild(errorItem);
      }
    });
    this.#storiesListElement.appendChild(fragment);
    this.#storiesListElement.removeAttribute('aria-busy');
  }

  _populateMapMarkers() {
    if (!this.#map || !this.#stories || !this.#mapFeedbackElement) return;
    console.log("[Home Page] Populating map markers based on all loaded stories...");
    clearMarkers();
    let markersAdded = 0;
    this.#stories.forEach(story => {
      const isValidCoordinate = (c) => typeof c === 'number' && !isNaN(c);
      if (isValidCoordinate(story.lat) && isValidCoordinate(story.lon)) {
         try {
           const popupContent = `
             <div style="max-width:180px; font-family: var(--font-family-sans);">
               <img src="${story.photoUrl || 'images/placeholder.png'}" alt="Mini preview" width="150" style="width:100%; height:auto; margin-bottom:8px; border-radius:3px; object-fit: cover;" onerror="this.onerror=null;this.src='images/placeholder.png';">
               <strong style="display:block; margin-bottom:3px; font-size: 0.95rem; color: var(--primary-color);">${story.name||'Anonim'}</strong>
               <small style="color:var(--medium-text); display: block; font-size: 0.8rem; max-height: 3.2em; overflow: hidden;" title="${story.description||''}">${(story.description||'').substring(0,50)}...</small>
             </div>`;
           addMarker([story.lat, story.lon], popupContent);
           markersAdded++;
         }
         catch(markerError){ console.warn("Error adding marker:", story.id, markerError); }
      }
    });
     console.log(`[Home Page] ${markersAdded} markers added/updated.`);
     clearElementError(this.#mapFeedbackElement);
     if(markersAdded > 0) { this.#mapFeedbackElement.innerHTML = `<small>${markersAdded} cerita dengan lokasi ditampilkan.</small>`; }
     else if(this.#stories.length > 0) { this.#mapFeedbackElement.innerHTML = '<small><em>Tidak ada cerita dengan lokasi valid saat ini.</em></small>'; }
     else { this.#mapFeedbackElement.innerHTML = '<small>Peta siap.</small>';}
  }

  _removeMapInstance() {
      if (this.#map?.remove) { try { console.log("[Home Page] Removing map instance."); clearMarkers(); this.#map.remove(); } catch (e) {} } this.#map = null;
  }

  _setContentBusy(element, isBusy, message = '') {
     if (!element) return;
     const indicatorClass = 'content-loading-indicator';
     let loadingEl = element.querySelector(`.${indicatorClass}`);
     if(isBusy) {
         element.setAttribute('aria-busy', 'true');
         if(!loadingEl) {
             loadingEl = document.createElement('div');
             loadingEl.className = indicatorClass;
             loadingEl.setAttribute('role', 'status');
             loadingEl.innerHTML = `<p>${message}</p>`;
             element.innerHTML = '';
             element.appendChild(loadingEl);
         }
         loadingEl.style.display = 'flex';
     } else {
         element.removeAttribute('aria-busy');
         if (loadingEl) { try { element.removeChild(loadingEl); } catch(e) {} }
     }
  }

   _attachEventListeners() {
       this.#loadMoreButton.removeEventListener('click', this.#handleLoadMoreClick);
       this.#loadMoreButton.addEventListener('click', this.#handleLoadMoreClick);

       window.removeEventListener('hashchange', this._cleanup);
       window.removeEventListener('beforeunload', this._cleanup);
       window.addEventListener('hashchange', this._cleanup, { once: true });
       window.addEventListener('beforeunload', this._cleanup);
       console.log("HomePage event listeners attached.");
   }

   #handleLoadMoreClick = () => {
       this._fetchMoreStories();
   }

  _cleanup = () => {
      if (!this.#storiesListElement && !this.#mapContainerElement && !this.#map && !this.#loadMoreButton) { return; }
      console.log("[Home Page] Cleaning up resources...");
      if (this.#observer) { this.#observer.disconnect(); this.#observer = null; console.log("Observer disconnected."); }
      this._removeMapInstance();

      if (this.#loadMoreButton) {
          this.#loadMoreButton.removeEventListener('click', this.#handleLoadMoreClick);
      }

      window.removeEventListener('beforeunload', this._cleanup);
      window.removeEventListener('hashchange', this._cleanup);

      this.#storiesListElement = null; this.#mapContainerElement = null; this.#mapFeedbackElement = null;
      this.#loadMoreButton = null; this.#loadMoreContainer = null; this.#skeletonContainer = null;
      this.#stories = [];
      this.#currentPage = 1;
      this.#isLoadingMore = false;
      this.#allStoriesLoaded = false;

      console.log("[Home Page] Cleanup complete.");
  }
}