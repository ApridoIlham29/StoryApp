import { getStoryDetail } from '../../data/api.js';
import { parseActivePathname } from '../../routes/url-parser.js';
import { showFormattedDate, initMap, addMarker, getMapInstance, openImageModal } from '../../utils/index.js';
import { setContentBusy, showElementError, showSuccessMessage, showErrorMessage, showNotification } from '../../utils/ui-utils.js';
import { saveStoryForOffline, getOfflineStoryById, deleteOfflineStory } from '../../utils/idb-utils.js';

export default class DetailStoryPage {
    _map = null;
    _story = null;
    _pageContainer = null;
    _imageElement = null;
    _saveOfflineButton = null;
    _isSavedOffline = false;
    _boundCleanup = this._cleanup.bind(this);
    _boundHandleSaveOfflineClick = this._handleSaveOfflineClick.bind(this);
    _boundHandleImageClick = this._handleImageClick.bind(this);

    constructor() {
        this.title = 'Memuat Cerita...';
    }

    async render() {
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
        this._pageContainer = document.getElementById('detail-story-container');
        if (!this._pageContainer) {
            return;
        }

        const urlParams = parseActivePathname();
        const storyId = urlParams.id;

        if (!storyId) {
            setContentBusy(this._pageContainer, false);
            showElementError(this._pageContainer, 'Tidak dapat memuat cerita: ID tidak ditemukan di URL.', null);
            this._pageContainer.removeAttribute('aria-busy');
            document.title = 'Error - ID Tidak Ditemukan';
            return;
        }

        setContentBusy(this._pageContainer, true, 'Memuat detail cerita...');

        try {
            const result = await getStoryDetail(storyId);
            if (result.error || !result.story) {
                throw new Error(result.message || 'Data cerita tidak ditemukan.');
            }
            this._story = result.story;

            this.title = `Cerita oleh ${this._story.name} - Dicoding Story App`;
            document.title = this.title;

            await this._checkOfflineStatus();
            this._renderStoryDetails();

            this._imageElement = this._pageContainer.querySelector('.detail-story__image');
            this._attachImageClickListener();
            this._saveOfflineButton = this._pageContainer.querySelector('#save-offline-button');
            this._attachSaveOfflineListener();

            setContentBusy(this._pageContainer, false);
            this._pageContainer.removeAttribute('aria-busy');

            if (this._story.lat && typeof this._story.lat === 'number' && this._story.lon && typeof this._story.lon === 'number') {
                this._initStoryMap();
            }

            this._attachCleanupListeners();

        } catch (error) {
            setContentBusy(this._pageContainer, false);
            const offlineStory = await getOfflineStoryById(storyId);
            if (offlineStory) {
                this._story = offlineStory;
                this._isSavedOffline = true;

                this.title = `(Offline) Cerita oleh ${this._story.name} - Dicoding Story App`;
                document.title = this.title;

                this._renderStoryDetails();
                showNotification("Menampilkan versi offline karena gagal mengambil data terbaru.", "info", 5000);

                 this._imageElement = this._pageContainer.querySelector('.detail-story__image');
                 this._attachImageClickListener();
                 this._saveOfflineButton = this._pageContainer.querySelector('#save-offline-button');
                 this._attachSaveOfflineListener();

                 if (this._story.lat && typeof this._story.lat === 'number' && this._story.lon && typeof this._story.lon === 'number') {
                     this._initStoryMap();
                 }
                 this._attachCleanupListeners();
            } else {
                 document.title = 'Error Memuat Cerita';
                 showElementError(this._pageContainer, `Gagal memuat cerita: ${error.message}. Versi offline juga tidak ditemukan.`, null);
                 this._pageContainer.removeAttribute('aria-busy');
                 const errorElement = this._pageContainer.querySelector('.error-message');
                 if (errorElement) errorElement.focus();
            }
        }
    }

    async _checkOfflineStatus() {
       if (!this._story || !this._story.id) return;
       try {
          const offlineStory = await getOfflineStoryById(this._story.id);
          this._isSavedOffline = !!offlineStory;
       } catch (e) {
          this._isSavedOffline = false;
       }
    }

    _renderStoryDetails() {
        if (!this._story || !this._pageContainer) return;

        const { name = 'Tanpa Nama', description = 'Tidak ada deskripsi.', photoUrl, createdAt, lat, lon } = this._story;
        const formattedDate = createdAt ? showFormattedDate(createdAt) : 'Tanggal tidak tersedia';
        const fallbackImage = 'images/placeholder.png';
        const imageUrl = photoUrl || fallbackImage;
        const hasLocation = typeof lat === 'number' && typeof lon === 'number' && !isNaN(lat) && !isNaN(lon);

        const saveButtonText = this._isSavedOffline ? '<i class="fas fa-trash-alt"></i> Hapus dari Offline' : '<i class="fas fa-save"></i> Simpan Offline';
        const saveButtonClass = this._isSavedOffline ? 'button--danger' : 'button--success';

        this._pageContainer.innerHTML = `
          <h1 id="detail-page-heading" tabindex="-1">Cerita oleh ${name} ${this._isSavedOffline ? '<span style="font-size: 0.7em; color: var(--medium-text); font-weight: normal;">(Offline)</span>' : ''}</h1>
          <div class="detail-story__layout">
              <div class="detail-story__media" role="button" aria-label="Perbesar gambar cerita">
                   <img src="${imageUrl}" alt="Gambar cerita oleh ${name}" class="detail-story__image" onerror="this.onerror=null; this.src='${fallbackImage}'; this.alt='Gagal memuat gambar cerita oleh ${name}';">
              </div>
              <div class="detail-story__content">
                   <p class="detail-story__date" aria-label="Tanggal dibuat">
                       <i class="far fa-calendar-alt" aria-hidden="true"></i> Dibuat pada: ${formattedDate}
                   </p>
                   <p class="detail-story__description">${description}</p>
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
              <button id="save-offline-button" class="button ${saveButtonClass}" aria-live="polite">
                  ${saveButtonText}
              </button>
          </div>
        `;

        const heading = document.getElementById('detail-page-heading');
        if (heading) heading.focus();
    }

    _handleImageClick(event) {
       event.stopPropagation();
       if (this._story && this._story.photoUrl) {
           openImageModal(this._story.photoUrl, `Cerita oleh ${this._story.name || 'Anonim'}`);
       }
    }

    _attachImageClickListener() {
        this._removeImageClickListener();
        const mediaElement = this._imageElement?.closest('.detail-story__media');
        if (mediaElement) {
            mediaElement.addEventListener('click', this._boundHandleImageClick);
            mediaElement.style.cursor = 'zoom-in';
        }
    }

    _removeImageClickListener() {
        const mediaElement = this._imageElement?.closest('.detail-story__media');
        if (mediaElement) {
            mediaElement.removeEventListener('click', this._boundHandleImageClick);
            mediaElement.style.cursor = '';
        }
    }


    _attachSaveOfflineListener() {
       if (this._saveOfflineButton) {
          this._saveOfflineButton.removeEventListener('click', this._boundHandleSaveOfflineClick);
          this._saveOfflineButton.addEventListener('click', this._boundHandleSaveOfflineClick);
       }
    }

    async _handleSaveOfflineClick() {
       if (!this._story || !this._story.id || !this._saveOfflineButton) return;

       this._saveOfflineButton.disabled = true;
       this._saveOfflineButton.innerHTML = '<span class="spinner spinner--small"></span> Memproses...';

       try {
          if (this._isSavedOffline) {
             await deleteOfflineStory(this._story.id);
             showSuccessMessage(`Cerita "${this._story.name}" dihapus dari penyimpanan offline.`);
             this._isSavedOffline = false;
          } else {
             await saveStoryForOffline(this._story);
             showSuccessMessage(`Cerita "${this._story.name}" disimpan untuk akses offline.`);
             this._isSavedOffline = true;
          }
          this._updateSaveButtonState();
       } catch (error) {
          showErrorMessage(`Gagal ${this._isSavedOffline ? 'menghapus' : 'menyimpan'} cerita: ${error.message}`);
          this._updateSaveButtonState();
       } finally {
          this._saveOfflineButton.disabled = false;
          this._updateSaveButtonState();
       }
    }

    _updateSaveButtonState() {
       if (!this._saveOfflineButton) return;
       const saveButtonText = this._isSavedOffline ? '<i class="fas fa-trash-alt"></i> Hapus dari Offline' : '<i class="fas fa-save"></i> Simpan Offline';
       const saveButtonClass = this._isSavedOffline ? 'button--danger' : 'button--success';
       this._saveOfflineButton.innerHTML = saveButtonText;
       this._saveOfflineButton.className = `button ${saveButtonClass}`;
    }

    _initStoryMap() {
        if (!this._story || typeof this._story.lat !== 'number' || typeof this._story.lon !== 'number') return;

        const mapContainerId = 'detail-story-map';
        const mapElement = document.getElementById(mapContainerId);
        if (!mapElement) {
            return;
        }
         const loadingIndicator = mapElement.querySelector('.content-loading-indicator');
         if (loadingIndicator) mapElement.removeChild(loadingIndicator);

        try {
            const coords = [this._story.lat, this._story.lon];
            if (mapElement._leaflet_id) {
               const oldMap = getMapInstance();
               if (oldMap && oldMap.getContainer().id === mapContainerId) {
                  oldMap.remove();
               }
            }

            this._map = initMap(mapContainerId, coords, 15);
            if (this._map) {
                const popupContent = `Lokasi cerita oleh ${this._story.name || 'Anonim'}`;
                addMarker(coords, popupContent, { draggable: false });
                this._map.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        layer.openPopup();
                    }
                });
            } else {
                 showElementError(mapElement, 'Gagal memuat peta lokasi.');
            }
        } catch (mapError) {
            showElementError(mapElement, 'Gagal memuat peta lokasi.');
        }
    }

     _attachCleanupListeners() {
         window.removeEventListener('hashchange', this._boundCleanup);
         window.addEventListener('hashchange', this._boundCleanup, { once: true });
     }

     _cleanup() {
         this._removeImageClickListener();
         if (this._saveOfflineButton) {
            this._saveOfflineButton.removeEventListener('click', this._boundHandleSaveOfflineClick);
         }

         if (this._map && typeof this._map.remove === 'function') {
             try { this._map.remove(); } catch (e) {}
             this._map = null;
         } else {
             const globalmap = getMapInstance();
             if (globalmap && globalmap.getContainer() && globalmap.getContainer().id === 'detail-story-map') {
                 try { globalmap.remove(); } catch (e) {}
             }
         }

         window.removeEventListener('hashchange', this._boundCleanup);

         this._pageContainer = null;
         this._story = null;
         this._imageElement = null;
         this._saveOfflineButton = null;
         this._isSavedOffline = false;
     }
}