import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Locate } from 'lucide-react';
import { GEOJSON_URL, SANTA_PATH } from '../constants';
import { generateSantaStatus } from '../services/geminiService';
import { City } from '../types';

const SantaMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("Đang chuẩn bị xe trượt tuyết...");
  
  // Interaction State
  const targetLocationRef = useRef<City | null>(SANTA_PATH[0]);
  const currentIndexRef = useRef(0); // Ref to access current index inside D3 loop
  const isAutoFollowingRef = useRef(true);
  const [showRecenter, setShowRecenter] = useState(false);

  const [stats, setStats] = useState({
    speed: 3500,
    delivered: 14500000,
    temperature: -15
  });

  // Load GeoJSON
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(data => setGeoJsonData(data))
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  // Update Status & Location
  useEffect(() => {
    if (!SANTA_PATH[currentIndex]) return;
    targetLocationRef.current = SANTA_PATH[currentIndex];
    currentIndexRef.current = currentIndex; // Sync ref

    const updateStatus = async () => {
      const locName = SANTA_PATH[currentIndex].name;
      const newStatus = await generateSantaStatus(locName);
      setStatus(newStatus);
    };
    updateStatus();
    
    // Santa moves every 10 seconds
    const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % SANTA_PATH.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Simulation Loop
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setStats(prev => {
        const speedFluctuation = Math.floor(Math.random() * 100) - 50;
        let newSpeed = prev.speed + speedFluctuation;
        if (newSpeed < 2000) newSpeed = 2000 + Math.random() * 100;
        if (newSpeed > 6000) newSpeed = 6000 - Math.random() * 100;

        const presentsAdded = Math.floor(newSpeed / 10) + Math.floor(Math.random() * 50);

        const currentLoc = SANTA_PATH[currentIndex];
        let targetTemp = -20;
        if (currentLoc) {
             const latFactor = 1 - (Math.abs(currentLoc.lat) / 90);
             targetTemp = -30 + (latFactor * 55); 
        }
        const newTemp = prev.temperature + (targetTemp - prev.temperature) * 0.05;

        return {
          speed: newSpeed,
          delivered: prev.delivered + presentsAdded,
          temperature: Math.round(newTemp * 10) / 10
        };
      });
    }, 200);

    return () => clearInterval(simulationInterval);
  }, [currentIndex]);

  const handleRecenter = () => {
    isAutoFollowingRef.current = true;
    setShowRecenter(false);
  };

  // D3 Render & Interaction
  useEffect(() => {
    if (!geoJsonData || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // --- DEFINITIONS (Glow Filter) ---
    const defs = svg.append("defs");
    const filter = defs.append("filter")
        .attr("id", "glow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "2.5")
        .attr("result", "coloredBlur");
        
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    // ---------------------------------

    // Initial Setup
    const initialScale = height / 2.2;
    const projection = d3.geoOrthographic()
      .scale(initialScale)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const pathGenerator = d3.geoPath().projection(projection);

    // Behavior: Drag to Rotate
    const dragBehavior = d3.drag<SVGSVGElement, unknown>()
      .on("start", () => {
        isAutoFollowingRef.current = false;
        setShowRecenter(true);
        svg.style("cursor", "grabbing");
      })
      .on("drag", (event) => {
        const rotate = projection.rotate();
        const k = 75 / projection.scale();
        projection.rotate([
          rotate[0] + event.dx * k,
          rotate[1] - event.dy * k
        ]);
      })
      .on("end", () => {
        svg.style("cursor", "grab");
      });

    // Behavior: Zoom to Scale
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([200, 5000])
      .filter((event) => {
        // Prevent zoom on drag initiation
        if (event.type === 'mousedown') return false; 
        if (event.type === 'touchstart' && event.touches.length === 1) return false;
        return true;
      })
      .on("start", () => {
        isAutoFollowingRef.current = false;
        setShowRecenter(true);
      })
      .on("zoom", (event) => {
        projection.scale(event.transform.k);
      });

    svg.call(dragBehavior).call(zoomBehavior);
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(width/2, height/2).scale(initialScale).translate(-width/2, -height/2));

    const g = svg.append("g");

    // Ocean
    g.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", initialScale)
      .attr("class", "water-sphere")
      .style("fill", "#1e293b")
      .style("stroke", "none");

    // Land
    const land = g.append("g");
    land.selectAll("path")
      .data(geoJsonData.features)
      .enter()
      .append("path")
      .attr("d", (d: any) => pathGenerator(d))
      .style("fill", "#334155")
      .style("stroke", "#475569")
      .style("stroke-width", "0.5px");

    // --- TRAILS ---
    // Future Path (Dashed, Faint)
    const futureRoutePath = g.append("path")
      .style("fill", "none")
      .style("stroke", "#fbbf24")
      .style("stroke-width", 1)
      .style("stroke-dasharray", "4,4")
      .style("opacity", 0.3);

    // Visited Path (Solid, Glowing)
    const visitedRoutePath = g.append("path")
      .style("fill", "none")
      .style("stroke", "#fcd34d") // Amber/Gold
      .style("stroke-width", 2.5)
      .style("stroke-linecap", "round")
      .style("filter", "url(#glow)") // Apply the glow
      .style("opacity", 0.9);

    // Santa Marker Group
    const santaGroup = g.append("g");

    // Radar Pulse Effect
    const pulseCircle = santaGroup.append("circle")
        .attr("r", 8)
        .style("fill", "none")
        .style("stroke", "#ef4444")
        .style("stroke-width", 2)
        .style("opacity", 0);

    // Main Santa Dot
    santaGroup.append("circle")
        .attr("r", 6)
        .style("fill", "#dc2626")
        .style("stroke", "#fff")
        .style("stroke-width", 2);
    
    // Santa Icon
    santaGroup.append("text")
        .attr("y", -12)
        .attr("text-anchor", "middle")
        .style("fill", "white")
        .style("font-family", "sans-serif")
        .style("font-size", "14px")
        .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.8)")
        .text("🎅");

    // Pulse Animation Function
    const runPulse = () => {
        pulseCircle
            .attr("r", 6)
            .style("opacity", 0.8)
            .style("stroke-width", 2)
            .transition()
            .duration(1500)
            .ease(d3.easeCircleOut)
            .attr("r", 25)
            .style("opacity", 0)
            .style("stroke-width", 0)
            .on("end", runPulse);
    };
    runPulse();

    // Main Animation Loop
    let animationId: number;
    
    const animate = () => {
      const target = targetLocationRef.current;
      const idx = currentIndexRef.current;
      
      // Auto Follow interpolation
      if (isAutoFollowingRef.current && target) {
        const currentRotate = projection.rotate();
        const targetRotate = [-target.lng, -target.lat];
        
        // Smooth ease towards target
        const nextRotate: [number, number, number] = [
            currentRotate[0] + (targetRotate[0] - currentRotate[0]) * 0.05,
            currentRotate[1] + (targetRotate[1] - currentRotate[1]) * 0.05,
            0
        ];
        projection.rotate(nextRotate);
      }

      // Update Water Size
      g.select(".water-sphere").attr("r", projection.scale());

      // Update Land
      land.selectAll("path").attr("d", (d: any) => pathGenerator(d));

      // Calculate Path Segments
      // Visited: From start (0) to current index
      const visitedCoords = SANTA_PATH.slice(0, idx + 1).map(c => [c.lng, c.lat]);
      
      // Future: From current index to end
      const futureCoords = SANTA_PATH.slice(idx).map(c => [c.lng, c.lat]);

      // Draw Future Route
      futureRoutePath
          .datum({ type: "LineString", coordinates: futureCoords })
          .attr("d", (d: any) => pathGenerator(d));

      // Draw Visited Route
      if (visitedCoords.length > 1) {
          visitedRoutePath
            .datum({ type: "LineString", coordinates: visitedCoords })
            .attr("d", (d: any) => pathGenerator(d));
      } else {
          visitedRoutePath.attr("d", null);
      }
      
      // Update Santa Position
      if (target) {
        const santaPos = projection([target.lng, target.lat]);
        if (santaPos) {
            santaGroup.attr("transform", `translate(${santaPos[0]}, ${santaPos[1]})`);
            
            // Check visibility (occlusion by globe)
            const center = [width/2, height/2];
            const dist = Math.sqrt(Math.pow(santaPos[0] - center[0], 2) + Math.pow(santaPos[1] - center[1], 2));
            const isVisible = dist <= projection.scale();

            santaGroup.style("opacity", isVisible ? 1 : 0);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [geoJsonData]);

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur border border-white/20 p-4 rounded-xl max-w-xs shadow-xl min-w-[280px]">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Vị trí hiện tại</h3>
        <p className="text-2xl font-bold text-white font-christmas tracking-wide">{SANTA_PATH[currentIndex]?.name || "Không xác định"}</p>
        <div className="mt-3">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">Trạng thái</h3>
          <p className="text-sm text-yellow-300 italic min-h-[40px]">"{status}"</p>
        </div>
        
        <div className="mt-4 space-y-3">
            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <span className="text-gray-400 text-xs uppercase">Tốc độ</span>
                <span className="font-mono font-bold text-green-400">{stats.speed.toLocaleString()} km/h</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                 <span className="text-gray-400 text-xs uppercase">Quà đã phát</span>
                 <span className="font-mono font-bold text-red-400 text-lg">{stats.delivered.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end">
                 <span className="text-gray-400 text-xs uppercase">Nhiệt độ</span>
                 <span className="font-mono font-bold text-blue-300">{Math.round(stats.temperature)}°C</span>
            </div>
        </div>
      </div>
      
      {showRecenter && (
        <button 
            onClick={handleRecenter}
            className="absolute bottom-6 right-6 z-10 bg-red-600 hover:bg-red-500 text-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-110 animate-bounce"
        >
            <Locate size={20} />
            <span className="text-sm font-bold">Về vị trí Ông Già Noel</span>
        </button>
      )}

      <div ref={containerRef} className="flex-1 w-full min-h-[400px]">
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing"></svg>
      </div>
    </div>
  );
};

export default SantaMap;