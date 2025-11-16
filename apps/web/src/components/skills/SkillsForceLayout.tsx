import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface Skill {
  id: string;
  name: string;
  category: 'ai/ml' | 'cloud-devops' | 'languages' | 'frameworks' | 'management';
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  category: 'ai/ml' | 'cloud-devops' | 'languages' | 'frameworks' | 'management';
  radius: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  'ai/ml': '#FFDDA1', 
  'cloud-devops': '#FFD151', 
  languages: '#F8C537', 
  frameworks: '#EDB230', 
  management: '#E77728', 
};

const CATEGORY_LABELS: Record<string, string> = {
  'ai/ml': 'AI/ML',
  'cloud-devops': 'Cloud & DevOps',
  languages: 'Languages',
  frameworks: 'Frameworks & Tools',
  management: 'Management',
};

interface SkillsForceLayoutProps {
  skills: Skill[];
  width?: number;
  height?: number;
}

export default function SkillsForceLayout({
  skills,
  width = 1200,
  height = 800,
}: SkillsForceLayoutProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);
  const nodesRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(['ai', 'cloud-devops', 'languages', 'frameworks', 'management'])
  );
  const [draggedNode, setDraggedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Stop previous simulation if it exists
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Clean up positions for skills that no longer exist
    const skillIds = new Set(skills.map((s) => s.id));
    nodesRef.current.forEach((_, id) => {
      if (!skillIds.has(id)) {
        nodesRef.current.delete(id);
      }
    });

    // Filter skills based on selected categories
    const filteredSkills = skills.filter((skill) =>
      selectedCategories.has(skill.category)
    );

    if (filteredSkills.length === 0) {
      return;
    }

    // Create nodes with radius based on name length
    // Restore positions from previous render if available
    const nodes: Node[] = filteredSkills.map((skill) => {
      const savedPos = nodesRef.current.get(skill.id);
      return {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        radius: Math.max(30, Math.min(60, skill.name.length * 3 + 20)),
        x: savedPos?.x,
        y: savedPos?.y,
      };
    });

    // Create SVG
    const svg = d3.select(svgRef.current);
    svg.attr('width', width).attr('height', height);

    // Create container group
    const container = svg.append('g');

    // Create force simulation with category-based positioning
    const categoryPositions: Record<string, { x: number; y: number }> = {
      ai: { x: width * 0.25, y: height * 0.25 },
      cloud: { x: width * 0.75, y: height * 0.25 },
      development: { x: width * 0.25, y: height * 0.75 },
      management: { x: width * 0.75, y: height * 0.75 },
    };

    // Check which nodes have saved positions (already positioned by user or simulation)
    const nodesWithSavedPositions = new Set(
      nodes.filter((n) => n.x !== undefined && n.y !== undefined).map((n) => n.id)
    );

    const centerX = width / 2;
    const centerY = height / 2;

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'charge',
        d3.forceManyBody().strength(-400)
      )
      .force(
        'collision',
        d3.forceCollide<Node>().radius((d) => d.radius + 8)
      )
      .force('center', d3.forceCenter(centerX, centerY).strength(0.15))
      .force(
        'x',
        d3
          .forceX<Node>((d) => {
            // For nodes with saved positions, pull towards center
            // For new nodes, use category positioning
            if (nodesWithSavedPositions.has(d.id)) {
              return centerX; // Pull towards center
            }
            return categoryPositions[d.category]?.x || centerX;
          })
          .strength((d) => {
            // Use moderate force for nodes with saved positions to pull towards center
            // Use stronger force for new nodes to position in clusters
            return nodesWithSavedPositions.has(d.id) ? 0.15 : 0.3;
          })
      )
      .force(
        'y',
        d3
          .forceY<Node>((d) => {
            // For nodes with saved positions, pull towards center
            // For new nodes, use category positioning
            if (nodesWithSavedPositions.has(d.id)) {
              return centerY; // Pull towards center
            }
            return categoryPositions[d.category]?.y || centerY;
          })
          .strength((d) => {
            // Use moderate force for nodes with saved positions to pull towards center
            // Use stronger force for new nodes to position in clusters
            return nodesWithSavedPositions.has(d.id) ? 0.15 : 0.3;
          })
      );

    // Group nodes by category for clustering
    // Only initialize positions if they don't exist (first render or new nodes)
    const categoryGroups = d3.group(nodes, (d) => d.category);

    categoryGroups.forEach((groupNodes, category) => {
      const clusterCenter = categoryPositions[category] || { x: width / 2, y: height / 2 };
      const angleStep = (2 * Math.PI) / groupNodes.length;
      const clusterRadius = Math.min(width, height) * 0.15;

      // Position nodes in a circle around cluster center only if they don't have a saved position
      groupNodes.forEach((node, i) => {
        if (node.x === undefined || node.y === undefined) {
          const angle = i * angleStep;
          node.x = clusterCenter.x + Math.cos(angle) * clusterRadius;
          node.y = clusterCenter.y + Math.sin(angle) * clusterRadius;
          // Save initial position immediately
          nodesRef.current.set(node.id, { x: node.x, y: node.y });
        }
      });
    });

    // Create node groups
    const nodeGroups = container
      .selectAll<SVGGElement, Node>('g.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            setDraggedNode(d);
            d3.select(event.sourceEvent.target).style('cursor', 'grabbing');
          })
          .on('drag', (event, d) => {
            // Constrain drag position within bounds
            const radius = d.radius;
            const minX = radius;
            const maxX = width - radius;
            const minY = radius;
            const maxY = height - radius;
            
            d.fx = Math.max(minX, Math.min(maxX, event.x));
            d.fy = Math.max(minY, Math.min(maxY, event.y));
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            setDraggedNode(null);
            d3.select(event.sourceEvent.target).style('cursor', 'grab');
          })
      )
      .style('cursor', 'grab');

    // Add circles
    nodeGroups
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => CATEGORY_COLORS[d.category] || '#999')
      .attr('opacity', 0.8)
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    // Add text labels with wrapping support using foreignObject
    nodeGroups.each(function (d) {
      const nodeGroup = d3.select(this);
      const radius = d.radius;
      const fontSize = Math.max(10, Math.min(14, radius / 3));
      const textWidth = radius * 1.8; // Max width for text wrapping
      const textHeight = radius * 2; // Max height for text
      
      // Use foreignObject for proper text wrapping
      const foreignObject = nodeGroup
        .append('foreignObject')
        .attr('width', textWidth)
        .attr('height', textHeight)
        .attr('x', -textWidth / 2)
        .attr('y', -radius)
        .attr('pointer-events', 'none');

      const textDiv = foreignObject
        .append('xhtml:div')
        .style('width', `${textWidth}px`)
        .style('height', '100%')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('justify-content', 'center')
        .style('text-align', 'center')
        .style('color', '#000')
        .style('font-size', `${fontSize}px`)
        .style('font-weight', '500')
        .style('font-family', 'system-ui, -apple-system, sans-serif')
        .style('line-height', '1.2')
        .style('word-wrap', 'break-word')
        .style('overflow-wrap', 'break-word')
        .style('hyphens', 'auto')
        .style('overflow', 'hidden')
        .style('text-overflow', 'ellipsis')
        .text(d.name);
    });

    // Store simulation reference
    simulationRef.current = simulation;

    // If nodes already have positions, start with lower alpha to prevent reset
    if (nodesWithSavedPositions.size > 0) {
      simulation.alpha(0.1); // Start with lower energy
    }

    // Update positions on simulation tick with boundary constraints
    simulation.on('tick', () => {
      nodes.forEach((node) => {
        // Constrain nodes within SVG bounds (accounting for radius)
        const radius = node.radius;
        const minX = radius;
        const maxX = width - radius;
        const minY = radius;
        const maxY = height - radius;

        // Clamp x and y positions to keep nodes fully visible
        if (node.x !== undefined) {
          node.x = Math.max(minX, Math.min(maxX, node.x));
        }
        if (node.y !== undefined) {
          node.y = Math.max(minY, Math.min(maxY, node.y));
        }

        // Save position for persistence
        if (node.x !== undefined && node.y !== undefined) {
          nodesRef.current.set(node.id, { x: node.x, y: node.y });
        }
      });

      nodeGroups.attr('transform', (d) => {
        const x = d.x ?? width / 2;
        const y = d.y ?? height / 2;
        return `translate(${x},${y})`;
      });
    });

    // Cleanup
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
        simulationRef.current = null;
      }
    };
  }, [skills, selectedCategories, width, height]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Filter buttons */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => toggleCategory(key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `2px solid ${CATEGORY_COLORS[key]}`,
              backgroundColor: selectedCategories.has(key)
                ? CATEGORY_COLORS[key]
                : 'transparent',
              color: '#000',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
            onMouseEnter={(e) => {
              if (!selectedCategories.has(key)) {
                e.currentTarget.style.backgroundColor = `${CATEGORY_COLORS[key]}20`;
              }
            }}
            onMouseLeave={(e) => {
              if (!selectedCategories.has(key)) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* SVG container with transparent background */}
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '50px',
        }}
      >
        <svg ref={svgRef} style={{ display: 'block' }} />
      </div>
    </div>
  );
}

