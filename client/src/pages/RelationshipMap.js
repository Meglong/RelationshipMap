import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from 'react-query';
import ForceGraph2D from 'react-force-graph-2d';
import { MessageCircle, Tag, X } from 'lucide-react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const RelationshipMap = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 200, y: 200 });
  const [mousePosition, setMousePosition] = useState({ x: 200, y: 200 });
  const [filters, setFilters] = useState({
    relationshipType: 'all',
    hasRecentInteraction: false,
    hasSharedInterests: false
  });
  
  const fgRef = useRef();

  // Track mouse position for hover card positioning
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { data: relationships, isLoading } = useQuery(
    'relationships',
    async () => {
      const response = await axios.get('/api/relationships/map');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Transform relationships data for the graph
  const graphData = React.useMemo(() => {
    if (!relationships) return { nodes: [], links: [] };

    const nodes = relationships.map(rel => {
      const contact = rel.contact || rel.contactId || {};
      return {
        id: contact.slackUserId || `unknown-${Math.random()}`,
        name: contact.displayName || contact.realName || 'Unknown',
        realName: contact.realName || contact.displayName || 'Unknown',
        avatar: contact.avatar,
        title: contact.profile?.title || '',
        department: contact.profile?.department || '',
        relationshipType: rel.relationshipType,
        lastInteraction: rel.lastInteraction,
        interactionCount: rel.interactionCount || 0,
        sharedChannels: rel.sharedChannels || [],
        sharedInterests: rel.sharedInterests || [],
        notes: rel.notes,
        tags: rel.tags || [],
        addedVia: rel.addedVia,
        addedAt: rel.addedAt
      };
    });

    // Add current user as center node
    nodes.unshift({
      id: 'current-user',
      name: 'You',
      realName: 'Current User',
      avatar: null,
      title: '',
      department: '',
      relationshipType: 'self',
      isCenter: true
    });

    // Create links from current user to all contacts
    const links = relationships.map(rel => {
      const contact = rel.contact || rel.contactId || {};
      return {
        source: 'current-user',
        target: contact.slackUserId || `unknown-${Math.random()}`,
        relationshipType: rel.relationshipType,
        addedVia: rel.addedVia
      };
    });

    return { nodes, links };
  }, [relationships]);

  // Apply filters
  const filteredGraphData = React.useMemo(() => {
    if (!graphData.nodes.length) return graphData;

    let filteredNodes = graphData.nodes.filter(node => {
      if (node.isCenter) return true;
      
      if (filters.relationshipType !== 'all' && node.relationshipType !== filters.relationshipType) {
        return false;
      }
      
      if (filters.hasRecentInteraction && (!node.lastInteraction || new Date(node.lastInteraction) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))) {
        return false;
      }
      
      if (filters.hasSharedInterests && (!node.sharedInterests || node.sharedInterests.length === 0)) {
        return false;
      }
      
      return true;
    });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links.filter(link => 
      filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
    );

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, filters]);

  const handleNodeClick = useCallback((node) => {
    if (!node || node.isCenter) return;
    setSelectedNode(node);
  }, []);

  const handleNodeHover = useCallback((node, event) => {
    if (!node || node.isCenter) return;
    setHoveredNode(node);
    
    // Try to get node's screen coordinates from the ForceGraph
    let x = mousePosition.x + 15;
    let y = mousePosition.y + 10;
    
    if (fgRef.current && node.x !== undefined && node.y !== undefined) {
      try {
        // Convert node coordinates to screen coordinates
        const screenCoords = fgRef.current.getScreenCoords(node.x, node.y);
        if (screenCoords) {
          x = screenCoords.x + 15;
          y = screenCoords.y + 10;
        }
      } catch (error) {
        // Fall back to tracked mouse position if conversion fails
      }
    }
    
    // Apply boundary checks
    const cardWidth = 300;
    const cardHeight = 200;
    const padding = 10;
    
    if (x + cardWidth > window.innerWidth - padding) {
      x = Math.max(padding, x - cardWidth - 30);
    }
    if (y + cardHeight > window.innerHeight - padding) {
      y = Math.max(padding, y - cardHeight - 20);
    }
    
    x = Math.max(padding, x);
    y = Math.max(padding, y);
    
    setHoverPosition({ x, y });
  }, [mousePosition.x, mousePosition.y]);

  const handleNodeUnhover = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const getNodeColor = (node) => {
    if (!node) return '#6B7280';
    if (node.isCenter) return '#4A154B';
    
    const colors = {
      team_member: '#3B82F6',
      direct_report: '#10B981',
      manager: '#8B5CF6',
      colleague: '#6B7280',
      mentor: '#F59E0B',
      mentee: '#F97316',
      friend: '#EC4899',
      custom: '#6366F1'
    };
    
    return colors[node.relationshipType] || '#6B7280';
  };

  const getNodeSize = (node) => {
    if (!node) return 4;
    if (node.isCenter) return 8;
    return node.interactionCount > 10 ? 6 : 4;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No recent interaction';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relationship Map</h1>
            <p className="text-gray-600">
              Visualize your professional network and connections
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">
              {relationships?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Total Relationships</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <select
              value={filters.relationshipType}
              onChange={(e) => setFilters(prev => ({ ...prev, relationshipType: e.target.value }))}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="team_member">Team Member</option>
              <option value="direct_report">Direct Report</option>
              <option value="manager">Manager</option>
              <option value="colleague">Colleague</option>
              <option value="mentor">Mentor</option>
              <option value="mentee">Mentee</option>
              <option value="friend">Friend</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="recent-interaction"
              checked={filters.hasRecentInteraction}
              onChange={(e) => setFilters(prev => ({ ...prev, hasRecentInteraction: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="recent-interaction" className="ml-2 text-sm text-gray-700">
              Recent Interaction (7 days)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="shared-interests"
              checked={filters.hasSharedInterests}
              onChange={(e) => setFilters(prev => ({ ...prev, hasSharedInterests: e.target.checked }))}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="shared-interests" className="ml-2 text-sm text-gray-700">
              Has Shared Interests
            </label>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div style={{ height: '900px' }} className="w-full">
          <ForceGraph2D
            ref={fgRef}
            graphData={filteredGraphData}
            nodeLabel={(node) => node ? node.name : ''}
            nodeColor={getNodeColor}
            nodeVal={getNodeSize}
            linkColor="#94A3B8"
            linkWidth={2}
            linkOpacity={0.6}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onNodeUnhover={handleNodeUnhover}
            cooldownTicks={100}
            nodeCanvasObject={(node, ctx, globalScale) => {
              if (!node || !node.name || !ctx) return;
              
              const label = node.name;
              const fontSize = 12/globalScale;
              ctx.font = `${fontSize}px Inter`;
              const textWidth = ctx.measureText(label).width;
              const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#374151';
              ctx.fillText(label, node.x, node.y);

              node.__bckgDimensions = bckgDimensions;
            }}
            nodeCanvasObjectMode={() => 'after'}
          />
        </div>
      </div>

      {/* Hover Preview */}
      {hoveredNode && !hoveredNode.isCenter && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs"
          style={{
            left: hoverPosition.x,
            top: hoverPosition.y,
            pointerEvents: 'none'
          }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <img
              className="h-10 w-10 rounded-full"
              src={hoveredNode.avatar || 'https://via.placeholder.com/40'}
              alt={hoveredNode.name}
            />
            <div>
              <h3 className="font-medium text-gray-900">{hoveredNode.name}</h3>
              <p className="text-sm text-gray-500">{hoveredNode.title}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              {formatDate(hoveredNode.lastInteraction)}
            </div>
            
            {hoveredNode.sharedInterests && hoveredNode.sharedInterests.length > 0 && (
              <div className="flex items-center text-gray-600">
                <Tag className="h-4 w-4 mr-2" />
                {hoveredNode.sharedInterests.slice(0, 2).join(', ')}
                {hoveredNode.sharedInterests.length > 2 && '...'}
              </div>
            )}
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium relationship-${hoveredNode.relationshipType}`}>
              {hoveredNode.relationshipType.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Selected Node Details */}
      {selectedNode && !selectedNode.isCenter && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                className="h-16 w-16 rounded-full"
                src={selectedNode.avatar || 'https://via.placeholder.com/64'}
                alt={selectedNode.name}
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedNode.name}</h2>
                <p className="text-gray-600">{selectedNode.title}</p>
                {selectedNode.department && (
                  <p className="text-sm text-gray-500">{selectedNode.department}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Relationship Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium relationship-${selectedNode.relationshipType}`}>
                    {selectedNode.relationshipType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Added via:</span>
                  <span className="text-gray-900">{selectedNode.addedVia.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Added on:</span>
                  <span className="text-gray-900">{new Date(selectedNode.addedAt).toLocaleDateString()}</span>
                </div>
                {selectedNode.interactionCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interactions:</span>
                    <span className="text-gray-900">{selectedNode.interactionCount}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span>{formatDate(selectedNode.lastInteraction)}</span>
                </div>
                
                {selectedNode.sharedInterests && selectedNode.sharedInterests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Shared Interests</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.sharedInterests.map((interest, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedNode.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600">{selectedNode.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipMap; 