import { addNewStory } from '../../data/api.js';
import { setupMapInput, getMapInstance, clearMarkers, addMarker } from '../../utils/map-utils.js';
import { startCameraStream, stopCameraStream, capturePhoto } from '../../utils/camera-utils.js';
import { setLoadingState, showElementError, clearElementError, showSuccessMessage, showErrorMessage } from '../../utils/ui-utils.js';

export default class AddStoryPage {
    #map = null;
    #selectedLocation = { lat: null, lon: null };
    #photoFile = null;
    #isCameraActive = false;
    #isSubmitting = false;

    #form = null; #descriptionInput = null; #descriptionErrorElement = null;
    #photoPreviewElement = null; #photoFileInput = null; #photoErrorElement = null;
    #videoElement = null; #canvasElement = null; #cameraContainer = null;
    #startCameraButton = null; #capturePhotoButton = null; #uploadFileButton = null;
    #selectedCoordsElement = null; #submitButton = null; #loadingIndicator = null;
    #formErrorMessageElement = null;
    #getCurrentLocationButton = null;
    #locationFeedbackElement = null;

    constructor() {
        this.title = 'Tambah Cerita - Dicoding Story App';
        console.log("[AddStoryPage] Constructor finished.");
    }

    async render() {
        console.log("[AddStoryPage] Rendering...");
        return `
            <section class="container add-story-page" aria-labelledby="page-heading">
                <h1 id="page-heading">Tambah Cerita Baru</h1>
                <form id="add-story-form" novalidate>
                    <div class="form-group">
                        <label for="story-description">Deskripsi Cerita (Wajib):</label>
                        <textarea id="story-description" name="description" required rows="5" placeholder="Tulis deskripsi ceritamu di sini..." aria-describedby="desc-error" aria-required="true"></textarea>
                         <p id="desc-error" class="error-message" role="alert" style="display: none;"></p>
                    </div>
                    <div class="form-group">
                        <label id="photo-label">Foto Cerita (Wajib, maks 1MB):</label>
                        <div class="camera-controls" role="group" aria-labelledby="photo-label">
                             <button type="button" id="start-camera-button" class="button button--secondary" aria-label="Gunakan kamera"><i class="fas fa-camera" aria-hidden="true"></i> Gunakan Kamera</button>
                             <button type="button" id="capture-photo-button" class="button button--secondary" disabled aria-label="Ambil foto"><i class="fas fa-circle-notch" aria-hidden="true"></i> Ambil Foto</button>
                             <button type="button" id="upload-file-button" class="button button--secondary" aria-label="Unggah foto"><i class="fas fa-upload" aria-hidden="true"></i> Unggah File</button>
                             <input type="file" id="photo-file-input" accept="image/png, image/jpeg" style="display: none;" aria-hidden="true">
                        </div>
                        <div id="camera-container" class="camera-container" style="display: none; margin-top: 15px;"><video id="camera-video" playsinline muted autoplay aria-label="Pratinjau kamera"></video><canvas id="photo-canvas" style="display: none;" aria-hidden="true"></canvas></div>
                        <img id="photo-preview" src="#" alt="Pratinjau foto cerita" style="margin-top: 15px; display: none;" />
                        <p id="photo-error" class="error-message" role="alert" style="display: none; margin-top: 5px;"></p>
                    </div>
                    <div class="form-group">
                        <label id="location-label" for="location-map">Lokasi Cerita (Opsional):</label>
                        <p><small>Klik di peta, geser marker, atau gunakan lokasi saat ini.</small></p>
                        <div class="location-controls">
                            <button type="button" id="get-current-location-button" class="button button--secondary">
                                <i class="fas fa-map-marker-alt" aria-hidden="true"></i> Gunakan Lokasi Saya
                            </button>
                            <span id="location-feedback" class="location-feedback" aria-live="polite"></span>
                        </div>
                        <div id="location-map" style="margin-top: 10px;" role="application" aria-labelledby="location-label"></div>
                        <p id="selected-coords" style="margin-top: 10px;" aria-live="polite"></p>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="button button--primary" id="submit-story-button"><i class="fas fa-share" aria-hidden="true"></i> Bagikan Cerita</button>
                         <div id="loading-indicator" class="loading-indicator" style="display: none;" role="status"><div class="spinner spinner--small"></div> Mengirim...</div>
                    </div>
                    <p id="form-error-message" class="error-message" role="alert" style="display: none;" tabindex="-1"></p>
                </form>
            </section>
        `;
    }

    async afterRender() {
        console.log("[AddStoryPage] afterRender started");
        this.#cacheDOMElements();
        if (!this.#form) { console.error("[AddStoryPage] Add story form not found."); return; }

        this._initMapInput();
        this._setupCameraControls();
        this._setupFormSubmit();
        this._setupGetLocationButton();
        this._attachCleanupListeners();
        console.log("[AddStoryPage] afterRender finished.");
        if(this.#descriptionInput) this.#descriptionInput.focus();
    }

     #cacheDOMElements() {
        console.log("[AddStoryPage] Caching DOM elements...");
        this.#form=document.getElementById('add-story-form');
        this.#descriptionInput=document.getElementById('story-description');
        this.#descriptionErrorElement=document.getElementById('desc-error');
        this.#videoElement=document.getElementById('camera-video');
        this.#canvasElement=document.getElementById('photo-canvas');
        this.#photoPreviewElement=document.getElementById('photo-preview');
        this.#photoFileInput=document.getElementById('photo-file-input');
        this.#photoErrorElement=document.getElementById('photo-error');
        this.#cameraContainer=document.getElementById('camera-container');
        this.#startCameraButton=document.getElementById('start-camera-button');
        this.#capturePhotoButton=document.getElementById('capture-photo-button');
        this.#uploadFileButton=document.getElementById('upload-file-button');
        this.#selectedCoordsElement=document.getElementById('selected-coords');
        this.#submitButton=document.getElementById('submit-story-button');
        this.#loadingIndicator=document.getElementById('loading-indicator');
        this.#formErrorMessageElement=document.getElementById('form-error-message');
        this.#getCurrentLocationButton = document.getElementById('get-current-location-button');
        this.#locationFeedbackElement = document.getElementById('location-feedback');
        console.log("[AddStoryPage] DOM elements cached.");
     }

    _initMapInput() {
        console.log("[AddStoryPage] Initializing location input map...");
        try {
            this.#map = setupMapInput('location-map', undefined, (location) => {
                this.#selectedLocation = location;
                this.#updateSelectedCoordsText(location);
                if(this.#locationFeedbackElement) this.#locationFeedbackElement.textContent = '';
            });
            if (!this.#map) throw new Error("Map init returned null.");
            console.log("[AddStoryPage] Location map initialized.");
        }
        catch(error){
            console.error("[AddStoryPage] Failed init location map:", error);
            const m = document.getElementById('location-map');
            if(m) showElementError(m, 'Gagal memuat peta lokasi.');
        }
    }

    _setupGetLocationButton() {
        if (!this.#getCurrentLocationButton) {
            console.warn("[AddStoryPage] Get Current Location button not found.");
            return;
        }
        this.#getCurrentLocationButton.removeEventListener('click', this.#handleGetCurrentLocationClick);
        this.#getCurrentLocationButton.addEventListener('click', this.#handleGetCurrentLocationClick);
        console.log("[AddStoryPage] Get Current Location button listener attached.");
    }

    #handleGetCurrentLocationClick = () => {
        console.log('[Geolocation] "Gunakan Lokasi Saya" button clicked.');
        if (!navigator.geolocation) {
          console.error('[Geolocation] navigator.geolocation is NOT available.');
          showErrorMessage('Browser Anda tidak mendukung Geolocation.');
          if (this.#locationFeedbackElement) this.#locationFeedbackElement.textContent = 'Geolocation tidak didukung.';
          return;
        }
        console.log('[Geolocation] navigator.geolocation IS available.');

        if (!this.#map) {
          console.error('[Geolocation] Map instance is not ready.');
          showErrorMessage('Peta belum siap. Silakan tunggu sebentar.');
           if (this.#locationFeedbackElement) this.#locationFeedbackElement.textContent = 'Peta belum siap.';
          return;
        }
        console.log('[Geolocation] Map instance IS ready.');


        if(this.#locationFeedbackElement) this.#locationFeedbackElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari lokasi...';
        this.#getCurrentLocationButton.disabled = true;
        clearElementError(this.#formErrorMessageElement);

        const options = {
            enableHighAccuracy: false, // Still using false based on previous attempt
            timeout: 15000,
            maximumAge: 0
        };
        console.log('[Geolocation] Attempting navigator.geolocation.getCurrentPosition with options:', options);

        navigator.geolocation.getCurrentPosition(
          // Success Callback
          (position) => {
              console.log('[Geolocation] Success Callback Triggered. Position Object:', position);
              this.#geolocationSuccess(position);
          },
          // Error Callback (Inline for detailed logging)
          (error) => {
              console.error('[Geolocation] Error Callback Triggered. Error Object received from browser:', error);
              this.#geolocationError(error);
          },
          options
        );
        console.log('[Geolocation] navigator.geolocation.getCurrentPosition call initiated.');
      }

    #geolocationSuccess = (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(`[Geolocation] Success - Extracted Coords: Lat: ${lat}, Lon: ${lon}`);

        this.#selectedLocation = { lat, lon };
        this.#updateSelectedCoordsText({ lat, lon });
        if(this.#locationFeedbackElement) this.#locationFeedbackElement.textContent = 'Lokasi ditemukan!';
        this.#getCurrentLocationButton.disabled = false;

        const map = this.#map;
        let inputMarker = null;
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && layer.options.draggable) {
                inputMarker = layer;
            }
        });

        const newLatLng = [lat, lon];
        const popupText = `Lokasi dipilih: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

        if (inputMarker) {
            console.log('[Geolocation] Updating existing marker.');
            inputMarker.setLatLng(newLatLng).setPopupContent(popupText).openPopup();
        } else {
            console.warn("[Geolocation] Input marker not found, creating a new one.");
            const newMarker = L.marker(newLatLng, { draggable: true }).addTo(map);
            newMarker.bindPopup(popupText).openPopup();
            newMarker.on('dragend', (event) => {
                const marker = event.target;
                const pos = marker.getLatLng();
                this.#selectedLocation = { lat: pos.lat, lon: pos.lng };
                this.#updateSelectedCoordsText(this.#selectedLocation);
                marker.setPopupContent(`Lokasi dipilih: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`).openPopup();
              });
        }

        console.log('[Geolocation] Setting map view.');
        map.setView(newLatLng, 16);

        setTimeout(() => {
            if(this.#locationFeedbackElement && this.#locationFeedbackElement.textContent === 'Lokasi ditemukan!') {
                this.#locationFeedbackElement.textContent = '';
            }
        }, 2500);
    }

    #geolocationError = (error) => {
        console.error("[Geolocation] Handling error within #geolocationError. Error code:", error.code, "Message:", error.message);
        let message = 'Tidak dapat mengambil lokasi Anda.';
        switch(error.code) {
            case error.PERMISSION_DENIED: message = "Anda menolak izin akses lokasi."; break;
            case error.POSITION_UNAVAILABLE: message = "Informasi lokasi tidak tersedia."; break;
            case error.TIMEOUT: message = "Waktu habis saat mencoba mengambil lokasi."; break;
        }
        if(this.#locationFeedbackElement) this.#locationFeedbackElement.textContent = `Error: ${message}`;
        showErrorMessage(`Gagal mendapatkan lokasi: ${message}`);
        this.#getCurrentLocationButton.disabled = false;
        console.log("[Geolocation] Finished handling error.");
    }

    #updateSelectedCoordsText(location) {
        if (this.#selectedCoordsElement && location && typeof location.lat === 'number' && typeof location.lon === 'number') {
            this.#selectedCoordsElement.textContent = `Lat: ${location.lat.toFixed(5)}, Lon: ${location.lon.toFixed(5)}`;
            console.log("[AddStoryPage] Updated coords text:", this.#selectedCoordsElement.textContent);
        } else if (this.#selectedCoordsElement) {
             this.#selectedCoordsElement.textContent = '';
             console.log("[AddStoryPage] Cleared coords text.");
        }
    }

    _setupCameraControls() {
        if (!this.#startCameraButton || !this.#capturePhotoButton || !this.#uploadFileButton || !this.#photoFileInput) { console.error("[AddStoryPage] Camera control elements missing."); return; }
        this.#startCameraButton.removeEventListener('click', this.#handleStartCameraButtonClick);
        this.#capturePhotoButton.removeEventListener('click', this.#handleCapturePhotoButtonClick);
        this.#uploadFileButton.removeEventListener('click', this.#triggerFileInput);
        this.#photoFileInput.removeEventListener('change', this.#handleFileInputChange);

        this.#startCameraButton.addEventListener('click', this.#handleStartCameraButtonClick);
        this.#capturePhotoButton.addEventListener('click', this.#handleCapturePhotoButtonClick);
        this.#uploadFileButton.addEventListener('click', this.#triggerFileInput);
        this.#photoFileInput.addEventListener('change', this.#handleFileInputChange);
        console.log("[AddStoryPage] Camera control listeners attached.");
    }

    #triggerFileInput = () => { if (this.#photoFileInput) this.#photoFileInput.click(); }

    #handleStartCameraButtonClick = async () => {
        if (!this.#startCameraButton || !this.#cameraContainer || !this.#capturePhotoButton || !this.#videoElement) return;
        this.#startCameraButton.disabled = true; this.#clearAllErrors();
        try {
            if (this.#isCameraActive) {
                this._stopCamera();
                this.#startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Gunakan Kamera';
            } else {
                this.#cameraContainer.style.display = 'block';
                const streamStarted = await startCameraStream(this.#videoElement);
                if (streamStarted) {
                    this._clearPhotoSelection();
                    this.#isCameraActive = true;
                    this.#startCameraButton.innerHTML = '<i class="fas fa-times"></i> Tutup Kamera';
                    this.#capturePhotoButton.disabled = false;
                } else { this.#cameraContainer.style.display = 'none'; }
            }
        }
        catch (e) {
           console.error("[AddStoryPage] Error toggling camera:", e);
           showElementError(this.#formErrorMessageElement, `Kesalahan Kamera: ${e.message}`);
           this._stopCamera();
           this.#startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Gunakan Kamera';
        } finally { this.#startCameraButton.disabled = false; }
    }

    #handleCapturePhotoButtonClick = async () => {
        if (!this.#capturePhotoButton || !this.#videoElement || !this.#canvasElement) return;
        this.#capturePhotoButton.disabled = true; this.#clearAllErrors();
        try {
            this.#photoFile = await capturePhoto(this.#videoElement, this.#canvasElement);
            if (this.#photoFile) {
                this._displayPhotoPreview(this.#photoFile);
                this._stopCamera();
                this.#startCameraButton.innerHTML = '<i class="fas fa-camera"></i> Gunakan Kamera';
                if (this.#descriptionInput) this.#descriptionInput.focus();
            } else {
                showElementError(this.#photoErrorElement,'Gagal mengambil foto dari kamera.');
                this.#capturePhotoButton.disabled = false;
            }
        }
        catch(e){
            console.error("[AddStoryPage] Error capturing photo:", e);
            showElementError(this.#photoErrorElement,`Error pengambilan foto: ${e.message}`);
            this.#capturePhotoButton.disabled = false;
        }
    }

    #handleFileInputChange = (event) => {
        if (!event.target.files?.[0]) return; const f = event.target.files[0]; this.#clearAllErrors();
        if (f) {
           const maxSizeMB = 1;
           if (f.size > maxSizeMB * 1024 * 1024) {
               showElementError(this.#photoErrorElement, `Ukuran file melebihi ${maxSizeMB}MB.`);
               this.#photoFileInput.value = ''; this._clearPhotoSelection(); return;
           }
           if (!f.type.startsWith('image/')) {
               showElementError(this.#photoErrorElement,'File yang dipilih bukan gambar.');
               this.#photoFileInput.value = ''; this._clearPhotoSelection(); return;
           }
           this.#photoFile = f;
           this._displayPhotoPreview(f);
           this._stopCamera();
           if(this.#startCameraButton) this.#startCameraButton.innerHTML='<i class="fas fa-camera"></i> Gunakan Kamera';
           if (this.#descriptionInput) this.#descriptionInput.focus();
        }
    }

    _displayPhotoPreview(fileOrBlob) {
        if (!this.#photoPreviewElement) return;
        const reader = new FileReader();
        reader.onload = (e) => {
           this.#photoPreviewElement.src = e.target.result;
           this.#photoPreviewElement.style.display = 'block';
           this.#photoPreviewElement.alt = 'Pratinjau foto yang dipilih';
        };
        reader.onerror = (e) => {
           console.error("[AddStoryPage] FileReader error:", e);
           showElementError(this.#photoErrorElement,"Gagal membaca file gambar.");
           this._clearPhotoSelection();
        };
        reader.readAsDataURL(fileOrBlob);
    }

    _clearPhotoSelection() {
        this.#photoFile = null;
        if(this.#photoPreviewElement){
            this.#photoPreviewElement.style.display = 'none';
            this.#photoPreviewElement.src = '#';
            this.#photoPreviewElement.alt = 'Pratinjau foto cerita';
        }
        if(this.#photoFileInput) this.#photoFileInput.value = '';
        clearElementError(this.#photoErrorElement);
        console.log("[AddStoryPage] Photo selection cleared.");
    }

    _stopCamera() {
        if(this.#isCameraActive && this.#videoElement){
            stopCameraStream(this.#videoElement);
            if(this.#cameraContainer) this.#cameraContainer.style.display = 'none';
            if(this.#capturePhotoButton) this.#capturePhotoButton.disabled = true;
            this.#isCameraActive = false;
            console.log("[AddStoryPage] Camera stream stopped.");
        }
    }

    _setupFormSubmit() {
        if(!this.#form) return;
        this.#form.removeEventListener('submit', this.#handleFormSubmit);
        this.#form.addEventListener('submit', this.#handleFormSubmit);
        console.log("[AddStoryPage] Form submit listener attached.");
    }

    #validateForm() {
        this.#clearAllErrors(); let isValid = true;
        const description = this.#descriptionInput.value.trim();
        if (!description) { showElementError(this.#descriptionErrorElement,'Deskripsi cerita tidak boleh kosong.', this.#descriptionInput); isValid = false; }
        if (!this.#photoFile) {
            showElementError(this.#photoErrorElement,'Foto cerita wajib diisi (dari kamera atau unggah file).');
            if (isValid) {
                if (!this.#isCameraActive && this.#uploadFileButton) this.#uploadFileButton.focus();
                else if (this.#isCameraActive && this.#capturePhotoButton) this.#capturePhotoButton.focus();
                else if (this.#startCameraButton) this.#startCameraButton.focus();
            }
            isValid = false;
        }
        console.log('[AddStoryPage] Form validation result:', isValid);
        return isValid;
    }

    #handleFormSubmit = async (event) => {
        event.preventDefault();
        console.log('[AddStoryPage] Handling form submit...');
        if (this.#isSubmitting) {
            console.warn('[AddStoryPage] Already submitting, ignoring.');
            return;
        }

        if (!this.#validateForm()){
            showElementError(this.#formErrorMessageElement,'Periksa kembali isian form yang wajib diisi.');
            const firstError = this.#form.querySelector('[aria-invalid="true"]');
            if (firstError) { firstError.focus(); }
            else { this.#formErrorMessageElement.focus();}
            return;
        }

        const description = this.#descriptionInput.value.trim();
        const controlsToDisable = [
            this.#descriptionInput, this.#startCameraButton, this.#capturePhotoButton,
            this.#uploadFileButton, this.#photoFileInput, this.#getCurrentLocationButton,
            this.#submitButton
        ];
        setLoadingState(this.#loadingIndicator, this.#submitButton, true, controlsToDisable);
        this.#isSubmitting = true;
        this.#form.setAttribute('aria-busy', 'true');

        try {
            console.log('[AddStoryPage] Calling addNewStory API...');
            await addNewStory({
                description: description,
                photo: this.#photoFile,
                lat: this.#selectedLocation.lat,
                lon: this.#selectedLocation.lon
            });
            console.log('[AddStoryPage] addNewStory API success.');
            showSuccessMessage('Cerita baru berhasil dibagikan!');
            this._cleanup();
            setTimeout(() => { location.hash = '#/'; }, 1500);
        }
        catch(e){
            console.error('[AddStoryPage] Error submitting story:', e);
            showElementError(this.#formErrorMessageElement, `Gagal mengirim cerita: ${e.message}`);
            setLoadingState(this.#loadingIndicator, this.#submitButton, false, controlsToDisable);
            this.#isSubmitting = false;
            this.#form.removeAttribute('aria-busy');
            this.#formErrorMessageElement.focus();
        }
    }

    #clearAllErrors() {
        clearElementError(this.#formErrorMessageElement);
        clearElementError(this.#descriptionErrorElement, this.#descriptionInput);
        clearElementError(this.#photoErrorElement);
        if(this.#locationFeedbackElement) this.#locationFeedbackElement.textContent = '';
    }

    _attachCleanupListeners() {
        window.removeEventListener('beforeunload', this._cleanup);
        window.removeEventListener('hashchange', this._cleanup);
        window.addEventListener('beforeunload', this._cleanup);
        window.addEventListener('hashchange', this._cleanup);
        console.log("[AddStoryPage] Cleanup listeners attached.");
    }

    _cleanup = () => {
        if (!this.#form && !this.#map) {
            console.log("[AddStoryPage] Cleanup skipped, elements likely already removed.");
            return;
        };
        console.log("[AddStoryPage] Cleaning up resources...");
        this._stopCamera();

        if (this.#map?.remove) {
            try { this.#map.remove(); console.log("[AddStoryPage] AddStory map instance removed."); } catch (e) {}
        }
        this.#map = null;

        window.removeEventListener('beforeunload', this._cleanup);
        window.removeEventListener('hashchange', this._cleanup);

        this.#form = null; this.#descriptionInput = null; this.#descriptionErrorElement = null;
        this.#videoElement = null; this.#canvasElement = null; this.#photoPreviewElement = null;
        this.#photoFileInput = null; this.#photoErrorElement = null; this.#cameraContainer = null;
        this.#startCameraButton = null; this.#capturePhotoButton = null; this.#uploadFileButton = null;
        this.#selectedCoordsElement = null; this.#submitButton = null; this.#loadingIndicator = null;
        this.#formErrorMessageElement = null; this.#getCurrentLocationButton = null; this.#locationFeedbackElement = null;
        this.#selectedLocation = { lat: null, lon: null }; this.#photoFile = null;
        this.#isSubmitting = false; this.#isCameraActive = false;

        console.log("[AddStoryPage] Cleanup done.");
    }

}