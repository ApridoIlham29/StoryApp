import { getAllOfflineStories, deleteOfflineStory } from '../../utils/idb-utils';
import { showSuccessMessage, showErrorMessage, setContentBusy } from '../../utils/ui-utils';

export default class OfflinePage {
  #container = null;
  #stories = [];
  #boundHandleDeleteClick = this.#handleDeleteClick.bind(this);
  #boundCleanup = this._cleanup.bind(this);

  constructor() {
    this.title = 'Cerita Tersimpan - Dicoding Story App';
  }

  async render() {
    return `
      <section class="container offline-page" id="offline-page-container" aria-labelledby="page-heading">
        <h1 id="page-heading">Cerita Tersimpan Offline</h1>
         <div id="offline-stories-list" class="stories-list" aria-live="polite" aria-busy="true">
            <div class="content-loading-indicator" role="status">
                <div class="spinner" aria-hidden="true"></div>
                <p>Memuat cerita tersimpan...</p>
            </div>
         </div>
      </section>
    `;
  }

  async afterRender() {
    this.#container = document.getElementById('offline-stories-list');
    if (!this.#container) return;

    setContentBusy(this.#container, true, 'Memuat cerita tersimpan...');
    try {
      this.#stories = await getAllOfflineStories();
      this._renderList();
    } catch (error) {
       console.error("Error loading offline stories:", error);
       showErrorMessage("Gagal memuat cerita tersimpan.");
       this.#container.innerHTML = '<p class="error-message" style="text-align:center; padding: 20px;">Gagal memuat data offline.</p>';
    } finally {
        setContentBusy(this.#container, false);
        this.#container.removeAttribute('aria-busy');
        this.#attachCleanupListener();
    }
  }

  _renderList() {
     if (!this.#container) return;
     this.#container.innerHTML = '';

     if (this.#stories.length === 0) {
       this.#container.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--medium-text);">Belum ada cerita yang disimpan untuk akses offline.</p>';
       return;
     }

     const fragment = document.createDocumentFragment();
     this.#stories.forEach(story => {
       const storyItemContainer = document.createElement('div');
       storyItemContainer.className = 'offline-story-item-wrapper';

       const storyItemElement = document.createElement('story-item');
       storyItemElement.story = story;
       storyItemContainer.appendChild(storyItemElement);

       const deleteButton = document.createElement('button');
       deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Hapus';
       deleteButton.className = 'button button--danger button--sm offline-delete-button';
       deleteButton.setAttribute('aria-label', `Hapus cerita offline oleh ${story.name}`);
       deleteButton.dataset.id = story.id;
       deleteButton.addEventListener('click', this.#boundHandleDeleteClick);
       storyItemContainer.appendChild(deleteButton);

       fragment.appendChild(storyItemContainer);
     });

     this.#container.appendChild(fragment);
     this.#addWrapperStyles();
  }

  async #handleDeleteClick(event) {
     const button = event.currentTarget;
     const storyId = button.dataset.id;
     if (!storyId) return;

     const storyToDelete = this.#stories.find(s => s.id === storyId);
     const storyName = storyToDelete ? storyToDelete.name : storyId;

     if (confirm(`Anda yakin ingin menghapus cerita "${storyName}" dari penyimpanan offline?`)) {
        button.disabled = true;
        button.innerHTML = '<span class="spinner spinner--small"></span> Menghapus...';
        try {
           await deleteOfflineStory(storyId);
           showSuccessMessage("Cerita berhasil dihapus dari offline.");
           this.#stories = this.#stories.filter(s => s.id !== storyId);
           button.closest('.offline-story-item-wrapper')?.remove();
           if (this.#stories.length === 0) {
             this._renderList();
           }
        } catch (error) {
           console.error("Error deleting offline story:", error);
           showErrorMessage(`Gagal menghapus cerita: ${error.message}`);
           button.disabled = false;
           button.innerHTML = '<i class="fas fa-trash-alt"></i> Hapus';
        }
     }
  }

  #addWrapperStyles() {
    if (!document.getElementById('offline-item-style')) {
        const style = document.createElement('style');
        style.id = 'offline-item-style';
        style.innerHTML = `
            .offline-story-item-wrapper {
                display: flex;
                flex-direction: column;
                gap: 0;
                break-inside: avoid-column;
                page-break-inside: avoid;
                -webkit-column-break-inside: avoid;
                margin-bottom: var(--spacing-lg);
                position: relative;
            }
            .offline-story-item-wrapper story-item {
               margin-bottom: 0 !important;
               border-bottom-left-radius: 0;
               border-bottom-right-radius: 0;
               border-bottom: none;
            }
            .offline-delete-button {
                border-top-left-radius: 0;
                border-top-right-radius: 0;
                width: 100%;
                padding: var(--spacing-sm) var(--spacing-md);
                font-size: 0.85rem;
                border-top: 1px solid #6e3b3b;
            }
            .offline-delete-button .spinner {
               border-left-color: white;
            }
        `;
        document.head.appendChild(style);
    }
  }

  _cleanup() {
      console.log("OfflinePage cleanup initiated...");
      const buttons = this.#container?.querySelectorAll('.offline-delete-button');
      buttons?.forEach(button => button.removeEventListener('click', this.#boundHandleDeleteClick));
      this.#container = null;
      this.#stories = [];
      window.removeEventListener('hashchange', this.#boundCleanup);
      console.log("OfflinePage cleanup done.");
  }

  #attachCleanupListener() {
      window.removeEventListener('hashchange', this.#boundCleanup);
      window.addEventListener('hashchange', this.#boundCleanup, { once: true });
      console.log("OfflinePage cleanup listener attached.");
  }
}