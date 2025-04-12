/**
 * Main application entry point for the News Reader Knowledge Graph
 * 
 * This script initializes the application components and handles
 * the setup of the knowledge graph visualization.
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the knowledge graph component
  const graphContainer = document.getElementById('graphContainer');
  if (!graphContainer) {
    console.error('Graph container element not found!');
    return;
  }

  // Create graph visualization component
  const knowledgeGraph = new KnowledgeGraph('graphContainer');
  knowledgeGraph.init();

  // Initialize data service
  const dataService = new DataService();

  try {
    // Display loading indicator
    showLoading();

    // Fetch data from the API (or get sample data if API fails)
    console.log('Fetching knowledge graph data...');
    const data = await dataService.fetchKnowledgeGraphData();
    console.log('Knowledge graph data obtained:', data);
    console.log('Categories count:', Array.isArray(data.categories) ? data.categories.length : 'NOT AN ARRAY');
    console.log('Topics count:', Array.isArray(data.topics) ? data.topics.length : 'NOT AN ARRAY');

    // Hide loading indicator
    hideLoading();

    // Load data into the graph visualization
    console.log('Rendering graph with data...');
    knowledgeGraph.render(data);
    console.log('Graph rendering complete');

    // The controls are now created during initialization
    // No need to call setupControls() separately

    // Log success
    console.log('Knowledge graph initialized successfully');
  } catch (error) {
    // Hide loading indicator
    hideLoading();

    // Show error
    console.error('Failed to initialize knowledge graph:', error);
    showError('Failed to load knowledge graph data. Please try refreshing the page.');
  }

  /**
   * Show loading indicator
   */
  function showLoading() {
    // Create loading element if it doesn't exist
    if (!document.getElementById('loadingIndicator')) {
      const loading = document.createElement('div');
      loading.id = 'loadingIndicator';
      loading.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading knowledge graph...</p>
      `;
      loading.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(255, 255, 255, 0.9);
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        text-align: center;
        z-index: 100;
      `;
      
      const spinner = document.createElement('style');
      spinner.textContent = `
        .loading-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 1rem;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #2e5077;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinner);
      graphContainer.appendChild(loading);
    }
  }

  /**
   * Hide loading indicator
   */
  function hideLoading() {
    const loading = document.getElementById('loadingIndicator');
    if (loading) {
      loading.remove();
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
      <div class="error-icon">⚠️</div>
      <p>${message}</p>
      <button id="retryButton">Try Again</button>
    `;
    errorElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 80%;
    `;
    
    // Add styles
    const errorStyles = document.createElement('style');
    errorStyles.textContent = `
      .error-message p {
        margin: 1rem 0;
        color: #d32f2f;
      }
      
      .error-icon {
        font-size: 3rem;
      }
      
      #retryButton {
        padding: 0.5rem 1.5rem;
        background-color: #2e5077;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      
      #retryButton:hover {
        background-color: #1a365d;
      }
    `;
    document.head.appendChild(errorStyles);
    
    // Append to container
    graphContainer.appendChild(errorElement);
    
    // Add retry functionality
    document.getElementById('retryButton').addEventListener('click', () => {
      window.location.reload();
    });
  }
});
