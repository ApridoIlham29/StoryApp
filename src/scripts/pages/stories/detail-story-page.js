import { getStoryDetail } from '../../data/api.js';
import { parseActivePathname } from '../../routes/url-parser.js';
import { showFormattedDate, initMap, addMarker, getMapInstance, openImageModal } from '../../utils/index.js';
import { setContentBusy, showElementError } from '../../utils/ui-utils.js';

export default class DetailStoryPage {
    #map = null;
    #story = null;
    #pageContainer = null;
    #imageElement = null;
    #boundCleanup = this._cleanup.bind(this);

    constructor() {
        this.title = 'Memuat Cerita...';
        console.log("DetailStoryPage constructor");
    }

    async render() {
        console.log("DetailStoryPage rendering...");
        return `
            <section class="container detail-story-page" id="detail-story-container" aria-live="polite" aria-busy="true">
                <div class="content-loading-indicator" role="status">
                    <div class="spinner" aria-hidden="true"></div>
                    <p>Memuat detail cerita...</p>
                </div>
                </section>
        `;
    }

    async afterRender() {
        console.log("DetailStoryPage afterRender started");
        this.#pageContainer = document.getElementById('detail-story-container');
        if (!this.#pageContainer) {
            console.error("Fatal: Detail story container not found!");
            return;
        }

        const urlParams = parseActivePathname();
        const storyId = urlParams.id;

        if (!storyId) {
            console.error("Story ID not found in URL.");
            setContentBusy(this.#pageContainer, false);
            showElementError(this.#pageContainer, 'Tidak dapat memuat cerita: ID tidak ditemukan di URL.', null);
            this.#pageContainer.removeAttribute('aria-busy');
            document.title = 'Error - ID Tidak Ditemukan';
            return;
        }

        console.log(`Workspaceing detail for story ID: ${storyId}`);
        setContentBusy(this.#pageContainer, true, 'Memuat detail cerita...');

        try {
            const result = await getStoryDetail(storyId);
            if (result.error || !result.story) {
                throw new Error(result.message || 'Data cerita tidak ditemukan.');
            }
            this.#story = result.story;
            console.log("Story detail fetched:", this.#story);

            this.title = `Cerita oleh ${this.#story.name} - Dicoding Story App`;
            document.title = this.title;

            this._renderStoryDetails();
            setContentBusy(this.#pageContainer, false);
            this.#pageContainer.removeAttribute('aria-busy');

            this.#imageElement = this.#pageContainer.querySelector('.detail-story__image');
            this._attachImageClickListener();

            if (this.#story.lat && this.#story.lon) {
                this._initStoryMap();
            }

            this._attachCleanupListeners();

        } catch (error) {
            console.error('Error fetching story detail:', error);
            setContentBusy(this.#pageContainer, false);
            showElementError(this.#pageContainer, `Gagal memuat cerita: ${error.message}. Silakan coba lagi atau kembali ke beranda.`, null);
            this.#pageContainer.removeAttribute('aria-busy');
            document.title = 'Error Memuat Cerita';
            const errorElement = this.#pageContainer.querySelector('.error-message');
            if (errorElement) errorElement.focus();
        }
        console.log("DetailStoryPage afterRender finished");
    }

    _renderStoryDetails() {
        if (!this.#story || !this.#pageContainer) return;

        const { name, description, photoUrl, createdAt, lat, lon } = this.#story;
        const formattedDate = createdAt ? showFormattedDate(createdAt) : 'Tanggal tidak tersedia';
        const fallbackImage = 'images/placeholder.png';
        const imageUrl = photoUrl || fallbackImage;
        const hasLocation = typeof lat === 'number' && typeof lon === 'number';

        this.#pageContainer.innerHTML = `
            <h1 id="detail-page-heading" tabindex="-1">Cerita oleh ${name || 'Anonim'}</h1>
            <div class="detail-story__layout">
                <div class="detail-story__media" role="button" aria-label="Perbesar gambar cerita">
                    <img src="${imageUrl}" alt="Gambar cerita oleh ${name || 'Anonim'}" class="detail-story__image" onerror="this.onerror=null; this.src='${fallbackImage}'; this.alt='Gagal memuat gambar cerita oleh ${name || 'Anonim'}';">
                </div>
                <div class="detail-story__content">
                    <p class="detail-story__date" aria-label="Tanggal dibuat">
                        <i class="far fa-calendar-alt" aria-hidden="true"></i> Dibuat pada: ${formattedDate}
                    </p>
                    <p class="detail-story__description">${description || 'Tidak ada deskripsi.'}</p>
                    ${hasLocation ? `
                        <div class="detail-story__location">
                            <h2>Lokasi Cerita</h2>
                            <div id="detail-story-map" class="detail-story__map" role="application" aria-label="Peta lokasi cerita">
                                <div class="content-loading-indicator" role="status"><p>Memuat peta...</p></div>
                            </div>
                        </div>
                    ` : `
                        <p class="detail-story__no-location">
                            <i class="fas fa-map-marker-slash" aria-hidden="true"></i> Lokasi tidak tersedia untuk cerita ini.
                        </p>
                    `}
                </div>
            </div>
            <div class="detail-story__actions">
                <a href="#/" class="button button--secondary"><i class="fas fa-arrow-left" aria-hidden="true"></i> Kembali ke Beranda</a>
            </div>
        `;

        const heading = document.getElementById('detail-page-heading');
        if(heading) heading.focus();
    }

    #handleImageClick = (event) => {
        event.stopPropagation();
         if (this.#story && this.#story.photoUrl) {
            openImageModal(this.#story.photoUrl, `Cerita oleh ${this.#story.name || 'Anonim'}`);
         }
    }

     _attachImageClickListener() {
        this._removeImageClickListener();
        const mediaElement = this.#imageElement?.closest('.detail-story__media');
        if (mediaElement) {
            mediaElement.addEventListener('click', this.#handleImageClick);
            mediaElement.style.cursor = 'zoom-in';
        }
    }

    _removeImageClickListener() {
        const mediaElement = this.#imageElement?.closest('.detail-story__media');
        if (mediaElement) {
            mediaElement.removeEventListener('click', this.#handleImageClick);
            mediaElement.style.cursor = '';
        }
    }

    _initStoryMap() {
        if (!this.#story || !this.#story.lat || !this.#story.lon) return;

        const mapContainerId = 'detail-story-map';
        const mapElement = document.getElementById(mapContainerId);
        if (!mapElement) {
            console.warn("Detail story map container not found.");
            return;
        }
        this._setContentBusy(mapElement, false);

        try {
            const coords = [this.#story.lat, this.#story.lon];
            this.#map = initMap(mapContainerId, coords, 15);
            if (this.#map) {
                const popupContent = `Lokasi cerita oleh ${this.#story.name || 'Anonim'}`;
                addMarker(coords, popupContent, { draggable: false });
                this.#map.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        layer.openPopup();
                    }
                });
                console.log("Detail story map initialized and marker added.");
            } else {
                 showElementError(mapElement, 'Gagal memuat peta lokasi.');
            }
        } catch (mapError) {
            console.error("Error initializing detail story map:", mapError);
             showElementError(mapElement, 'Gagal memuat peta lokasi.');
        }
    }

     _attachCleanupListeners() {
        window.removeEventListener('hashchange', this.#boundCleanup);
        window.removeEventListener('beforeunload', this.#boundCleanup);

        window.addEventListener('hashchange', this.#boundCleanup, { once: true });
        window.addEventListener('beforeunload', this.#boundCleanup);
        console.log("DetailStoryPage cleanup listeners attached.");
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


     _cleanup() {
        console.log("[DetailStoryPage] Cleaning up resources...");
        this._removeImageClickListener();
        const map = getMapInstance();
        if (this.#map?.remove) {
             try { this.#map.remove(); console.log("Local map instance removed."); } catch (e) {}
             this.#map = null;
        } else if (map?.remove && document.getElementById('detail-story-map')?._leaflet_id === map._leaflet_id) {
             try { map.remove(); console.log("Global map instance removed."); } catch (e) {}
        }

        window.removeEventListener('beforeunload', this.#boundCleanup);

        this.#pageContainer = null;
        this.#story = null;
        this.#imageElement = null;
        console.log("[DetailStoryPage] Cleanup complete.");
     }
}