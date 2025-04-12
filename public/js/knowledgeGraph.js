/**
 * Knowledge Graph Visualization - Basic Implementation
 * Simplified version that focuses on reliable rendering and good UX
 */
class KnowledgeGraph {
  constructor(containerId) {
    this.containerId = containerId;
    this.graph = null;
    this.data = { nodes: [], edges: [] };
    this.expandedNodes = new Set();
    
    // Visibility settings
    this.visibilitySettings = {
      showSubcategories: true,
      showTopics: true
    };
    
    // Color scheme for different node types
    this.nodeColors = {
      root: '#2c3e50',      // Dark blue-gray
      category: '#3498db',   // Bright blue
      subcategory: '#27ae60', // Green
      topic: '#e74c3c'       // Red
    };
    
    console.log('Knowledge Graph basic implementation created');
  }
  
  /**
   * Initialize the graph with basic configuration
   */
  init() {
    console.log('Initializing basic knowledge graph visualization');
    
    // First check if container exists
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Graph container not found:', this.containerId);
      return;
    }
    
    // Clean existing content
    container.innerHTML = '';
    
    // Create controls panel
    this.createVisibilityControls();
    
    // Set sizing and styling
    container.style.height = 'calc(100vh - 150px)';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    try {
      // Get dimensions
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;
      
      console.log(`Initializing graph with size ${width}x${height}`);
      
      // Define graph configuration - minimalistic approach for reliability
      const graphConfig = {
        container: this.containerId,
        width,
        height,
        fitView: true,
        fitCenter: true,
        animate: true,
        modes: {
          default: ['drag-canvas', 'zoom-canvas', 'drag-node']
        },
        defaultNode: {
          // Simple circle nodes
          type: 'circle',
          size: 30,
          style: {
            fill: '#3498db',
            stroke: '#2980b9',
            lineWidth: 2,
            cursor: 'pointer'
          },
          labelCfg: {
            style: {
              fill: '#fff',
              fontSize: 12,
              background: {
                fill: 'rgba(0,0,0,0.65)',
                padding: [4, 6, 4, 6],
                radius: 3
              }
            }
          }
        },
        defaultEdge: {
          // Simple lines for edges
          type: 'line',
          style: {
            stroke: '#aaa',
            lineWidth: 1.5,
            endArrow: true
          }
        },
        // Very simple layout that reliably works
        layout: {
          type: 'force',
          preventOverlap: true,
          nodeStrength: -50,
          linkDistance: 100,
          alphaDecay: 0.028
        }
      };
      
      // Create graph instance
      this.graph = new G6.Graph(graphConfig);
      
      // Create a small dummy graph to ensure rendering works
      this.createDummyGraph();
      
      // Register event handlers
      this.registerEvents();
      
      // Prevent page scrolling when interacting with graph
      container.addEventListener('wheel', (e) => {
        e.preventDefault();
      }, { passive: false });
      
      console.log('Basic knowledge graph initialized successfully');
    } catch (error) {
      console.error('Error initializing graph:', error);
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #d32f2f;">
          <h3>Visualization Error</h3>
          <p>Failed to initialize graph visualization: ${error.message}</p>
          <p><a href="/simple-graph.html">Try the simple version instead</a></p>
        </div>
      `;
    }
  }
  
  /**
   * Create a small demo graph to ensure rendering works
   */
  createDummyGraph() {
    // Create a simple demo graph
    const nodes = [
      { id: 'root', label: 'Knowledge Graph', nodeType: 'root' },
      { id: 'cat1', label: 'Technology', nodeType: 'category' },
      { id: 'cat2', label: 'Business', nodeType: 'category' },
      { id: 'cat3', label: 'Politics', nodeType: 'category' }
    ];
    
    const edges = [
      { id: 'e1', source: 'root', target: 'cat1' },
      { id: 'e2', source: 'root', target: 'cat2' },
      { id: 'e3', source: 'root', target: 'cat3' }
    ];
    
    // Render the demo graph
    this.graph.data({ nodes, edges });
    this.graph.render();
    
    // Store for later use
    this.demoData = { nodes, edges };
  }
  
  /**
   * Create visibility controls panel
   */
  createVisibilityControls() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Create panel
    const controlsPanel = document.createElement('div');
    controlsPanel.className = 'graph-controls';
    controlsPanel.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      padding: 12px;
      z-index: 100;
      width: 180px;
    `;
    
    // Add title
    const title = document.createElement('div');
    title.textContent = 'Visibility Controls';
    title.style.cssText = 'font-weight: bold; margin-bottom: 10px; font-size: 14px;';
    controlsPanel.appendChild(title);
    
    // Add subcategories toggle
    const subcatContainer = document.createElement('div');
    subcatContainer.style.cssText = 'display: flex; align-items: center; margin-bottom: 8px;';
    
    const subcatLabel = document.createElement('label');
    subcatLabel.textContent = 'Show Subcategories';
    subcatLabel.style.cssText = 'flex: 1; font-size: 12px;';
    
    const subcatToggle = document.createElement('input');
    subcatToggle.type = 'checkbox';
    subcatToggle.checked = this.visibilitySettings.showSubcategories;
    subcatToggle.addEventListener('change', () => {
      this.visibilitySettings.showSubcategories = subcatToggle.checked;
      // Will implement actual filtering later
    });
    
    subcatContainer.appendChild(subcatLabel);
    subcatContainer.appendChild(subcatToggle);
    controlsPanel.appendChild(subcatContainer);
    
    // Add topics toggle
    const topicsContainer = document.createElement('div');
    topicsContainer.style.cssText = 'display: flex; align-items: center; margin-bottom: 12px;';
    
    const topicsLabel = document.createElement('label');
    topicsLabel.textContent = 'Show Topics';
    topicsLabel.style.cssText = 'flex: 1; font-size: 12px;';
    
    const topicsToggle = document.createElement('input');
    topicsToggle.type = 'checkbox';
    topicsToggle.checked = this.visibilitySettings.showTopics;
    topicsToggle.addEventListener('change', () => {
      this.visibilitySettings.showTopics = topicsToggle.checked;
      // Will implement actual filtering later
    });
    
    topicsContainer.appendChild(topicsLabel);
    topicsContainer.appendChild(topicsToggle);
    controlsPanel.appendChild(topicsContainer);
    
    // Action buttons
    const expandAllBtn = document.createElement('button');
    expandAllBtn.textContent = 'Expand All';
    expandAllBtn.style.cssText = 'width: 100%; padding: 6px; margin-bottom: 6px; cursor: pointer;';
    expandAllBtn.addEventListener('click', () => this.expandAllNodes());
    controlsPanel.appendChild(expandAllBtn);
    
    const collapseAllBtn = document.createElement('button');
    collapseAllBtn.textContent = 'Collapse All';
    collapseAllBtn.style.cssText = 'width: 100%; padding: 6px; cursor: pointer;';
    collapseAllBtn.addEventListener('click', () => this.collapseAllNodes());
    controlsPanel.appendChild(collapseAllBtn);
    
    // Add to container
    container.appendChild(controlsPanel);
  }
  
  /**
   * Register event handlers
   */
  registerEvents() {
    if (!this.graph) return;
    
    // Node click
    this.graph.on('node:click', e => {
      const model = e.item.getModel();
      console.log('Node clicked:', model);
      
      // For now, just style the node differently when clicked
      const color = this.nodeColors[model.nodeType] || '#3498db';
      e.item.update({
        style: {
          lineWidth: 4,
          stroke: color,
          shadowColor: color,
          shadowBlur: 10
        }
      });
      this.graph.refresh();
    });
    
    // Canvas click
    this.graph.on('canvas:click', () => {
      // Reset all node styles
      this.graph.getNodes().forEach(node => {
        const model = node.getModel();
        const type = model.nodeType || 'category';
        const color = this.nodeColors[type] || '#3498db';
        node.update({
          style: {
            lineWidth: 2,
            stroke: color,
            shadowBlur: 0
          }
        });
      });
      this.graph.refresh();
    });
    
    // Add handler for fit button
    const fitBtn = document.getElementById('fitView');
    if (fitBtn) {
      fitBtn.addEventListener('click', () => {
        this.centerGraph();
      });
    }
    
    // Add handlers for zoom buttons
    const zoomInBtn = document.getElementById('zoomIn');
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        this.graph.zoom(1.2);
      });
    }
    
    const zoomOutBtn = document.getElementById('zoomOut');
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        this.graph.zoom(0.8);
      });
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
      this.resizeGraph();
    });
  }
  
  /**
   * Center the graph in the viewport
   */
  centerGraph() {
    if (!this.graph) return;
    
    try {
      // First fit the view to ensure all nodes are visible
      this.graph.fitView(30);
      
      // Then center the graph
      this.graph.fitCenter();
      
      // Refresh after centering
      this.graph.refresh();
      
      console.log('Graph centered successfully');
    } catch (error) {
      console.warn('Error centering graph:', error);
    }
  }
  
  /**
   * Resize the graph when window size changes
   */
  resizeGraph() {
    if (!this.graph) return;
    
    try {
      const container = document.getElementById(this.containerId);
      if (!container) return;
      
      // Update size based on container
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // Apply new dimensions
      this.graph.changeSize(width, height);
      
      // Re-center all elements
      this.centerGraph();
      
      console.log(`Graph resized to ${width}x${height}`);
    } catch (error) {
      console.warn('Error resizing graph:', error);
    }
  }
  
  /**
   * Placeholder for expanding all nodes
   */
  expandAllNodes() {
    console.log('Expand all nodes requested');
    // Will implement later
  }
  
  /**
   * Placeholder for collapsing all nodes
   */
  collapseAllNodes() {
    console.log('Collapse all nodes requested');
    // Will implement later
  }
  
  /**
   * Transform API data to graph format
   * This is a simplified version
   */
  transformData(rawData) {
    console.log('Transforming data for visualization');
    
    if (!rawData || !rawData.categories || !rawData.topics) {
      console.error('Invalid data format for transformation');
      return { nodes: [], edges: [] };
    }
    
    const nodes = [];
    const edges = [];
    
    try {
      // Add root node
      const rootNode = {
        id: 'root',
        label: 'Knowledge Graph',
        nodeType: 'root'
      };
      nodes.push(rootNode);
      
      // Add category nodes
      if (Array.isArray(rawData.categories)) {
        rawData.categories.forEach(category => {
          if (!category || !category.id || !category.name) return;
          
          const id = category.id.toString();
          
          nodes.push({
            id,
            label: category.name,
            nodeType: 'category',
            originalData: category
          });
          
          edges.push({
            id: `root-${id}`,
            source: 'root',
            target: id
          });
        });
      }
      
      console.log(`Transformed data: ${nodes.length} nodes, ${edges.length} edges`);
      return { nodes, edges };
    } catch (error) {
      console.error('Error transforming data:', error);
      return { nodes: [], edges: [] };
    }
  }
  
  /**
   * Render the graph with data
   */
  render(apiData) {
    console.log('Rendering knowledge graph');
    
    try {
      if (!this.graph) {
        console.error('Graph not initialized');
        return;
      }
      
      if (!apiData) {
        console.warn('No data provided, keeping demo graph');
        return;
      }
      
      // Transform data
      const data = this.transformData(apiData);
      
      // Store for future reference
      this.data = data;
      
      // Only render if we have nodes
      if (data.nodes.length > 0) {
        // Clear previous data
        this.graph.clear();
        
        // Load new data
        this.graph.data(data);
        
        // Render
        this.graph.render();
        
        // Center graph
        this.centerGraph();
        
        console.log('Graph rendered with API data');
      } else {
        console.warn('No nodes generated from data, keeping demo graph');
      }
    } catch (error) {
      console.error('Error rendering graph:', error);
      // Keep the demo graph if there's an error
    }
  }
}
