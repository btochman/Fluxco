"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DesignCalculationLoaderProps {
  onComplete: () => void;
  ratedPower: number;
  primaryVoltage: number;
  secondaryVoltage: number;
}

// Real electromagnetic and transformer design equations
const equations = [
  { category: "Faraday's Law", equation: "E = -N × dΦ/dt", description: "Induced EMF" },
  { category: "Magnetic Flux", equation: "Φ = B × A", description: "Core flux" },
  { category: "Ampere's Law", equation: "∮H·dl = N×I", description: "MMF" },
  { category: "Turns Ratio", equation: "a = N₁/N₂ = V₁/V₂", description: "Ratio" },
  { category: "EMF Equation", equation: "E = 4.44 × f × N × Φₘ", description: "RMS voltage" },
  { category: "Flux Density", equation: "Bₘ = E/(4.44×f×N×Aᶜ)", description: "Peak B" },
  { category: "Core Area", equation: "Aᶜ = √(kVA)/(K×Bₘ×f)", description: "Cross-section" },
  { category: "Window Area", equation: "Aᵥ = (N₁I₁ + N₂I₂)/(J×Kᵥ)", description: "Winding space" },
  { category: "Core Weight", equation: "Wᶜ = ρ × Vᶜ × Sᶠ", description: "Mass calc" },
  { category: "Steinmetz", equation: "Pᶜₒᵣₑ = Kₕ×f×Bⁿ + Kₑ×f²×B²", description: "Core loss" },
  { category: "Copper Loss", equation: "Pᶜᵤ = I₁²R₁ + I₂²R₂", description: "I²R losses" },
  { category: "Stray Loss", equation: "Pₛₜᵣₐᵧ = Kₛ × (I × H)²", description: "Eddy current" },
  { category: "Total Loss", equation: "Pₜₒₜₐₗ = Pₙₗ + Pₗₗ", description: "Sum losses" },
  { category: "Reactance", equation: "Xₗ = 2πf×μ₀×N²×(Lₘₜ/3h)", description: "Leakage X" },
  { category: "Impedance", equation: "Z% = (Vₛᶜ/Vᵣₐₜₑ)×100", description: "Short-circuit" },
  { category: "Resistance", equation: "R = ρ×L/A", description: "DC resistance" },
  { category: "Heat Transfer", equation: "Q = h×A×ΔT", description: "Convection" },
  { category: "Hot Spot", equation: "θₕₛ = θₒᵢₗ + Δθₕₛ", description: "Temp rise" },
  { category: "Thermal τ", equation: "τ = m×Cₚ/(h×A)", description: "Time const" },
  { category: "Efficiency", equation: "η = Pₒᵤₜ/(Pₒᵤₜ + Pₗₒₛₛ)", description: "Power ratio" },
  { category: "Regulation", equation: "%VR = (Vₙₗ - Vₗ)/Vₗ×100", description: "Volt reg" },
  { category: "Max η", equation: "Pₙₗ = Pₗₗ at η_max", description: "Optimal load" },
  { category: "Material $", equation: "Cₘ = Σ(Wᵢ × $ᵢ)", description: "Raw cost" },
  { category: "Lifecycle", equation: "LCC = C₀ + Σ(Pₗₒₛₛ×$/kWh×t)", description: "Total cost" },
  { category: "Payback", equation: "t = ΔC₀/(ΔPₗₒₛₛ×$/kWh×8760)", description: "ROI years" },
  { category: "SC Force", equation: "Fₛᶜ = (2πf×Iₛᶜ)²×L/h", description: "Winding F" },
  { category: "Tank σ", equation: "σ = P×r/t", description: "Vessel stress" },
  { category: "Oil Vol", equation: "Vₒᵢₗ = Vₜₐₙₖ - Vₐᶜₜᵢᵥₑ", description: "Fluid capacity" },
  { category: "BIL", equation: "V_BIL = k × V_rated", description: "Insulation" },
  { category: "Eddy", equation: "Pₑ = (π²×d²×f²×B²)/(6×ρ)", description: "Eddy loss" },
];

const calculationPhases = [
  { name: "Initializing Design Engine", duration: 500 },
  { name: "Computing Core Geometry", duration: 800 },
  { name: "Calculating Magnetic Circuit", duration: 900 },
  { name: "Optimizing Winding Design", duration: 1000 },
  { name: "Analyzing Losses & Efficiency", duration: 1200 },
  { name: "Thermal Modeling", duration: 800 },
  { name: "Impedance Calculations", duration: 700 },
  { name: "Cost Analysis", duration: 600 },
  { name: "Generating Technical Drawings", duration: 500 },
];

// Generate grid-based positions to prevent overlap
function getGridPosition(index: number, total: number) {
  // Use a grid layout: 6 columns x 5 rows = 30 slots
  const cols = 6;
  const rows = 5;
  const slot = index % (cols * rows);
  const col = slot % cols;
  const row = Math.floor(slot / cols);
  // Each cell gets a base position with slight jitter
  const seed = index * 7919;
  const jitterX = ((seed * 13) % 6) - 3; // -3 to 3%
  const jitterY = ((seed * 17) % 4) - 2; // -2 to 2%
  const x = (col / cols) * 80 + 8 + jitterX; // spread across 8-88%
  const y = (row / rows) * 65 + 8 + jitterY; // spread across 8-73%
  const rotation = ((seed % 16) - 8); // -8 to 8 degrees (subtler)
  const scale = 0.85 + ((seed % 20) / 100); // 0.85 to 1.05
  return { x, y, rotation, scale };
}

export function DesignCalculationLoader({
  onComplete,
  ratedPower,
  primaryVoltage,
  secondaryVoltage
}: DesignCalculationLoaderProps) {
  const [visibleEquations, setVisibleEquations] = useState<number[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  // Shuffle equations and assign random positions
  const equationsWithPositions = useMemo(() => {
    const shuffled = [...equations].sort(() => Math.random() - 0.5);
    return shuffled.map((eq, i) => ({
      ...eq,
      position: getGridPosition(i, shuffled.length)
    }));
  }, []);

  const turnsRatio = (primaryVoltage / secondaryVoltage).toFixed(2);
  const estimatedCurrent = ((ratedPower * 1000) / (Math.sqrt(3) * secondaryVoltage)).toFixed(1);

  useEffect(() => {
    const totalDuration = 7000;
    const equationInterval = totalDuration / equations.length;

    // Add equations one by one with slight randomization
    const equationTimers = equationsWithPositions.map((_, index) => {
      const randomDelay = Math.random() * 200; // Add 0-200ms random delay
      return setTimeout(() => {
        setVisibleEquations(prev => [...prev, index]);
      }, index * equationInterval * 0.7 + randomDelay);
    });

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1.5, 100));
    }, totalDuration / 70);

    // Phase progression
    let phaseTime = 0;
    const phaseTimers = calculationPhases.map((phase, index) => {
      const timer = setTimeout(() => {
        setCurrentPhase(index);
      }, phaseTime);
      phaseTime += phase.duration;
      return timer;
    });

    // Complete after 7 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => {
      equationTimers.forEach(clearTimeout);
      phaseTimers.forEach(clearTimeout);
      clearInterval(progressInterval);
      clearTimeout(completeTimer);
    };
  }, [onComplete, equationsWithPositions]);

  return (
    <div className="fixed inset-0 z-50 bg-background/98 backdrop-blur-md overflow-hidden">
      {/* Floating Equations - Random Positions */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {visibleEquations.map((eqIndex) => {
            const eq = equationsWithPositions[eqIndex];
            const pos = eq.position;
            return (
              <motion.div
                key={eqIndex}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: '-50%',
                  y: '-50%'
                }}
                animate={{
                  opacity: [0, 0.9, 0.7],
                  scale: [0, pos.scale * 1.1, pos.scale],
                  x: '-50%',
                  y: '-50%'
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `rotate(${pos.rotation}deg)`,
                }}
                className="pointer-events-none"
              >
                <div
                  className="px-2 py-1"
                  style={{ transform: `rotate(${pos.rotation}deg)` }}
                >
                  <div className="text-[8px] text-muted-foreground/60 uppercase tracking-wider">
                    {eq.category}
                  </div>
                  <div className="font-mono text-sm text-foreground/50 font-medium whitespace-nowrap">
                    {eq.equation}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-xl mx-4 bg-background/95 border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Designing Your {ratedPower} kVA Transformer
            </h2>
            <p className="text-sm text-muted-foreground">
              {primaryVoltage.toLocaleString()}V / {secondaryVoltage}V • Ratio: {turnsRatio}:1 • I₂: {estimatedCurrent}A
            </p>
          </motion.div>

          {/* Current Phase */}
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-full px-5 py-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary font-medium text-sm">
                {calculationPhases[currentPhase]?.name || "Finalizing..."}
              </span>
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-accent to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Processing electromagnetic analysis...</span>
              <span className="font-mono font-medium">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-primary font-bold text-lg">{visibleEquations.length}</div>
              <div className="text-muted-foreground">Equations</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-primary font-bold text-lg">{currentPhase + 1}/9</div>
              <div className="text-muted-foreground">Phase</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-primary font-bold text-lg">~{Math.round(7 - progress * 0.07)}s</div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export default DesignCalculationLoader;
