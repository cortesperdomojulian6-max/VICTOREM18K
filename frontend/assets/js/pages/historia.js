import { loadSharedHeader } from '../components/header-loader.js';
import { initAuth } from '../services/auth.js';

document.addEventListener('DOMContentLoaded', function() {
  loadSharedHeader();
  initAuth();
});
